
import cuteLogo from "@/assets/cute_logo.png";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import Layout from "./Layout.jsx";
import AdCard from "./AdCard.jsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Shuffle, ArrowRight, ArrowLeft, X, Sparkles, TrendingUp, Share2 } from "lucide-react";
import { matchScore } from "@/lib/match";

const STORAGE_KEY = "rr_prefs";
const BOOST_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfGR7fzg-1hsEFz-ND3YDw2yANnLv4U8SGpoRWdFCEzdLuoNA/viewform?usp=sharing&ouid=115599605097984911295";

const QUESTIONS = [
  { key: "location", label: "Which area/location are you looking in?", placeholder: "e.g. DHA Phase 5, Gulberg", type: "text" },
  { key: "maxRent", label: "What's your maximum monthly rent (PKR)?", placeholder: "e.g. 25000", type: "number" },
  { key: "occupancy", label: "How many people will share the room?", placeholder: "1, 2, 3…", type: "number", min: 1, max: 10 },
  { key: "maxFloor", label: "Highest floor you're willing to climb?", placeholder: "0 = ground only", type: "number", min: 0 },
];

export default function BrowseAds() {
  const { user, loading } = useAuth();
  const [ads, setAds] = useState([]);
  const [busy, setBusy] = useState(true);
  const [prefs, setPrefs] = useState(null);
  const [open, setOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      setBusy(true);
      const { data } = await supabase
        .from("ads")
        .select("*")
        .order("boosted", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);
      const now = Date.now();
      const list = (data || []).map((a) => ({
        ...a,
        boosted: !!a.boosted && (!a.boosted_until || new Date(a.boosted_until).getTime() > now),
      }));
      const ids = [...new Set(list.map((a) => a.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, phone").in("id", ids);
        const map = new Map((profs || []).map((p) => [p.id, p.phone]));
        setAds(list.map((a) => ({ ...a, owner_phone: map.get(a.user_id) || null })));
      } else {
        setAds(list);
      }
      setBusy(false);
    })();
  }, []);

  const ranked = useMemo(() => {
    if (!prefs) {
      const boosted = ads.filter((a) => a.boosted);
      const rest = [...ads.filter((a) => !a.boosted)].sort(() => Math.random() - 0.5);
      return [...boosted, ...rest];
    }
    return [...ads]
      .map((a) => ({ ad: a, score: matchScore(a, prefs) }))
      .sort((a, b) => {
        if (!!b.ad.boosted !== !!a.ad.boosted) return b.ad.boosted ? 1 : -1;
        return b.score - a.score;
      });
  }, [ads, prefs]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Browse rooms</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {prefs ? "Sorted by your match score." : "A random mix of available rooms. Tap the search bar to find your best match."}
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <img src={cuteLogo} alt="Radar" className="h-24 w-24 object-contain" />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex flex-1 items-center gap-3 rounded-full border border-border/60 bg-card px-5 py-3 text-left shadow-[var(--shadow-soft)] transition-all hover:border-primary hover:shadow-[var(--shadow-warm)]"
        >
          <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          <span className="flex-1 text-sm text-muted-foreground">
            {prefs
              ? `${prefs.location || "Any area"} · up to PKR ${prefs.maxRent || "∞"} · ${prefs.occupancy || "any"} ppl`
              : "Search rooms — answer a few quick questions"}
          </span>
          {prefs && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setPrefs(null); localStorage.removeItem(STORAGE_KEY); }}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </span>
          )}
        </button>
        <Button variant="outline" size="icon" onClick={() => setAds((a) => [...a].sort(() => Math.random() - 0.5))} aria-label="Shuffle">
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      <SearchWizard
        open={open}
        onOpenChange={setOpen}
        initial={prefs}
        onComplete={(p) => {
          setPrefs(p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          setOpen(false);
        }}
      />

      {/* Boost Info Modal */}
      <Dialog open={boostOpen} onOpenChange={setBoostOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              What boosting your ad does for you
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm">Your ad will appear at the <strong>top</strong> with other boosted ads</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
              <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm">Your ad will be <strong>forwarded to 10 Facebook groups</strong> in your area</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
              <p className="text-sm">Your ad will <strong>glow</strong> to attract more people browsing</p>
            </div>

            <div className="rounded-xl border border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center">
              <p className="text-sm text-muted-foreground">Fee for 10 days boost</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">PKR 299</p>
            </div>

            <Button
              className="w-full"
              style={{ background: "var(--gradient-warm)" }}
              onClick={() => window.open(BOOST_FORM_URL, "_blank")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Confirm Boost
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {busy ? (
        <p className="text-muted-foreground">Loading rooms…</p>
      ) : ranked.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No ads yet. Be the first to post a room!
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((item) => {
            const ad = item.ad ?? item;
            const score = item.score;
            return <AdCard key={ad.id} ad={ad} score={score} onBoost={() => setBoostOpen(true)} />;
          })}
        </div>
      )}
    </Layout>
  );
}

function SearchWizard({ open, onOpenChange, initial, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initial || {});

  useEffect(() => {
    if (open) {
      setStep(0);
      setAnswers(initial || {});
    }
  }, [open, initial]);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const value = answers[q.key] ?? "";

  const next = () => {
    if (isLast) onComplete(answers);
    else setStep((s) => s + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find your best match</DialogTitle>
        </DialogHeader>

        <div className="mt-2 mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
        </div>
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%`, background: "var(--gradient-warm)" }} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-base">{q.label}</Label>
            <Input
              autoFocus
              type={q.type}
              min={q.min}
              max={q.max}
              placeholder={q.placeholder}
              value={value}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              {!isLast && (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s + 1)}>Skip</Button>
              )}
              <Button type="submit" style={{ background: "var(--gradient-warm)" }}>
                {isLast ? "See matches" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}