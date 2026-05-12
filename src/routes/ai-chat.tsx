import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Send, Loader2, Sparkles, Plus, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { sendChat } from "@/lib/chat.functions";

export const Route = createFileRoute("/ai-chat")({
  head: () => ({ meta: [{ title: "TheRynzo Ai Chat" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };
type ChatRow = { id: string; title: string; created_at: string };

function getChatErrorMessage(error: unknown) {
  if (error instanceof Response) return error.statusText || "AI did not reply. Try again.";
  const message = error instanceof Error ? error.message : String(error || "AI did not reply. Try again.");
  if (message.includes("sign in") || message.includes("Unauthorized")) return "Please sign in again, then send your message.";
  if (message.includes("API key") || message.includes("AI did not reply")) return message;
  if (message.includes("No active key")) return "Activate your key first to use AI chat.";
  if (message.includes("rate")) return "AI is busy right now. Try again shortly.";
  return "AI did not reply. Check the AI setup or try again.";
}

function ChatPage() {
  const { session, user, profile } = useAuth();
  const unlocked = !!profile?.has_active_key && !(profile as any)?.banned;
  const callChat = useServerFn(sendChat);

  const [chats, setChats] = useState<ChatRow[]>([]);
  const [chatId, setChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const loadChats = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("chats").select("id,title,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (error) return toast.error("Could not load chat history");
    setChats((data as ChatRow[]) ?? []);
  };
  useEffect(() => { if (user && unlocked) loadChats(); }, [user, unlocked]);

  const openChat = async (id: string) => {
    setChatId(id);
    setOpen(false);
    const { data, error } = await supabase.from("chat_messages").select("role,content").eq("chat_id", id).eq("user_id", user!.id).order("created_at", { ascending: true });
    if (error) return toast.error("Could not open chat history");
    setMessages(((data as any) ?? []).filter((m: any) => m.role !== "system"));
  };

  const newChat = () => { setChatId(undefined); setMessages([]); setOpen(false); };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Please sign in again before chatting.");
      const res: any = await callChat({ data: { accessToken, chatId, messages: next } });
      const reply = typeof res === "string" ? res : res?.reply;
      const nextChatId = typeof res === "object" && res ? res.chatId : undefined;
      if (!reply) throw new Error("AI did not reply. Check the AI setup or try again.");
      setMessages([...next, { role: "assistant", content: reply }]);
      if (nextChatId) setChatId(nextChatId);
      await loadChats();
    } catch (e: any) {
      const msg = getChatErrorMessage(e);
      toast.error(msg);
      setMessages([...next, { role: "assistant", content: msg }]);
    } finally { setBusy(false); }
  };

  if (!user) {
    return (
      <div className="pt-40 pb-16 px-4 text-center">
        <h1 className="text-3xl font-semibold">Sign in to use <span className="text-gradient-primary">AI Chat</span></h1>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">Login</Link>
          <Link to="/register" className="rounded-xl border border-border px-5 py-3 text-sm">Register</Link>
        </div>
      </div>
    );
  }

  if ((profile as any)?.banned) {
    return (
      <div className="pt-40 pb-16 px-4 text-center">
        <h1 className="text-3xl font-semibold text-destructive">Account Banned</h1>
        <p className="mt-3 text-muted-foreground">Your account has been suspended. Contact support.</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="pt-40 pb-16 px-4 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl glass glow-border shadow-glow"><KeyRound className="h-7 w-7 text-primary" /></div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold">Redeem Key <span className="text-gradient-primary">Required</span></h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Activate a redeem key to unlock AI Chat.</p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <a href="https://discord.gg/UyCu489zmn" target="_blank" rel="noreferrer" className="rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">Get a Key on Discord</a>
          <Link to="/dashboard" className="rounded-xl border border-border px-5 py-3 text-sm">Add Key</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform fixed md:static z-30 top-16 bottom-0 md:top-auto md:bottom-auto md:h-auto left-0 w-72 border-r border-border bg-background/95 backdrop-blur p-3 flex flex-col`}>
        <button onClick={newChat} className="flex items-center gap-2 rounded-xl border border-primary/40 px-3 py-2 text-sm hover:bg-primary/10">
          <Plus className="h-4 w-4 text-primary" /> New chat
        </button>
        <div className="mt-3 flex-1 overflow-y-auto space-y-1">
          {chats.map((c) => (
            <button key={c.id} onClick={() => openChat(c.id)} className={`w-full text-left truncate rounded-lg px-3 py-2 text-sm hover:bg-secondary/60 ${chatId === c.id ? "bg-secondary/80 text-primary" : "text-muted-foreground"}`}>
              <MessageSquare className="inline h-3 w-3 mr-2" />{c.title}
            </button>
          ))}
          {chats.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">No chats yet</p>}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <button onClick={() => setOpen((v) => !v)} className="md:hidden rounded-lg border border-border p-2">
            <MessageSquare className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> TheRynzo <span className="text-gradient-primary">Ai</span>
          </div>
          <div className="w-9 md:hidden" />
        </header>

        <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.length === 0 && (
              <div className="text-center pt-20">
                <h2 className="text-3xl font-semibold">Ready when you are.</h2>
                <p className="mt-2 text-muted-foreground">Ask TheRynzo Ai anything.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-glow" : "glass glow-border"}`}>
                  {m.role === "assistant"
                    ? <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                    : <p className="whitespace-pre-wrap">{m.content}</p>}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="glass glow-border rounded-2xl px-4 py-3 text-sm inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Thinking…
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-background/95 px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-primary/35 bg-input/70 p-2 shadow-glow transition-all focus-within:border-primary focus-within:shadow-glow-lg">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask anything"
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none max-h-40 placeholder:text-muted-foreground/80"
              />
              <button onClick={send} disabled={busy || !input.trim()} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-glow disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">TheRynzo Ai may make mistakes. Verify important info.</p>
          </div>
        </div>
      </main>
    </div>
  );
}