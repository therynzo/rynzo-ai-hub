import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/site/SectionHeader";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — TheRynzo Ai" },
      { name: "description", content: "Explore TheRynzo Ai features: chat, redeem keys, dashboards, secure auth, OpenAI & Gemini integrations." },
      { property: "og:title", content: "Features — TheRynzo Ai" },
      { property: "og:description", content: "Powerful AI features in a futuristic dark interface." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="pt-36 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Platform Features"
          title={<>Built for <span className="text-gradient-primary">creators & developers</span></>}
          description="A complete AI workspace with the security, control and polish a modern team needs."
        />
        <FeatureGrid />
      </div>
      <CTA />
    </div>
  );
}