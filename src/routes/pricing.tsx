import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — TheRynzo Ai" }, { name: "description", content: "Simple pricing for TheRynzo Ai." }] }),
  component: PricingPage,
});

const tiers = [
  { name: "Starter", price: "Free", desc: "For trying out the platform.", features: ["100 AI messages / mo", "Basic chat history", "Community support"], highlight: false },
  { name: "Pro", price: "$19", suffix: "/mo", desc: "For active creators & devs.", features: ["Unlimited chats", "OpenAI + Gemini", "Member dashboard", "Priority responses"], highlight: true },
  { name: "Studio", price: "$49", suffix: "/mo", desc: "For teams & studios.", features: ["Everything in Pro", "Team workspace", "API key system", "Premium support"], highlight: false },
];

function PricingPage() {
  return (
    <div className="pt-36 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Pricing" title={<>Simple, <span className="text-gradient-primary">honest pricing</span></>} description="Start free. Upgrade when you're ready." />
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-2xl p-7 glass glow-border transition-all ${t.highlight ? "shadow-glow-lg -translate-y-1" : "hover:-translate-y-1 hover:shadow-glow"}`}>
              {t.highlight && (<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[image:var(--gradient-primary)] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-primary-foreground shadow-glow">Most popular</span>)}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-semibold text-gradient-primary">{t.price}</span>
                {t.suffix && <span className="text-sm text-muted-foreground mb-1">{t.suffix}</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="h-3 w-3" /></span>{f}
                  </li>
                ))}
              </ul>
              <a href="https://discord.gg/UyCu489zmn" target="_blank" rel="noreferrer" className={`mt-7 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${t.highlight ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-glow hover:shadow-glow-lg" : "border border-border hover:border-primary/60"}`}>Get a key on Discord</a>
            </div>
          ))}
        </div>
      </div>
      <CTA />
    </div>
  );
}
