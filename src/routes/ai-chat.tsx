import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/ai-chat")({
  head: () => ({ meta: [{ title: "AI Chat — TheRynzo Ai" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { user, profile } = useAuth();
  const unlocked = !!profile?.has_active_key;

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

  if (!unlocked) {
    return (
      <div className="pt-40 pb-16 px-4 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl glass glow-border shadow-glow"><KeyRound className="h-7 w-7 text-primary" /></div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold">Redeem Key <span className="text-gradient-primary">Required</span></h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Activate a redeem key to unlock AI Chat.</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="https://discord.gg/UyCu489zmn" target="_blank" rel="noreferrer" className="rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">Get a Key on Discord</a>
          <Link to="/dashboard" className="rounded-xl border border-border px-5 py-3 text-sm">Add Key</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 px-4">
      <div className="mx-auto max-w-3xl glass glow-border rounded-2xl p-6 shadow-glow">
        <h1 className="text-xl font-semibold">TheRynzo AI Chat</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hi, I'm TheRynzo Ai. The full chat backend launches in the next update — your key is active and ready.</p>
      </div>
    </div>
  );
}
