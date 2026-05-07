import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-80"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg" />

      {/* floating orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-primary/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute top-40 right-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl animate-float" />
      <div aria-hidden className="pointer-events-none absolute top-72 left-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl animate-float" style={{ animationDelay: "1.2s" }} />

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full glass glow-border px-3.5 py-1.5 text-xs font-mono uppercase tracking-widest text-primary animate-fade-in-up">
          <Sparkles className="h-3.5 w-3.5" />
          Next-gen AI platform
        </span>

        <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          Transform Your Ideas Into{" "}
          <span className="text-gradient-primary">AI Solutions</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          TheRynzo Ai helps developers, creators, Minecraft owners and VPS users with
          advanced AI tools — fast responses, secure dashboards, and a futuristic UI built to scale.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "260ms" }}>
          <Link
            to="/ai-chat"
            className="group inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all hover:-translate-y-0.5"
          >
            <MessageSquare className="h-4 w-4" />
            Start AI Chat
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="https://discord.gg/UyCu489zmn"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/40 backdrop-blur px-6 py-3.5 text-sm font-medium text-foreground hover:border-primary/60 hover:bg-secondary/70 transition-all"
          >
            Join Discord
          </a>
        </div>

        {/* preview card */}
        <div className="relative mx-auto mt-16 max-w-3xl animate-fade-in-up" style={{ animationDelay: "360ms" }}>
          <div className="absolute -inset-6 -z-10 bg-primary/20 blur-3xl rounded-full" />
          <div className="glass glow-border rounded-2xl shadow-glow-lg overflow-hidden text-left">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs font-mono text-muted-foreground">therynzo.ai / chat</span>
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-[image:var(--gradient-primary)] shadow-glow grid place-items-center text-xs font-bold">R</div>
                <div className="rounded-2xl rounded-tl-sm border border-border bg-secondary/50 px-4 py-2.5 text-sm">
                  Hi, I'm <span className="text-primary font-medium">TheRynzo Ai</span>. How can I help you today?
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm text-primary-foreground shadow-glow">
                  Build me a Minecraft plugin with auto-restart logic.
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                <span className="shimmer-text">TheRynzo is thinking…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}