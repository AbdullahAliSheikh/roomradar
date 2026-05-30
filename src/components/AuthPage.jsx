// import { useState } from "react";
// import { useNavigate } from "@tanstack/react-router";
// import { supabase } from "@/integrations/supabase/client";
// import { lovable } from "@/integrations/lovable";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { Radar } from "lucide-react";

// export default function AuthPage() {
//   const nav = useNavigate();
//   const [mode, setMode] = useState("signin");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (mode === "signup") {
//         const trimmedPhone = phone.trim();
//         if (!/^[+\d][\d\s\-()]{6,19}$/.test(trimmedPhone)) {
//           throw new Error("Please enter a valid phone number");
//         }
//         const { error } = await supabase.auth.signUp({
//           email, password,
//           options: { emailRedirectTo: window.location.origin, data: { display_name: name, phone: trimmedPhone } },
//         });
//         if (error) throw error;
//         toast.success("Check your email to confirm, then sign in.");
//         setMode("signin");
//       } else {
//         const { error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error) throw error;
//         nav({ to: "/" });
//       }
//     } catch (err) {
//       toast.error(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const google = async () => {
//     setLoading(true);
//     const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
//     if (result.error) { toast.error("Google sign-in failed"); setLoading(false); return; }
//     if (result.redirected) return;
//     nav({ to: "/" });
//   };

//   return (
//     <div className="grid min-h-screen place-items-center px-4" style={{ background: "var(--gradient-soft)" }}>
//       <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-warm)]">
//         <div className="mb-6 flex items-center gap-3">
//           <span className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
//             <Radar className="h-6 w-6" />
//           </span>
//           <div>
//             <h1 className="font-display text-2xl font-semibold tracking-tight">Room Radar</h1>
//             <p className="text-sm text-muted-foreground">{mode === "signup" ? "Create your account" : "Welcome back"}</p>
//           </div>
//         </div>

//         <form onSubmit={submit} className="space-y-4">
//           {mode === "signup" && (
//             <>
//               <div>
//                 <Label htmlFor="name">Display name</Label>
//                 <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
//               </div>
//               <div>
//                 <Label htmlFor="phone">Phone number</Label>
//                 <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} placeholder="e.g. +92 300 1234567" />
//                 <p className="mt-1 text-xs text-muted-foreground">Shown on the ads you post so others can contact you.</p>
//               </div>
//             </>
//           )}
//           <div>
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>
//           <div>
//             <Label htmlFor="password">Password</Label>
//             <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
//           </div>
//           <Button type="submit" disabled={loading} className="w-full" style={{ background: "var(--gradient-warm)" }}>
//             {mode === "signup" ? "Create account" : "Sign in"}
//           </Button>
//         </form>

//         <div className="my-4 flex items-center gap-3">
//           <div className="h-px flex-1 bg-border" />
//           <span className="text-xs text-muted-foreground">or</span>
//           <div className="h-px flex-1 bg-border" />
//         </div>

//         <Button type="button" variant="outline" className="w-full" onClick={google} disabled={loading}>
//           Continue with Google
//         </Button>

//         <p className="mt-6 text-center text-sm text-muted-foreground">
//           {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
//           <button type="button" className="font-medium text-primary underline-offset-2 hover:underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
//             {mode === "signup" ? "Sign in" : "Create account"}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Radar } from "lucide-react";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const trimmedPhone = phone.trim();
        if (!/^[+\d][\d\s\-()]{6,19}$/.test(trimmedPhone)) {
          throw new Error("Please enter a valid phone number");
        }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name, phone: trimmedPhone } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/" });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) { toast.error("Google sign-in failed"); setLoading(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-warm)]">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
            <Radar className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Room Radar</h1>
            <p className="text-sm text-muted-foreground">{mode === "signup" ? "Create your account" : "Welcome back"}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} placeholder="e.g. +92 300 1234567" />
                <p className="mt-1 text-xs text-muted-foreground">Shown on the ads you post so others can contact you.</p>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full" style={{ background: "var(--gradient-warm)" }}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={google} disabled={loading}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="font-medium text-primary underline-offset-2 hover:underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}