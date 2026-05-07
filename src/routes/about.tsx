import { createFileRoute } from "@tanstack/react-router";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Stats } from "@/components/site/Stats";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — TheRynzo Ai" }, { name: "description", content: "Meet TheRynzo." }] }),
  component: () => (
    <div className="pt-36 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="About" title={<>Who is <span className="text-gradient-primary">TheRynzo</span>?</>} description="Minecraft Server Developer, Cloud VPS Developer, AI Creator and Full Stack Developer." />
        <div className="mt-12"><Stats /></div>
      </div>
      <CTA />
    </div>
  ),
});
