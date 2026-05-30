
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ads
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  city text not null,
  location text not null,
  floor int not null default 0,
  length_ft numeric not null,
  width_ft numeric not null,
  occupancy int not null default 1,
  rent_monthly numeric,
  description text,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.ads enable row level security;

create policy "ads viewable by authenticated"
  on public.ads for select to authenticated using (true);
create policy "users insert own ads"
  on public.ads for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own ads"
  on public.ads for update to authenticated using (auth.uid() = user_id);
create policy "users delete own ads"
  on public.ads for delete to authenticated using (auth.uid() = user_id);

create index ads_created_at_idx on public.ads (created_at desc);
create index ads_city_idx on public.ads (city);

-- conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  ad_owner_id uuid not null references auth.users(id) on delete cascade,
  seeker_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (ad_id, seeker_id)
);
alter table public.conversations enable row level security;

create policy "participants view conversations"
  on public.conversations for select to authenticated
  using (auth.uid() = ad_owner_id or auth.uid() = seeker_id);
create policy "seeker creates conversation"
  on public.conversations for insert to authenticated
  with check (auth.uid() = seeker_id);
create policy "participants update conversation"
  on public.conversations for update to authenticated
  using (auth.uid() = ad_owner_id or auth.uid() = seeker_id);

-- messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

create policy "participants view messages"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.ad_owner_id = auth.uid() or c.seeker_id = auth.uid())
  ));
create policy "participants send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.ad_owner_id = auth.uid() or c.seeker_id = auth.uid())
    )
  );

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- bump conversation last_message_at
create or replace function public.bump_conversation()
returns trigger language plpgsql as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;
create trigger on_message_insert
  after insert on public.messages
  for each row execute function public.bump_conversation();

-- realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- storage bucket
insert into storage.buckets (id, name, public) values ('room-photos', 'room-photos', true)
on conflict (id) do nothing;

create policy "room photos public read"
  on storage.objects for select using (bucket_id = 'room-photos');
create policy "users upload room photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'room-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update own room photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'room-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete own room photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'room-photos' and auth.uid()::text = (storage.foldername(name))[1]);
