import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAdminAiConfig } from "./chat.server";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { chatId?: string; messages: Msg[] }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const cleanMessages = data.messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-24);
    const last = cleanMessages[cleanMessages.length - 1];
    if (!last || last.role !== "user") throw new Response("Send a message first.", { status: 400 });

    const { data: prof } = await supabase.from("profiles").select("has_active_key,banned").eq("id", userId).maybeSingle();
    if (!prof) throw new Response("Profile not found", { status: 404 });
    if ((prof as any).banned) throw new Response("Account banned", { status: 403 });
    if (!(prof as any).has_active_key) throw new Response("No active key", { status: 402 });

    const { settings, secrets } = await getAdminAiConfig();

    const provider = settings?.default_provider ?? "lovable";
    const model = settings?.default_model ?? "google/gemini-3-flash-preview";

    let url = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let apiKey = process.env.LOVABLE_API_KEY ?? "";
    let usedModel = model;

    if (provider === "openai" && settings?.openai_enabled && secrets.OPENAI_API_KEY) {
      url = "https://api.openai.com/v1/chat/completions";
      apiKey = secrets.OPENAI_API_KEY;
      usedModel = model.startsWith("gpt") || model.startsWith("openai/") ? model.replace(/^openai\//, "") : "gpt-4o-mini";
    } else if (provider === "gemini" && settings?.gemini_enabled && secrets.GEMINI_API_KEY) {
      url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      apiKey = secrets.GEMINI_API_KEY;
      usedModel = model.startsWith("gemini") ? model : model.replace(/^google\//, "");
    }

    if (!apiKey) throw new Response("AI not configured. Admin must set an API key.", { status: 500 });

    const sys: Msg = { role: "system", content: "You are TheRynzo Ai — a helpful, professional AI assistant. Use markdown when useful." };
    const messages = [sys, ...cleanMessages];

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: usedModel, messages, temperature: 0.7, max_tokens: 2048 }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("[chat] AI provider error", res.status, t.slice(0, 500));
      const message = res.status === 401 || res.status === 403
        ? "AI API key is invalid. Please check it in Admin dashboard."
        : res.status === 429
          ? "AI is busy or rate limited. Try again shortly."
          : res.status === 402
            ? "AI credits are not available. Please check the AI account."
            : "AI did not reply. Check the API key/provider in Admin dashboard.";
      throw new Response(message, { status: res.status >= 400 && res.status < 600 ? res.status : 500 });
    }
    const json: any = await res.json();
    const reply = String(json?.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) throw new Response("AI returned an empty reply. Please try again.", { status: 502 });

    let chatId = data.chatId;
    if (!chatId) {
      const title = last.content.slice(0, 60) || "New chat";
      const { data: newChat } = await supabase.from("chats").insert({ user_id: userId, title }).select("id").single();
      chatId = (newChat as any)?.id;
    }
    if (chatId) {
      await supabase.from("chat_messages").insert([
        { chat_id: chatId, user_id: userId, role: last.role, content: last.content },
        { chat_id: chatId, user_id: userId, role: "assistant", content: reply },
      ]);
    }

    return { reply, chatId };
  });