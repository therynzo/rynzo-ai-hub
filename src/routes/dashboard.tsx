import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TheRynzo Ai" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, isAdmin, loading, refresh } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);
  if (!user) return null;

  const addKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("redeem_key", { _code: code.trim() });
    setBusy(false);
    if (error) return toast.error(error.message);
    const r = data as any;
    if (r?.ok) { toast.success("Key activated!"); setCode(""); refresh(); }
    else toast.error("Key " + (r?.error ?? "invalid"));
  };

  return (
    <div className="pt-32 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Welcome, <span className="text-gradient-primary">{profile?.username ?? "user"}</span></h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          {isAdmin && (
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">
              <Shield className="h-4 w-4" /> Open Admin
            </Link>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="glass glow-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className={`h-4 w-4 ${profile?.has_active_key ? "text-primary" : "text-muted-foreground"}`} />
              Key status
            </div>
            <div className="mt-2 text-2xl font-semibold">{profile?.has_active_key ? "Active" : "Inactive"}</div>
            <Link to="/ai-chat" className="mt-4 inline-block text-sm text-primary hover:underline">Open AI Chat →</Link>
          </div>
          <form onSubmit={addKey} className="glass glow-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><KeyRound className="h-4 w-4 text-primary" /> Add Key</div>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter redeem key" maxLength={64} className="mt-3 w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm font-mono outline-none focus:border-primary/60" />
            <button disabled={busy} className="mt-3 w-full rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60">{busy ? "Activating…" : "Activate Key"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
