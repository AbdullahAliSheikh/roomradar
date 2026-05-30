import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { User, Phone, Mail, FileText, LogOut, Save, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Account() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [adCount, setAdCount] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("ads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      setProfile(p);
      setDisplayName(p?.display_name ?? "");
      setPhone(p?.phone ?? "");
      setAdCount(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (phone && !/^[+\d][\d\s\-()]{6,19}$/.test(phone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, phone: phone.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  };

  if (loading || !user) {
    return <div className="text-muted-foreground">Loading…</div>;
  }

  const initial = (displayName || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => (window.history.length > 1 ? window.history.back() : nav({ to: "/" }))}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 place-items-center rounded-full text-2xl font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-warm)" }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : initial}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold truncate">{displayName || "Your account"}</h1>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat icon={FileText} label="Active ads" value={adCount} />
          <Stat icon={Phone} label="Phone" value={phone ? "Set" : "—"} />
          <Stat icon={Mail} label="Email" value="Verified" />
        </div>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] space-y-4">
        <h2 className="font-display text-lg font-semibold">Profile details</h2>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" value={user.email ?? ""} disabled className="pl-9" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" maxLength={60} className="pl-9" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +92 300 1234567" maxLength={20} className="pl-9" />
          </div>
          <p className="text-xs text-muted-foreground">Shown on your ads so people can contact you.</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving} style={{ background: "var(--gradient-warm)" }}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </form>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}