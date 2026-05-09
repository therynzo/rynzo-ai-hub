import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { LogOut, Mail, User as UserIcon, KeyRound, Shield, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — TheRynzo Ai" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) return null;

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
    nav({ to: "/" });
  };

  const initial = (profile?.username || profile?.email || "U").charAt(0).toUpperCase();
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header card */}
        <div className="glass glow-border rounded-3xl p-8 shadow-glow relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[image:var(--gradient-primary)] opacity-20 blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
            <div className="h-24 w-24 rounded-2xl bg-[image:var(--gradient-primary)] grid place-items-center text-4xl font-bold text-primary-foreground shadow-glow">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold truncate">{profile?.username ?? "User"}</h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
                {profile?.has_active_key ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <XCircle className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground truncate">{profile?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 hover:shadow-glow transition-all"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <InfoCard icon={<UserIcon className="h-4 w-4 text-primary" />} label="Username" value={profile?.username ?? "—"} />
          <InfoCard icon={<Mail className="h-4 w-4 text-primary" />} label="Email" value={profile?.email ?? user.email ?? "—"} />
          <InfoCard icon={<KeyRound className="h-4 w-4 text-primary" />} label="AI Access" value={profile?.has_active_key ? "Active key" : "No active key"} />
          <InfoCard icon={<Calendar className="h-4 w-4 text-primary" />} label="Member since" value={joined} />
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/dashboard" className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
            Dashboard
          </Link>
          <Link to="/ai-chat" className="rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all">
            Open AI Chat
          </Link>
          {isAdmin && (
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20">
              <Shield className="h-4 w-4" /> Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass glow-border rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-base font-medium break-all">{value}</div>
    </div>
  );
}