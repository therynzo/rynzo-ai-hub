import { supabaseAdmin } from "@/integrations/supabase/client.server";

type AiSettings = {
  default_provider: string;
  default_model: string;
  openai_enabled: boolean;
  gemini_enabled: boolean;
} | null;

export async function getAdminAiConfig() {
  const [{ data: settings, error: settingsError }, { data: secretRows, error: secretsError }] = await Promise.all([
    supabaseAdmin
      .from("app_settings")
      .select("default_provider,default_model,openai_enabled,gemini_enabled")
      .eq("id", 1)
      .maybeSingle(),
    supabaseAdmin.from("admin_secrets").select("key,value"),
  ]);

  if (settingsError) console.error("[chat] Failed to load AI settings", settingsError.message);
  if (secretsError) console.error("[chat] Failed to load AI secrets", secretsError.message);

  const secrets: Record<string, string> = {};
  (secretRows ?? []).forEach((row: any) => {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    if (row.key && value) secrets[row.key] = value;
  });

  return { settings: (settings as AiSettings) ?? null, secrets };
}