import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Brands } from "@/components/site/Brands";
import { SectionHeader } from "@/components/site/SectionHeader";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { Stats } from "@/components/site/Stats";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TheRynzo Ai — Transform Your Ideas Into AI Solutions" },
      { name: "description", content: "Futuristic AI platform with chat, dashboards, redeem keys and integrations for developers, creators and Minecraft owners." },
      { property: "og:title", content: "TheRynzo Ai" },
      { property: "og:description", content: "Futuristic AI platform with chat, dashboards and integrations." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Brands />
      <section className="relative mx-auto max-w-7xl px-4 mt-24">
        <SectionHeader
          eyebrow="Take Full Control"
          title={<>Business <span className="text-gradient-primary">Application</span></>}
          description="Everything you need to ship AI-powered products — beautifully integrated and built for speed."
        />
        <FeatureGrid />
      </section>
      <section className="relative mx-auto max-w-7xl px-4 mt-24">
        <Stats />
      </section>
      <CTA />
    </>
  );
}
