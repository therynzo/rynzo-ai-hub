import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Users, MessageSquare, Sparkles, Trash2, Power, Search, RefreshCw, Plus, Eye, EyeOff, Save, History, Shield, Ban, UserX, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — TheRynzo Ai" }] }),
  component: AdminPage,
});

type Profile = { id: string; username: string; email: string; has_active_key: boolean; banned: boolean; created_at: string };
type Key = { id: string; code: string; is_active: boolean; usage_limit: number; used_count: number; expires_at: string | null; created_at: string };
type Settings = { default_provider: string; default_model: string; openai_enabled: boolean; gemini_enabled: boolean };
type AdminSecret = { key: string; value: string | null };
type ChatRow = { id: string; title: string; created_at: string; user_id: string };

function rand(n = 12) {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("");
}
const newCode = () => "RYNZO-" + rand(12);
const providerModels: Record<string, string> = {
  lovable: "google/gemini-3-flash-preview",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const [secrets, setSecrets] = useState<Record<string, string>>({ OPENAI_API_KEY: "", GEMINI_API_KEY: "" });
  const [showKeys, setShowKeys] = useState(false);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [limit, setLimit] = useState(1);
  const [bulk, setBulk] = useState(1);
  const [expiresDays, setExpiresDays] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);
  useEffect(() => { if (!loading && user && !isAdmin) nav({ to: "/dashboard" }); }, [loading, user, isAdmin, nav]);

  const load = async () => {
    const [u, k, s, c, sec, ch] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("redeem_keys").select("*").order("created_at", { ascending: false }),
      supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("chats").select("id", { count: "exact", head: true }),
      supabase.from("admin_secrets").select("*"),
      supabase.from("chats").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (u.data) setUsers(u.data as Profile[]);
    if (k.data) setKeys(k.data as Key[]);
    if (s.data) setSettings(s.data as Settings);
    setChatCount(c.count ?? 0);
    if (sec.data) {
      const map: Record<string, string> = { OPENAI_API_KEY: "", GEMINI_API_KEY: "" };
      (sec.data as AdminSecret[]).forEach((r) => { map[r.key] = r.value ?? ""; });
      setSecrets(map);
    }
    if (ch.data) setChats(ch.data as ChatRow[]);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  }, [users, search]);

  const stats = useMemo(() => ({
    members: users.length,
    activeKeys: keys.filter(k => k.is_active).length,
    totalKeys: keys.length,
    redemptions: keys.reduce((a, k) => a + k.used_count, 0),
  }), [users, keys]);

  if (loading || !user) {
    return (
      <div className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-secondary/60" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary/50" />)}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-secondary/40" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-md glass glow-border rounded-2xl p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold">Admin access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only therynzo7@gmail.com can open the admin dashboard.</p>
          <button onClick={() => nav({ to: user ? "/dashboard" : "/login" })} className="mt-5 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm text-primary-foreground shadow-glow">
            {user ? "Back to dashboard" : "Login as admin"}
          </button>
        </div>
      </div>
    );
  }

  const generateKeys = async () => {
    setBusy(true);
    const rows = Array.from({ length: Math.max(1, bulk) }, () => ({
      code: newCode(),
      usage_limit: Math.max(1, limit),
      expires_at: expiresDays ? new Date(Date.now() + Number(expiresDays) * 86400000).toISOString() : null,
    }));
    const { error } = await supabase.from("redeem_keys").insert(rows);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Generated ${rows.length} key${rows.length > 1 ? "s" : ""}`);
    load();
  };

  const toggleKey = async (k: Key) => {
    const { error } = await supabase.from("redeem_keys").update({ is_active: !k.is_active }).eq("id", k.id);
    if (error) toast.error(error.message); else load();
  };
  const deleteKey = async (id: string) => {
    if (!confirm("Delete key?")) return;
    const { error } = await supabase.from("redeem_keys").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };
  const copyKey = (code: string) => { navigator.clipboard.writeText(code); toast.success("Copied " + code); };
  const exportKeys = () => {
    const csv = "code,active,used,limit,expires,created\n" + keys.map(k =>
      `${k.code},${k.is_active},${k.used_count},${k.usage_limit},${k.expires_at ?? ""},${k.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "rynzo-keys.csv"; a.click();
  };

  const revokeUserKey = async (id: string) => {
    if (!confirm("Revoke this user's AI access?")) return;
    const { error } = await supabase.from("profiles").update({ has_active_key: false }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Revoked"); load(); }
  };
  const grantUserKey = async (id: string) => {
    const { error } = await supabase.from("profiles").update({ has_active_key: true }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Granted"); load(); }
  };

  const toggleBan = async (u: Profile) => {
    const action = u.banned ? "unban" : "ban";
    if (!confirm(`${action} ${u.email}?`)) return;
    const { error } = await supabase.from("profiles").update({ banned: !u.banned }).eq("id", u.id);
    if (error) toast.error(error.message); else { toast.success(`${action}ned`); load(); }
  };

  const deleteUser = async (u: Profile) => {
    if (!confirm(`PERMANENTLY delete ${u.email}? This removes their account, chats, and keys.`)) return;
    const { data, error } = await supabase.rpc("admin_delete_user" as any, { _user_id: u.id });
    if (error) return toast.error(error.message);
    const r = data as any;
    if (r?.ok) { toast.success("User deleted"); load(); }
    else toast.error(r?.error ?? "Failed");
  };

  const saveSettings = async () => {
    if (!settings) return;
    const fixedModel = settings.default_model.trim() || providerModels[settings.default_provider] || providerModels.lovable;
    const { error } = await supabase.from("app_settings").update({
      default_provider: settings.default_provider,
      default_model: fixedModel,
      openai_enabled: settings.openai_enabled,
      gemini_enabled: settings.gemini_enabled,
    }).eq("id", 1);
    if (error) toast.error(error.message); else { setSettings({ ...settings, default_model: fixedModel }); toast.success("AI settings saved"); }
  };

  const saveSecret = async (key: string) => {
    const value = secrets[key] ?? "";
    const { error } = await supabase.from("admin_secrets").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message); else toast.success(`${key} saved`);
  };

  const userEmail = (id: string) => users.find((u) => u.id === id)?.email ?? id.slice(0, 8);

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className="glass glow-border rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div>
      <div className="mt-2 text-3xl font-semibold text-gradient-primary">{value}</div>
    </div>
  );

  return (
    <div className="pt-32 pb-16 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Admin <span className="text-gradient-primary">Dashboard</span></h1>
            <p className="text-sm text-muted-foreground">Manage AI, members, and access keys</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:border-primary/60"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Members" value={stats.members} />
          <StatCard icon={KeyRound} label="Active keys" value={stats.activeKeys} />
          <StatCard icon={Sparkles} label="Redemptions" value={stats.redemptions} />
          <StatCard icon={MessageSquare} label="Chats" value={chatCount} />
        </div>

        <section className="glass glow-border rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Setup</h2>
          {settings && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <label className="text-sm">Default provider
                <select value={settings.default_provider} onChange={(e) => { const default_provider = e.target.value; setSettings({ ...settings, default_provider, default_model: providerModels[default_provider] || providerModels.lovable }); }} className="mt-1 w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-sm">
                  <option value="lovable">Lovable AI (built-in)</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                </select>
              </label>
              <label className="text-sm">Default model
                <input value={settings.default_model} onChange={(e) => setSettings({ ...settings, default_model: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-sm font-mono" />
              </label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.openai_enabled} onChange={(e) => setSettings({ ...settings, openai_enabled: e.target.checked })} /> OpenAI enabled</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.gemini_enabled} onChange={(e) => setSettings({ ...settings, gemini_enabled: e.target.checked })} /> Gemini enabled</label>
            </div>
          )}
          <button onClick={saveSettings} className="mt-3 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm text-primary-foreground shadow-glow">Save AI settings</button>

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">AI API Keys</h3>
              <button onClick={() => setShowKeys((v) => !v)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showKeys ? "Hide" : "Reveal"}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Stored admin-only. Used by AI chat when OpenAI / Gemini providers are selected.</p>
            {(["OPENAI_API_KEY", "GEMINI_API_KEY"] as const).map((k) => (
              <div key={k} className="mt-3 grid sm:grid-cols-[1fr_auto] gap-2 items-center">
                <label className="text-xs text-muted-foreground">{k}
                  <input
                    type={showKeys ? "text" : "password"}
                    value={secrets[k] ?? ""}
                    onChange={(e) => setSecrets({ ...secrets, [k]: e.target.value })}
                    placeholder={k === "OPENAI_API_KEY" ? "sk-..." : "AIza..."}
                    className="mt-1 w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-sm font-mono"
                  />
                </label>
                <button onClick={() => saveSecret(k)} className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10">
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="glass glow-border rounded-2xl p-6">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <h2 className="font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Redeem Keys</h2>
            <div className="flex items-end gap-2 flex-wrap">
              <label className="text-xs text-muted-foreground">Quantity
                <input type="number" min={1} max={100} value={bulk} onChange={(e) => setBulk(Number(e.target.value))} className="mt-1 block w-20 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-sm" />
              </label>
              <label className="text-xs text-muted-foreground">Usage limit
                <input type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="mt-1 block w-20 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-sm" />
              </label>
              <label className="text-xs text-muted-foreground">Expires (days)
                <input type="number" min={0} value={expiresDays} onChange={(e) => setExpiresDays(e.target.value === "" ? "" : Number(e.target.value))} placeholder="∞" className="mt-1 block w-20 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-sm" />
              </label>
              <button onClick={generateKeys} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm text-primary-foreground shadow-glow disabled:opacity-60"><Plus className="h-4 w-4" /> Generate</button>
              <button onClick={exportKeys} className="rounded-xl border border-border px-3 py-2 text-sm hover:border-primary/60">Export CSV</button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground"><tr className="text-left"><th className="py-2">Code</th><th>Used</th><th>Active</th><th>Expires</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-border">
                    <td className="py-2 font-mono">
                      <button onClick={() => copyKey(k.code)} className="inline-flex items-center gap-1.5 hover:text-primary">{k.code} <Copy className="h-3 w-3" /></button>
                    </td>
                    <td>{k.used_count}/{k.usage_limit}</td>
                    <td>{k.is_active ? <span className="text-primary">●</span> : <span className="text-muted-foreground">○</span>}</td>
                    <td className="text-xs text-muted-foreground">{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="text-xs text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</td>
                    <td className="text-right whitespace-nowrap">
                      <button onClick={() => toggleKey(k)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mr-3"><Power className="h-3 w-3" />{k.is_active ? "Disable" : "Enable"}</button>
                      <button onClick={() => deleteKey(k.id)} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="h-3 w-3" />Delete</button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No keys yet — generate your first one above.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass glow-border rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Members ({filteredUsers.length})</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or username" className="pl-9 pr-3 py-2 rounded-xl border border-border bg-input/40 text-sm w-64" />
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground"><tr className="text-left"><th className="py-2">Username</th><th>Email</th><th>AI Access</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2">{u.username}</td>
                    <td className="font-mono text-xs">{u.email}</td>
                    <td>
                      {u.banned ? <span className="text-destructive">Banned</span>
                        : u.has_active_key ? <span className="text-primary">Active</span>
                        : <span className="text-muted-foreground">Inactive</span>}
                    </td>
                    <td className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="text-right whitespace-nowrap">
                      {u.has_active_key
                        ? <button onClick={() => revokeUserKey(u.id)} className="text-xs text-destructive hover:underline">Revoke</button>
                        : <button onClick={() => grantUserKey(u.id)} className="text-xs text-primary hover:underline">Grant access</button>}
                      <button onClick={() => toggleBan(u)} className={`ml-3 inline-flex items-center gap-1 text-xs hover:underline ${u.banned ? "text-primary" : "text-destructive"}`}>
                        {u.banned ? <><CheckCircle2 className="h-3 w-3" />Unban</> : <><Ban className="h-3 w-3" />Ban</>}
                      </button>
                      <button onClick={() => deleteUser(u)} className="ml-3 inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                        <UserX className="h-3 w-3" />Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No members found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass glow-border rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Recent Chats ({chats.length})</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground"><tr className="text-left"><th className="py-2">Title</th><th>User</th><th>When</th></tr></thead>
              <tbody>
                {chats.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="py-2">{c.title}</td>
                    <td className="font-mono text-xs">{userEmail(c.user_id)}</td>
                    <td className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {chats.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No chats yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
