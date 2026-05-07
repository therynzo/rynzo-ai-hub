import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — TheRynzo Ai" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redeem, setRedeem] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { username: username.trim() } },
    });
    if (error) { setLoading(false); return toast.error(error.message); }

    if (redeem.trim()) {
      const { data, error: rErr } = await supabase.rpc("redeem_key", { _code: redeem.trim() });
      if (rErr) toast.error("Account created, but redeem failed: " + rErr.message);
      else if (data && (data as any).ok === false) toast.error("Account created, but key " + (data as any).error);
      else toast.success("Account created and key activated!");
    } else {
      toast.success("Account created!");
    }
    setLoading(false);
    nav({ to: "/dashboard" });
  };

  return (
    <div className="pt-32 pb-16 px-4">
      <div className="mx-auto max-w-md glass glow-border rounded-2xl p-8 shadow-glow">
        <h1 className="text-2xl font-semibold">Create your <span className="text-gradient-primary">account</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Optionally enter a redeem key to unlock AI Chat.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" maxLength={40} className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          <input value={redeem} onChange={(e) => setRedeem(e.target.value)} placeholder="Redeem key (optional)" className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none focus:border-primary/60 font-mono" />
          <button disabled={loading} className="w-full rounded-xl bg-[image:var(--gradient-primary)] px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-60">{loading ? "Creating…" : "Create account"}</button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">Already have one? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
