// import { Link, useLocation, useNavigate } from "@tanstack/react-router";
// import { Home, Compass, PlusCircle, MessageCircle, LogOut, Radar, Sun, Moon, User } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useAuth } from "@/lib/auth.jsx";
// import { useTheme } from "@/lib/theme.jsx";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";

// const tabs = [
//   { to: "/", label: "Home", icon: Home, exact: true },
//   { to: "/browse", label: "Browse", icon: Compass },
//   { to: "/upload", label: "Post Ad", icon: PlusCircle },
//   { to: "/chat", label: "Chat", icon: MessageCircle },
//   { to: "/account", label: "Account", icon: User },
// ];

// export default function Layout({ children }) {
//   const { user, loading } = useAuth();
//   const { theme, toggle } = useTheme();
//   const nav = useNavigate();
//   const loc = useLocation();
//   const [unread, setUnread] = useState(0);
//   const [needsPhone, setNeedsPhone] = useState(false);
//   const [phone, setPhone] = useState("");
//   const [savingPhone, setSavingPhone] = useState(false);

//   useEffect(() => {
//     if (!user) { setNeedsPhone(false); return; }
//     let cancelled = false;
//     (async () => {
//       const { data } = await supabase
//         .from("profiles")
//         .select("phone")
//         .eq("id", user.id)
//         .maybeSingle();
//       if (cancelled) return;
//       if (!data?.phone) setNeedsPhone(true);
//     })();
//     return () => { cancelled = true; };
//   }, [user]);

//   const savePhone = async (e) => {
//     e.preventDefault();
//     const trimmed = phone.trim();
//     if (!/^[+\d][\d\s\-()]{6,19}$/.test(trimmed)) {
//       toast.error("Please enter a valid phone number");
//       return;
//     }
//     setSavingPhone(true);
//     const { error } = await supabase
//       .from("profiles")
//       .update({ phone: trimmed })
//       .eq("id", user.id);
//     setSavingPhone(false);
//     if (error) { toast.error(error.message); return; }
//     toast.success("Phone number saved");
//     setNeedsPhone(false);
//   };

//   useEffect(() => {
//     if (!user) { setUnread(0); return; }
//     let cancelled = false;

//     const compute = async () => {
//       const { data: convs } = await supabase
//         .from("conversations")
//         .select("id, last_message_at, ad_owner_id, seeker_id");
//       if (!convs || cancelled) return;
//       let count = 0;
//       await Promise.all(convs.map(async (c) => {
//         const seenKey = `chat_seen_${user.id}_${c.id}`;
//         const seenAt = typeof window !== "undefined" ? localStorage.getItem(seenKey) : null;
//         const { data: last } = await supabase
//           .from("messages")
//           .select("sender_id, created_at")
//           .eq("conversation_id", c.id)
//           .order("created_at", { ascending: false })
//           .limit(1)
//           .maybeSingle();
//         if (!last) return;
//         if (last.sender_id === user.id) return;
//         if (!seenAt || new Date(last.created_at) > new Date(seenAt)) count += 1;
//       }));
//       if (!cancelled) setUnread(count);
//     };

//     compute();

//     const channel = supabase
//       .channel(`unread:${user.id}`)
//       .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => compute())
//       .subscribe();

//     const onSeen = () => compute();
//     window.addEventListener("chat-seen", onSeen);
//     window.addEventListener("focus", onSeen);

//     return () => {
//       cancelled = true;
//       supabase.removeChannel(channel);
//       window.removeEventListener("chat-seen", onSeen);
//       window.removeEventListener("focus", onSeen);
//     };
//   }, [user]);

//   if (loading) {
//     return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
//   }

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
//         <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
//           <Link to="/" className="flex items-center gap-2 group">
//             <span className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
//               <Radar className="h-5 w-5" />
//             </span>
//             <span className="font-display text-xl font-semibold tracking-tight">Room Radar</span>
//           </Link>
//           <div className="flex items-center gap-1">
//             <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
//               {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//             </Button>
//             {user ? (
//               <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>
//                 <LogOut className="mr-2 h-4 w-4" /> Sign out
//               </Button>
//             ) : (
//               <Link to="/auth"><Button size="sm">Sign in</Button></Link>
//             )}
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4">{children}</main>

//       {user && (
//         <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border/60 bg-card/95 px-2 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
//           <ul className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
//             {tabs.map((t) => {
//               const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
//               const Icon = t.icon;
//               const showBadge = t.to === "/chat" && unread > 0;
//               return (
//                 <li key={t.to}>
//                   <Link
//                     to={t.to}
//                     className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all whitespace-nowrap ${
//                       active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
//                     }`}
//                     style={active ? { background: "var(--gradient-warm)" } : {}}
//                   >
//                     <span className="relative">
//                       <Icon className="h-4 w-4" />
//                       {showBadge && (
//                         <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
//                           {unread > 9 ? "9+" : unread}
//                         </span>
//                       )}
//                     </span>
//                     <span className="hidden sm:inline">{t.label}</span>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>
//       )}

