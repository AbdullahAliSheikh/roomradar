import { useState } from "react";
import { Navigate, useNavigate } from "@tanstack/react-router";
import Layout from "./Layout.jsx";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, ImagePlus } from "lucide-react";

export default function UploadAd() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        user_id: user.id,
        title: String(fd.get("title")).trim().slice(0, 120),
        city: "",
        location: String(fd.get("location")).trim().slice(0, 200),
        floor: parseInt(fd.get("floor")) || 0,
        length_ft: parseFloat(fd.get("length_ft")),
        width_ft: parseFloat(fd.get("width_ft")),
        occupancy: parseInt(fd.get("occupancy")) || 1,
        rent_monthly: fd.get("rent_monthly") ? parseFloat(fd.get("rent_monthly")) : null,
        description: String(fd.get("description") || "").trim().slice(0, 1000),
        photo_url: null,
      };
      if (!payload.title || !payload.location || !payload.length_ft || !payload.width_ft) {
        throw new Error("Please fill the required fields");
      }

      if (file) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("room-photos").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("room-photos").getPublicUrl(path);
        payload.photo_url = pub.publicUrl;
      }

      const { error } = await supabase.from("ads").insert(payload);
      if (error) throw error;
      toast.success("Ad posted!");
      nav({ to: "/browse" });
    } catch (err) {
      toast.error(err.message || "Could not post ad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Post your room</h1>
        <p className="mb-6 text-sm text-muted-foreground">Tell potential roommates about the space.</p>

        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
          <div>
            <Label>Photo of the room</Label>
            <label className="mt-1.5 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 hover:border-primary">
              {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" /><span className="text-sm">Click to upload (max 5MB)</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          </div>

          <Field label="Title *"><Input name="title" required maxLength={120} placeholder="Sunny bedroom in DHA Phase 5" /></Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Address / area *"><Input name="location" required maxLength={200} placeholder="Block H, Phase 5" /></Field>
            <Field label="Floor"><Input name="floor" type="number" min="0" defaultValue="0" /></Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Length (ft) *"><Input name="length_ft" type="number" step="0.5" min="1" required /></Field>
            <Field label="Width (ft) *"><Input name="width_ft" type="number" step="0.5" min="1" required /></Field>
            <Field label="People in the room (including you) *"><Input name="occupancy" type="number" min="1" max="10" defaultValue="1" required /></Field>
          </div>

          <Field label="Monthly rent (PKR)"><Input name="rent_monthly" type="number" min="0" placeholder="optional" /></Field>
          <Field label="Anything else?"><Textarea name="description" maxLength={1000} rows={4} placeholder="Furnished, wifi, attached bath, no pets…" /></Field>

          <Button type="submit" disabled={busy} className="w-full" size="lg" style={{ background: "var(--gradient-warm)" }}>
            <Upload className="mr-2 h-4 w-4" /> {busy ? "Posting…" : "Post ad"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}