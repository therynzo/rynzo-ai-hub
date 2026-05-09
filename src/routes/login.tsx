import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — TheRynzo Ai" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    let admin = false;
    if (uid) {
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      admin = !!r?.some((x) => x.role === "admin");
    }
    nav({ to: admin ? "/admin" : "/dashboard" });
  };

  return (
    <div className="pt-32 pb-16 px-4">
      <div className="mx-auto max-w-md glass glow-border rounded-2xl p-8 shadow-glow">
        <h1 className="text-2xl font-semibold">Sign in to <span className="text-gradient-primary">TheRynzo Ai</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          <button disabled={loading} className="w-full rounded-xl bg-[image:var(--gradient-primary)] px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">No account? <Link to="/register" className="text-primary hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}
