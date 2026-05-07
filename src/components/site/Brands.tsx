import { Server, Cloud, Bot, Code2, Cpu, Gamepad2 } from "lucide-react";

const items = [
  { Icon: Gamepad2, label: "Minecraft" },
  { Icon: Cloud, label: "Cloud VPS" },
  { Icon: Cpu, label: "AI Tools" },
  { Icon: Bot, label: "Discord Bots" },
  { Icon: Code2, label: "Web Dev" },
  { Icon: Server, label: "API Systems" },
];

export function Brands() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Trusted across modern tech stacks
        </p>
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {items.map(({ Icon, label }) => (
            <div
              key={label}
              className="group glass glow-border rounded-xl px-4 py-5 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover:shadow-glow"
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}