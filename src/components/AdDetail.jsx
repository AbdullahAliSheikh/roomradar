import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "@tanstack/react-router";
import Layout from "./Layout.jsx";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Maximize2, Layers, MessageCircle, ArrowLeft, Send, Trash2, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdDetail() {
  const { user, loading } = useAuth();
  const { id } = useParams({ from: "/ad/$id" });
  const nav = useNavigate();
  const [ad, setAd] = useState(null);
  const [owner, setOwner] = useState(null);
  const [busy, setBusy] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const endRef = useRef(null);
  const [deleting, setDeleting] = useState(false);
  const [boosting, setBoosting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: a } = await supabase.from("ads").select("*").eq("id", id).maybeSingle();
      setAd(a);
      if (a) {
        const { data: p } = await supabase.from("profiles").select("display_name, avatar_url, phone").eq("id", a.user_id).maybeSingle();
        setOwner(p);
      }
      setBusy(false);
    })();
  }, [id, user]);

  // Load or create conversation + subscribe to messages once ad is loaded
  useEffect(() => {
    if (!user || !ad || ad.user_id === user.id || !chatOpen) return;
    let channel;
    (async () => {
      const { data: existing } = await supabase
        .from("conversations").select("id")
        .eq("ad_id", ad.id).eq("seeker_id", user.id).maybeSingle();
      if (existing) {
        setConversationId(existing.id);
        const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", existing.id).order("created_at", { ascending: true });
        setMessages(msgs || []);
        channel = supabase
          .channel(`messages:${existing.id}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${existing.id}` },
            (payload) => setMessages((m) => [...m, payload.new]))
          .subscribe();
      }
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [ad, user, chatOpen]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const { data, error } = await supabase.from("conversations")
      .insert({ ad_id: ad.id, ad_owner_id: ad.user_id, seeker_id: user.id })
      .select("id").single();
    if (error) { toast.error(error.message); return null; }
    setConversationId(data.id);
    const channel = supabase
      .channel(`messages:${data.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${data.id}` },
        (payload) => setMessages((m) => [...m, payload.new]));
    channel.subscribe();
    return data.id;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const body = text.trim().slice(0, 2000);
    if (!body) return;
    setChatLoading(true);
    const cid = await ensureConversation();
    if (!cid) { setChatLoading(false); return; }
    setText("");
    const { error } = await supabase.from("messages").insert({ conversation_id: cid, sender_id: user.id, body });
    if (error) { toast.error(error.message); setText(body); }
    setChatLoading(false);
  };

  const deleteAd = async () => {
    if (!confirm("Delete this ad permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      if (ad.photo_url) {
        const marker = "/room-photos/";
        const idx = ad.photo_url.indexOf(marker);
        if (idx !== -1) {
          const path = decodeURIComponent(ad.photo_url.slice(idx + marker.length));
          await supabase.storage.from("room-photos").remove([path]);
        }
      }
      const { error } = await supabase.from("ads").delete().eq("id", ad.id);
      if (error) throw error;
      toast.success("Ad deleted");
      nav({ to: "/browse" });
    } catch (err) {
      toast.error(err.message || "Could not delete ad");
      setDeleting(false);
    }
  };

  const toggleBoost = async () => {
    setBoosting(true);
    const next = !ad.boosted;
    const { error } = await supabase.from("ads").update({ boosted: next }).eq("id", ad.id);
    setBoosting(false);
    if (error) { toast.error(error.message); return; }
    setAd({ ...ad, boosted: next });
    toast.success(next ? "Ad boosted! It will now appear first." : "Boost removed");
  };

  if (busy) return <Layout><p className="text-muted-foreground">Loading…</p></Layout>;
  if (!ad) return <Layout><p>Ad not found.</p></Layout>;

  if (chatOpen && ad.user_id !== user.id) {
    return (
      <Layout>
        <Button variant="ghost" onClick={() => setChatOpen(false)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Chat with {owner?.display_name || "poster"}</h2>
          </div>
          <div className="h-[28rem] overflow-y-auto rounded-2xl border border-border/60 bg-muted/30 p-3">
            {messages.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No messages yet. Say hello 👋</p>
            ) : (
              <ul className="space-y-2">
                {messages.map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${mine ? "text-primary-foreground" : "bg-background text-foreground border border-border/60"}`}
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
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={2000} disabled={chatLoading} />
            <Button type="submit" disabled={chatLoading || !text.trim()} style={{ background: "var(--gradient-warm)" }}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <Button variant="ghost" onClick={() => nav({ to: "/browse" })} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-[var(--shadow-soft)]">
          {ad.photo_url ? <img src={ad.photo_url} alt={ad.title} className="h-full w-full object-cover" /> : <div className="aspect-[4/3] grid place-items-center text-muted-foreground">No photo</div>}
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">{ad.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /> {ad.location}, {ad.city}</p>
          {ad.rent_monthly && <p className="mt-3 text-2xl font-semibold text-primary">PKR {Number(ad.rent_monthly).toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> /month</span></p>}

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat icon={Maximize2} label="Size" value={`${ad.length_ft}ft × ${ad.width_ft}ft`} />
            <Stat icon={Users} label="People" value={ad.occupancy} />
            <Stat icon={Layers} label="Floor" value={ad.floor} />
          </div>

          {ad.description && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{ad.description}</p>}

          <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Posted by</p>
            <p className="font-medium">{owner?.display_name || "Anonymous"}</p>
            {owner?.phone && (
              <a href={`tel:${owner.phone}`} className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <Phone className="h-4 w-4" /> {owner.phone}
              </a>
            )}
          </div>

          {ad.user_id === user.id && (
            <div className="mt-5 space-y-3">
              <p className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-center text-sm text-muted-foreground">
                This is your own ad — others will see a chat button here.
              </p>
              <Button
                onClick={toggleBoost}
                disabled={boosting}
                className="w-full font-bold text-primary-foreground"
                style={{ background: ad.boosted ? "linear-gradient(135deg,#9ca3af,#6b7280)" : "linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)" }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {boosting ? "Updating…" : ad.boosted ? "Remove boost" : "Boost this ad"}
              </Button>
              <Button variant="destructive" onClick={deleteAd} disabled={deleting} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> {deleting ? "Deleting…" : "Delete ad"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {ad.user_id !== user.id && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => setChatOpen(true)} size="lg" style={{ background: "var(--gradient-warm)" }} className="text-primary-foreground">
            <MessageCircle className="mr-2 h-5 w-5" /> Chat with {owner?.display_name || "poster"}
          </Button>
        </div>
      )}
    </Layout>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3">
      <Icon className="mb-1 h-4 w-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}