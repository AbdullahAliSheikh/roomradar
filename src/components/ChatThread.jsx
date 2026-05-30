import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "@tanstack/react-router";
import Layout from "./Layout.jsx";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export default function ChatThread() {
  const { user, loading } = useAuth();
  const { id } = useParams({ from: "/chat/$id" });
  const nav = useNavigate();
  const [meta, setMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: conv } = await supabase.from("conversations").select("id, ad:ads(id, title), ad_owner_id, seeker_id").eq("id", id).maybeSingle();
      if (!conv) return setBusy(false);
      const otherId = conv.ad_owner_id === user.id ? conv.seeker_id : conv.ad_owner_id;
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", otherId).maybeSingle();
      setMeta({ ...conv, other: p?.display_name || "User" });
      const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true });
      setMessages(msgs || []);
      setBusy(false);
      try {
        localStorage.setItem(`chat_seen_${user.id}_${id}`, new Date().toISOString());
        window.dispatchEvent(new Event("chat-seen"));
      } catch {}
    })();

    const channel = supabase
      .channel(`messages:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          setMessages((m) => [...m, payload.new]);
          try {
            localStorage.setItem(`chat_seen_${user.id}_${id}`, new Date().toISOString());
            window.dispatchEvent(new Event("chat-seen"));
          } catch {}
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim().slice(0, 2000);
    if (!body) return;
    setText("");
    const { error } = await supabase.from("messages").insert({ conversation_id: id, sender_id: user.id, body });
    if (error) { toast.error(error.message); setText(body); }
  };

  if (busy) return <Layout><p className="text-muted-foreground">Loading…</p></Layout>;
  if (!meta) return <Layout><p>Conversation not found.</p></Layout>;

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
        <div className="mb-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav({ to: "/chat" })}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <p className="font-display text-lg font-semibold">{meta.other}</p>
            <p className="text-xs text-muted-foreground">{meta.ad?.title}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card p-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Say hello 👋</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => {
                const mine = m.sender_id === user.id;
                return (
                  <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${mine ? "text-primary-foreground" : "bg-muted text-foreground"}`}
                      style={mine ? { background: "var(--gradient-warm)" } : {}}
                    >
                      {m.body}
                    </div>
                  </li>
                );
              })}
              <div ref={endRef} />
            </ul>
          )}
        </div>

        <form onSubmit={send} className="mt-3 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={2000} />
          <Button type="submit" style={{ background: "var(--gradient-warm)" }}><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </Layout>
  );
}