import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — TheRynzo Ai" }] }),
  component: AdminPage,
});

type Profile = { id: string; username: string; email: string; has_active_key: boolean; created_at: string };
type Key = { id: string; code: string; is_active: boolean; usage_limit: number; used_count: number; expires_at: string | null; created_at: string };
type Settings = { default_provider: string; default_model: string; openai_enabled: boolean; gemini_enabled: boolean };

function rand(n = 16) {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("");
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [limit, setLimit] = useState(1);

  useEffect(() => { if (!loading && (!user || !isAdmin)) nav({ to: "/dashboard" }); }, [loading, user, isAdmin, nav]);

  const load = async () => {
    const [u, k, s] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("redeem_keys").select("*").order("created_at", { ascending: false }),
      supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (u.data) setUsers(u.data as Profile[]);
    if (k.data) setKeys(k.data as Key[]);
    if (s.data) setSettings(s.data as Settings);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!isAdmin) return null;

  const generateKey = async () => {
    const code = "RYNZO-" + rand(12);
    const { error } = await supabase.from("redeem_keys").insert({ code, usage_limit: Math.max(1, limit) });
    if (error) return toast.error(error.message);
    toast.success("Key generated: " + code);
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

  const saveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from("app_settings").update({
      default_provider: settings.default_provider,
      default_model: settings.default_model,
      openai_enabled: settings.openai_enabled,
      gemini_enabled: settings.gemini_enabled,
    }).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  return (
    <div className="pt-32 pb-16 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-semibold">Admin <span className="text-gradient-primary">Dashboard</span></h1>

        <section className="glass glow-border rounded-2xl p-6">
          <h2 className="font-semibold">AI Setup</h2>
          {settings && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <label className="text-sm">Default provider
                <select value={settings.default_provider} onChange={(e) => setSettings({ ...settings, default_provider: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-sm">
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
          <p className="mt-3 text-xs text-muted-foreground">API keys are stored as backend secrets — request OPENAI_API_KEY / GEMINI_API_KEY via support if needed.</p>
          <button onClick={saveSettings} className="mt-3 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm text-primary-foreground shadow-glow">Save AI settings</button>
        </section>

        <section className="glass glow-border rounded-2xl p-6">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <h2 className="font-semibold">Redeem Keys</h2>
            <div className="flex items-end gap-2">
              <label className="text-xs text-muted-foreground">Usage limit
                <input type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="mt-1 block w-24 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-sm" />
              </label>
              <button onClick={generateKey} className="rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm text-primary-foreground shadow-glow">Generate Key</button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground"><tr className="text-left"><th className="py-2">Code</th><th>Used</th><th>Active</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-border">
                    <td className="py-2 font-mono">{k.code}</td>
                    <td>{k.used_count}/{k.usage_limit}</td>
                    <td>{k.is_active ? "Yes" : "No"}</td>
                    <td className="text-xs text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button onClick={() => toggleKey(k)} className="text-xs text-primary hover:underline mr-3">{k.is_active ? "Disable" : "Enable"}</button>
                      <button onClick={() => deleteKey(k.id)} className="text-xs text-destructive hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No keys yet</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass glow-border rounded-2xl p-6">
          <h2 className="font-semibold">Members ({users.length})</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground"><tr className="text-left"><th className="py-2">Username</th><th>Email</th><th>Key</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2">{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.has_active_key ? <span className="text-primary">Active</span> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
