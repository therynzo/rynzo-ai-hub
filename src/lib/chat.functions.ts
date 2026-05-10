import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { chatId?: string; messages: Msg[] }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: prof } = await supabase.from("profiles").select("has_active_key,banned").eq("id", userId).maybeSingle();
    if (!prof) throw new Response("Profile not found", { status: 404 });
    if ((prof as any).banned) throw new Response("Account banned", { status: 403 });
    if (!(prof as any).has_active_key) throw new Response("No active key", { status: 402 });

    const { data: settings } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    const { data: secretsRows } = await supabase.from("admin_secrets").select("*");
    const secrets: Record<string, string> = {};
    (secretsRows ?? []).forEach((r: any) => { if (r.value) secrets[r.key] = r.value; });

    const provider = settings?.default_provider ?? "lovable";
    const model = settings?.default_model ?? "google/gemini-3-flash-preview";

    let url = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let apiKey = process.env.LOVABLE_API_KEY ?? "";
    let usedModel = model;

    if (provider === "openai" && secrets.OPENAI_API_KEY) {
      url = "https://api.openai.com/v1/chat/completions";
      apiKey = secrets.OPENAI_API_KEY;
      usedModel = model.startsWith("gpt") ? model : "gpt-4o-mini";
    } else if (provider === "gemini" && secrets.GEMINI_API_KEY) {
      url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      apiKey = secrets.GEMINI_API_KEY;
      usedModel = model.startsWith("gemini") ? model : "gemini-2.0-flash";
    }

    if (!apiKey) throw new Response("AI not configured. Admin must set an API key.", { status: 500 });

    const sys: Msg = { role: "system", content: "You are TheRynzo Ai — a helpful, professional AI assistant. Use markdown when useful." };
    const messages = [sys, ...data.messages];

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: usedModel, messages }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Response(`AI error: ${t.slice(0, 300)}`, { status: 500 });
    }
    const json: any = await res.json();
    const reply = json?.choices?.[0]?.message?.content ?? "";

    let chatId = data.chatId;
    if (!chatId) {
      const title = data.messages[data.messages.length - 1]?.content.slice(0, 60) || "New chat";
      const { data: newChat } = await supabase.from("chats").insert({ user_id: userId, title }).select("id").single();
      chatId = (newChat as any)?.id;
    }
    if (chatId) {
      const last = data.messages[data.messages.length - 1];
      await supabase.from("chat_messages").insert([
        { chat_id: chatId, user_id: userId, role: last.role, content: last.content },
        { chat_id: chatId, user_id: userId, role: "assistant", content: reply },
      ]);
    }

    return { reply, chatId };
  });