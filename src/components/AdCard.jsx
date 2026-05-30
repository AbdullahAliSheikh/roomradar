// import { Link } from "@tanstack/react-router";
// import { MapPin, Users, Maximize2, Layers, Phone, Sparkles } from "lucide-react";
// import { useState } from "react";
// import { useAuth } from "@/lib/auth.jsx";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";

// export default function AdCard({ ad, score }) {
//   const { user } = useAuth();
//   const isActive = (a) => !!a.boosted && (!a.boosted_until || new Date(a.boosted_until) > new Date());
//   const [boosted, setBoosted] = useState(isActive(ad));
//   const [boosting, setBoosting] = useState(false);
//   const isOwner = user?.id === ad.user_id;

//   const toggleBoost = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setBoosting(true);
//     const next = !boosted;
//     const boosted_until = next ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() : null;
//     const { error } = await supabase.from("ads").update({ boosted: next, boosted_until }).eq("id", ad.id);
//     setBoosting(false);
//     if (error) { toast.error(error.message); return; }
//     setBoosted(next);
//     ad.boosted = next;
//     ad.boosted_until = boosted_until;
//     toast.success(next ? "Ad boosted for 10 days!" : "Boost removed");
//   };

//   return (
//     <Link
//       to="/ad/$id"
//       params={{ id: ad.id }}
//       className={`group relative block overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-warm)] ${boosted ? "border-transparent ring-2 ring-amber-400/70 shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)]" : "border-border/60"}`}
//       style={boosted ? { backgroundImage: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(236,72,153,0.10) 50%, rgba(139,92,246,0.10))" } : undefined}
//     >
//       {boosted && (
//         <div
//           className="relative flex items-center justify-center gap-1.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white"
//           style={{ background: "linear-gradient(90deg,#f59e0b,#ec4899,#8b5cf6,#ec4899,#f59e0b)", backgroundSize: "200% 100%", animation: "boost-shimmer 3s linear infinite" }}
//         >
//           <Sparkles className="h-3.5 w-3.5" />
//           Boosted Ad
//           <Sparkles className="h-3.5 w-3.5" />
//         </div>
//       )}
//       <div className="relative aspect-[4/3] overflow-hidden bg-muted">
//         {ad.photo_url ? (
//           <img src={ad.photo_url} alt={ad.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
//         ) : (
//           <div className="grid h-full w-full place-items-center text-muted-foreground">No photo</div>
//         )}
//         {score != null && (
//           <div
//             className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
//             style={{ background: "var(--gradient-warm)" }}
//           >
//             {score}% match
//           </div>
//         )}
//       </div>
//       <div className="space-y-2 p-4">
//         <h3 className="line-clamp-1 font-display text-lg font-semibold">{ad.title}</h3>
//         <p className="flex items-center gap-1 text-sm text-muted-foreground">
//           <MapPin className="h-3.5 w-3.5" /> {ad.location}, {ad.city}
//         </p>
//         <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
//           <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {ad.length_ft}ft × {ad.width_ft}ft</span>
//           <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ad.occupancy} ppl</span>
//           <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> Floor {ad.floor}</span>
//         </div>
//         {ad.rent_monthly && (
//           <p className="pt-1 font-semibold text-primary">PKR {Number(ad.rent_monthly).toLocaleString()}<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
//         )}
//         {ad.owner_phone && (
//           <span
//             role="link"
//             onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${ad.owner_phone}`; }}
//             className="flex w-fit cursor-pointer items-center gap-1.5 pt-1 text-xs font-medium text-primary hover:underline"
//           >
//             <Phone className="h-3 w-3" /> {ad.owner_phone}
//           </span>
//         )}
//         {isOwner && (
//           <button
//             type="button"
//             onClick={toggleBoost}
//             disabled={boosting}
//             className="mt-2 w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
//             style={{ background: boosted ? "linear-gradient(135deg,#9ca3af,#6b7280)" : "linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)" }}
//           >
//             <span className="inline-flex items-center gap-1.5">
//               <Sparkles className="h-3.5 w-3.5" />
//               {boosting ? "Updating…" : boosted ? "Remove boost" : "Boost ad (10 days)"}
//             </span>
//           </button>
//         )}
//       </div>
//     </Link>
//   );
// }

import { Link } from "@tanstack/react-router";
import { MapPin, Users, Maximize2, Layers, Phone, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_EMAIL = "70176104@student.uol.edu.pk";

export default function AdCard({ ad, score, onBoost }) {
  const { user } = useAuth();
  const isActive = (a) => !!a.boosted && (!a.boosted_until || new Date(a.boosted_until) > new Date());
  const [boosted, setBoosted] = useState(isActive(ad));
  const [boosting, setBoosting] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const directBoost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBoosting(true);
    const next = !boosted;
    const boosted_until = next ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() : null;
    const { error } = await supabase.from("ads").update({ boosted: next, boosted_until }).eq("id", ad.id);
    setBoosting(false);
    if (error) { toast.error(error.message); return; }
    setBoosted(next);
    ad.boosted = next;
    ad.boosted_until = boosted_until;
    toast.success(next ? "Ad boosted for 10 days!" : "Boost removed");
  };

  return (
    <Link
      to="/ad/$id"
      params={{ id: ad.id }}
      className={`group relative block overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-warm)] ${boosted ? "border-transparent ring-2 ring-amber-400/70 shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)]" : "border-border/60"}`}
      style={boosted ? { backgroundImage: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(236,72,153,0.10) 50%, rgba(139,92,246,0.10))" } : undefined}
    >
      {boosted && (
        <div
          className="relative flex items-center justify-center gap-1.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white"
          style={{ background: "linear-gradient(90deg,#f59e0b,#ec4899,#8b5cf6,#ec4899,#f59e0b)", backgroundSize: "200% 100%", animation: "boost-shimmer 3s linear infinite" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Boosted Ad
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {ad.photo_url ? (
          <img src={ad.photo_url} alt={ad.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">No photo</div>
        )}
        {score != null && (
          <div
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
            style={{ background: "var(--gradient-warm)" }}
          >
            {score}% match
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-display text-lg font-semibold">{ad.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {ad.location}, {ad.city}
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {ad.length_ft}ft × {ad.width_ft}ft</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ad.occupancy} ppl</span>
          <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> Floor {ad.floor}</span>
        </div>
        {ad.rent_monthly && (
          <p className="pt-1 font-semibold text-primary">PKR {Number(ad.rent_monthly).toLocaleString()}<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
        )}
        {ad.owner_phone && (
          <span
            role="link"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${ad.owner_phone}`; }}
            className="flex w-fit cursor-pointer items-center gap-1.5 pt-1 text-xs font-medium text-primary hover:underline"
          >
            <Phone className="h-3 w-3" /> {ad.owner_phone}
          </span>
        )}

        {/* Admin: direct boost */}
        {isAdmin && (
          <button
            type="button"
            onClick={directBoost}
            disabled={boosting}
            className="mt-2 w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: boosted ? "linear-gradient(135deg,#9ca3af,#6b7280)" : "linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {boosting ? "Updating…" : boosted ? "Remove boost" : "Boost ad (Admin)"}
            </span>
          </button>
        )}

        {/* Everyone else: open boost info modal */}
        {!isAdmin && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBoost?.(); }}
            className="mt-2 w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Boost ad (10 days)
            </span>
          </button>
        )}
      </div>
    </Link>
  );
}