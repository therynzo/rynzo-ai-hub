import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAdminAiConfig } from "./chat.server";

type Msg = { role: "system" | "user" | "assistant"; content: string };

type AiAttempt = { name: string; url: string; apiKey: string; model: string };

function extractReply(json: any) {
  const content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.delta?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part) => part?.text ?? part?.content ?? "").join("\n").trim();
  if (typeof json?.output_text === "string") return json.output_text.trim();
  return "";
}

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
    const model = (settings?.default_model || "google/gemini-3-flash-preview").trim();
    const gatewayModel = model.startsWith("google/") || model.startsWith("openai/") ? model : "google/gemini-3-flash-preview";

    const sys: Msg = { role: "system", content: "You are TheRynzo Ai — a helpful, professional AI assistant. Use markdown when useful." };
    const messages = [sys, ...cleanMessages];
    const attempts: AiAttempt[] = [];
    if (provider === "openai" && settings?.openai_enabled && secrets.OPENAI_API_KEY) {
      attempts.push({ name: "OpenAI", url: "https://api.openai.com/v1/chat/completions", apiKey: secrets.OPENAI_API_KEY, model: model.startsWith("gpt") || model.startsWith("openai/") ? model.replace(/^openai\//, "") : "gpt-4o-mini" });
    }
    if (provider === "gemini" && settings?.gemini_enabled && secrets.GEMINI_API_KEY) {
      attempts.push({ name: "Gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", apiKey: secrets.GEMINI_API_KEY, model: model.startsWith("gemini-") ? model : "gemini-2.0-flash" });
    }
    if (process.env.LOVABLE_API_KEY) attempts.push({ name: "Lovable AI", url: "https://ai.gateway.lovable.dev/v1/chat/completions", apiKey: process.env.LOVABLE_API_KEY, model: gatewayModel });
    if (!attempts.length) throw new Response("AI not configured. Admin must set an API key.", { status: 500 });

    let reply = "";
    let lastStatus = 500;
    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${attempt.apiKey}` },
          body: JSON.stringify({ model: attempt.model, messages, temperature: 0.7, max_tokens: 4096 }),
        });
        lastStatus = res.status;
        const raw = await res.text();
        if (!res.ok) {
          console.error("[chat] AI provider error", attempt.name, res.status, raw.slice(0, 500));
          continue;
        }
        reply = extractReply(JSON.parse(raw));
        if (reply) break;
        console.error("[chat] Empty AI reply", attempt.name, raw.slice(0, 500));
      } catch (err) {
        console.error("[chat] AI attempt failed", attempt.name, err);
      }
    }
    if (!reply) throw new Response("AI did not reply. Check the API key/provider in Admin dashboard.", { status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502 });

    let chatId = data.chatId;
    if (!chatId) {
      const title = last.content.slice(0, 60) || "New chat";
      const { data: newChat } = await supabase.from("chats").insert({ user_id: userId, title }).select("id").single();
      chatId = (newChat as any)?.id;
    } else {
      const { data: ownChat } = await supabase.from("chats").select("id").eq("id", chatId).eq("user_id", userId).maybeSingle();
      if (!ownChat) throw new Response("Chat not found", { status: 404 });
    }
    if (chatId) {
      await supabase.from("chat_messages").insert([
        { chat_id: chatId, user_id: userId, role: last.role, content: last.content },
        { chat_id: chatId, user_id: userId, role: "assistant", content: reply },
      ]);
    }

    return { reply, chatId };
  });