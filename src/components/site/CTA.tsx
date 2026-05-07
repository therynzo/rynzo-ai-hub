import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 mt-28">
      <div className="relative overflow-hidden rounded-3xl glass glow-border p-10 md:p-16 text-center shadow-glow-lg">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[700px] rounded-full bg-primary/30 blur-[120px]" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-60" />
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
          Ready to build with <span className="text-gradient-primary">TheRynzo Ai</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Get a redeem key in our Discord and unlock the full AI workspace today.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://discord.gg/UyCu489zmn"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all"
          >
            Get a redeem key
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-6 py-3.5 text-sm font-medium hover:border-primary/60 transition-all"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}