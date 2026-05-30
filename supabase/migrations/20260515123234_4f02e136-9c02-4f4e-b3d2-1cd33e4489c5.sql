ALTER TABLE public.ads ADD COLUMN boosted_until timestamptz;
UPDATE public.ads SET boosted_until = now() + interval '10 days' WHERE boosted = true AND boosted_until IS NULL;

CREATE OR REPLACE FUNCTION public.expire_boosts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.ads SET boosted = false WHERE boosted = true AND boosted_until IS NOT NULL AND boosted_until <= now();
$$;