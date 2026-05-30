import { useEffect, useState } from "react";
import { Link, Navigate } from "@tanstack/react-router";
import Layout from "./Layout.jsx";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";

export default function ChatList() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("conversations")
        .select("id, last_message_at, ad:ads(id, title, photo_url, city), seeker_id, ad_owner_id")
        .order("last_message_at", { ascending: false });
      const enriched = await Promise.all((data || []).map(async (c) => {
        const otherId = c.ad_owner_id === user.id ? c.seeker_id : c.ad_owner_id;
        const { data: p } = await supabase.from("profiles").select("display_name").eq("id", otherId).maybeSingle();
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("body, sender_id, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return { ...c, other: p?.display_name || "User", lastMsg };
      }));
      setItems(enriched);
      setBusy(false);
    })();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <Layout>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Messages</h1>
      {busy ? <p className="text-muted-foreground">Loading…</p> : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <MessageCircle className="mx-auto mb-3 h-8 w-8" />
          No conversations yet. Start one by messaging an ad poster.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id}>
              <Link to="/chat/$id" params={{ id: c.id }} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition hover:bg-accent">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted">
                  {c.ad?.photo_url ? <img src={c.ad.photo_url} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.other}</p>
                  <p className="truncate text-sm text-muted-foreground">{c.ad?.title} · {c.ad?.city}</p>
                  {c.lastMsg && (
                    <p className="mt-1 truncate text-sm text-foreground/80">
                      <span className="text-muted-foreground">{c.lastMsg.sender_id === user.id ? "You: " : ""}</span>
                      {c.lastMsg.body}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}