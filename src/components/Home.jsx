// // import { Link } from "@tanstack/react-router";
// // import Layout from "./Layout.jsx";
// // import { Button } from "@/components/ui/button";
// // import { Search, PlusCircle, MessageCircle, Sparkles } from "lucide-react";
// // import hero from "@/assets/hero-room.jpg";
// // import { useAuth } from "@/lib/auth.jsx";
// // import { Navigate } from "@tanstack/react-router";

// // export default function Home() {
// //   const { user, loading } = useAuth();
// //   if (loading) return null;
// //   if (!user) return <Navigate to="/auth" />;

// //   return (
// //     <Layout>
// //       <section className="relative overflow-hidden rounded-3xl border border-border/60 shadow-[var(--shadow-warm)]">
// //         <img src={hero} alt="Cozy room" width={1920} height={1080} className="h-[420px] w-full object-cover" />
// //         <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
// //         <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 text-primary-foreground">
// //           <span className="inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-xs backdrop-blur">
// //             <Sparkles className="h-3.5 w-3.5" /> Smarter than scrolling Facebook groups
// //           </span>
// //           <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
// //             Find your next room. Or your next roommate.
// //           </h1>
// //           <p className="mt-2 max-w-lg text-sm text-primary-foreground/85 md:text-base">
// //             Tell us what you need. We'll rank every listing by how well it fits — then you chat directly with the person renting.
// //           </p>
// //           <div className="mt-5 flex flex-wrap gap-3">
// //             <Link to="/browse"><Button size="lg" className="bg-background text-foreground hover:bg-background/90"><Search className="mr-2 h-4 w-4" /> Find a room</Button></Link>
// //             <Link to="/upload"><Button size="lg" variant="outline" className="border-background/40 bg-transparent text-primary-foreground hover:bg-background/10"><PlusCircle className="mr-2 h-4 w-4" /> Post your room</Button></Link>
// //           </div>
// //         </div>
// //       </section>

// //       <section className="mt-10 grid gap-4 md:grid-cols-3">
// //         {[
// //           { icon: Search, title: "Tell us your specs", body: "City, budget, room size, how many roommates you can handle." },
// //           { icon: Sparkles, title: "See match %", body: "Every ad gets scored against your needs so the best ones surface first." },
// //           { icon: MessageCircle, title: "Chat & move in", body: "Message the person renting directly — no third party in the middle." },
// //         ].map((c) => (
// //           <div key={c.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
// //             <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground"><c.icon className="h-5 w-5" /></span>
// //             <h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3>
// //             <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
// //           </div>
// //         ))}
// //       </section>
// //     </Layout>
// //   );
// // }

// import { Link } from "@tanstack/react-router";
// import Layout from "./Layout.jsx";
// import { Button } from "@/components/ui/button";
// import { Search, PlusCircle, MessageCircle, Sparkles } from "lucide-react";
// import hero from "@/assets/new_background.png";

// export default function Home() {
//   return (
//     <Layout>
//       <section className="rounded-3xl border border-border/60 shadow-[var(--shadow-warm)] overflow-hidden">
//         {/* Square image with title and description overlay */}
//         <div className="relative w-full aspect-square max-h-[400px] overflow-hidden">
//           <img
//             src={hero}
//             alt="Cozy room"
//             className="w-full h-full object-cover object-center"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
//           <div className="absolute inset-x-0 bottom-0 p-5">
//             <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
//               Find your next room. Or your next roommate.
//             </h1>
//             <p className="mt-2 text-xs text-white/85 sm:text-sm">
//               Tell us what you need. We'll rank every listing by how well it fits — then you chat directly with the person renting.
//             </p>
//           </div>
//         </div>

//         {/* Buttons below */}
//         <div className="p-5 bg-card">
//           <div className="flex flex-wrap gap-2">
//             <Link to="/browse">
//               <Button size="sm" style={{ background: "var(--gradient-warm)" }}>
//                 <Search className="mr-2 h-4 w-4" /> Find a room
//               </Button>
//             </Link>
//             <Link to="/upload">
//               <Button size="sm" variant="outline">
//                 <PlusCircle className="mr-2 h-4 w-4" /> Post your room
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       <section className="mt-6 grid gap-4 md:grid-cols-3">
//         {[
//           { icon: Search, title: "Tell us your specs", body: "City, budget, room size, how many roommates you can handle." },
//           { icon: Sparkles, title: "See match %", body: "Every ad gets scored against your needs so the best ones surface first." },
//           { icon: MessageCircle, title: "Chat & move in", body: "Message the person renting directly — no third party in the middle." },
//         ].map((c) => (
//           <div key={c.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
//             <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
//               <c.icon className="h-5 w-5" />
//             </span>
//             <h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3>
//             <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
//           </div>
//         ))}
//       </section>
//     </Layout>
//   );
// }
import { Link, useNavigate } from "@tanstack/react-router";
import Layout from "./Layout.jsx";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, MessageCircle, Sparkles } from "lucide-react";
import hero from "@/assets/new_background.png";
import { useAuth } from "@/lib/auth.jsx";

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <Layout>
      <section className="rounded-3xl border border-border/60 shadow-[var(--shadow-warm)] overflow-hidden">
        <div className="relative w-full aspect-square max-h-[400px] overflow-hidden">
          <img src={hero} alt="Cozy room" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Find your next room. Or your next roommate.
            </h1>
            <p className="mt-2 text-xs text-white/85 sm:text-sm">
              Tell us what you need. We'll rank every listing by how well it fits — then you chat directly with the person renting.
            </p>
          </div>
        </div>
        <div className="p-5 bg-card">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" style={{ background: "var(--gradient-warm)" }} onClick={() => user ? nav({ to: "/browse" }) : nav({ to: "/auth" })}>
              <Search className="mr-2 h-4 w-4" /> Find a room
            </Button>
            <Button size="sm" variant="outline" onClick={() => user ? nav({ to: "/upload" }) : nav({ to: "/auth" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Post your room
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: Search, title: "Tell us your specs", body: "City, budget, room size, how many roommates you can handle." },
          { icon: Sparkles, title: "See match %", body: "Every ad gets scored against your needs so the best ones surface first." },
          { icon: MessageCircle, title: "Chat & move in", body: "Message the person renting directly — no third party in the middle." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <c.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
}