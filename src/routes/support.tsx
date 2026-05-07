import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, KeyRound, Mail } from "lucide-react";
import { SectionHeader } from "@/components/site/SectionHeader";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — TheRynzo Ai" }] }),
  component: () => (
    <div className="pt-36 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Support" title={<>How can we <span className="text-gradient-primary">help you</span>?</>} description="Connect with our team on Discord." />
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <a href="https://discord.gg/UyCu489zmn" target="_blank" rel="noreferrer" className="group glass glow-border rounded-2xl p-7 hover:-translate-y-1 hover:shadow-glow transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow text-primary-foreground"><MessageCircle className="h-5 w-5" /></div>
            <h3 className="mt-5 text-lg font-semibold">Discord Community</h3>
            <p className="mt-2 text-sm text-muted-foreground">Real-time help and the fastest way to get a redeem key.</p>
          </a>
          <div className="glass glow-border rounded-2xl p-7">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow text-primary-foreground"><KeyRound className="h-5 w-5" /></div>
            <h3 className="mt-5 text-lg font-semibold">How to get a key?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Join our Discord or contact admin to receive a redeem key.</p>
            <a href="mailto:mail@rynzo.eu.cc" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"><Mail className="h-4 w-4" /> mail@rynzo.eu.cc</a>
          </div>
        </div>
      </div>
    </div>
  ),
});