//       <Dialog open={needsPhone} onOpenChange={() => {}}>
//         <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
//           <DialogHeader>
//             <DialogTitle>Add your phone number</DialogTitle>
//             <DialogDescription>
//               We need your phone number so people interested in your ads can contact you.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={savePhone} className="space-y-4">
//             <div>
//               <Label htmlFor="phone-capture">Phone number</Label>
//               <Input
//                 id="phone-capture"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 required
//                 maxLength={20}
//                 placeholder="e.g. +92 300 1234567"
//                 autoFocus
//               />
//             </div>
//             <Button type="submit" disabled={savingPhone} className="w-full" style={{ background: "var(--gradient-warm)" }}>
//               {savingPhone ? "Saving…" : "Save"}
//             </Button>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// import roomRadarLogo from "@/assets/Room Radar logo_.png";
// import { Link, useLocation, useNavigate } from "@tanstack/react-router";
// import { Home, Compass, PlusCircle, MessageCircle, Sun, Moon, User, LogOut } from "lucide-react";
// import { useTheme } from "@/lib/theme.jsx";
// import { useAuth } from "@/lib/auth.jsx";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// const tabs = [
//   { to: "/", label: "Home", icon: Home, exact: true },
//   { to: "/browse", label: "Browse", icon: Compass },
//   { to: "/upload", label: "Post Ad", icon: PlusCircle, protected: true },
//   { to: "/chat", label: "Chat", icon: MessageCircle, protected: true },
//   { to: "/account", label: "Account", icon: User, protected: true },
// ];

// export default function Layout({ children }) {
//   const { theme, toggle } = useTheme();
//   const { user } = useAuth();
//   const loc = useLocation();
//   const nav = useNavigate();

//   const signOut = async () => {
//     await supabase.auth.signOut();
//     toast.success("Signed out!");
//     nav({ to: "/auth" });
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
//         <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
//           <Link to="/" className="flex items-center gap-2 group">
//             <img
//               src={roomRadarLogo}
//               alt="Room Radar"
//               className="h-9 w-9 rounded-xl object-cover"
//             />
//             <span className="font-display text-xl font-semibold tracking-tight">Room Radar</span>
//           </Link>
//           <div className="flex items-center gap-2">
//             {user && (
//               <span className="hidden sm:block text-xs text-muted-foreground max-w-[160px] truncate">
//                 {user.email}
//               </span>
//             )}
//             <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
//               {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//             </Button>
//             {user ? (
//               <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
//                 <LogOut className="h-4 w-4" />
//               </Button>
//             ) : (
//               <Button variant="ghost" size="sm" onClick={() => nav({ to: "/auth" })}>
//                 Sign in
//               </Button>
//             )}
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4">{children}</main>

//       <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border/60 bg-card/95 px-2 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
//         <ul className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
//           {tabs.map((t) => {
//             const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
//             const Icon = t.icon;
//             return (
//               <li key={t.to}>
//                 {t.protected && !user ? (
//                   <button
//                     onClick={() => nav({ to: "/auth" })}
//                     className="relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all whitespace-nowrap text-muted-foreground hover:text-foreground"
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span className="hidden sm:inline">{t.label}</span>
//                   </button>
//                 ) : (
//                   <Link
//                     to={t.to}
//                     className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all whitespace-nowrap ${
//                       active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
//                     }`}
//                     style={active ? { background: "var(--gradient-warm)" } : {}}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span className="hidden sm:inline">{t.label}</span>
//                   </Link>
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </nav>
//     </div>
//   );
// }
import roomRadarLogo from "@/assets/Room Radar logo_.png";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Compass, PlusCircle, MessageCircle, Sun, Moon, User, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme.jsx";
import { useAuth } from "@/lib/auth.jsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const tabs = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/browse", label: "Browse", icon: Compass, protected: true },
  { to: "/upload", label: "Post Ad", icon: PlusCircle, protected: true },
  { to: "/chat", label: "Chat", icon: MessageCircle, protected: true },
  { to: "/account", label: "Account", icon: User, protected: true },
];

export default function Layout({ children }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out!");
    nav({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={roomRadarLogo}
              alt="Room Radar"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <span className="font-display text-xl font-semibold tracking-tight">Room Radar – Lahore Edition</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden sm:block text-xs text-muted-foreground max-w-[160px] truncate">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => nav({ to: "/auth" })}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border/60 bg-card/95 px-2 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
        <ul className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
          {tabs.map((t) => {
            const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                {t.protected && !user ? (
                  <button
                    onClick={() => nav({ to: "/auth" })}
                    className="relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all whitespace-nowrap text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ) : (
                  <Link
                    to={t.to}
                    className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all whitespace-nowrap ${
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={active ? { background: "var(--gradient-warm)" } : {}}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}