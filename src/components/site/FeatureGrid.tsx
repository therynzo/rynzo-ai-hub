import {
  MessageSquare, KeyRound, LayoutDashboard, ShieldCheck,
  History, Moon, Lock, Zap, Brain, Ticket,
} from "lucide-react";

const features = [
  { Icon: MessageSquare, title: "AI Chat Assistant", desc: "Conversational AI with context memory and lightning responses." },
  { Icon: KeyRound, title: "API Key System", desc: "Generate, rotate, and revoke API keys for secure access." },
  { Icon: LayoutDashboard, title: "Member Dashboard", desc: "Track usage, credits and chat history at a glance." },
  { Icon: ShieldCheck, title: "Admin Dashboard", desc: "Full control: users, providers, analytics and settings." },
  { Icon: History, title: "Chat History", desc: "Searchable, exportable conversations across devices." },
  { Icon: Moon, title: "Dark Mode UI", desc: "A futuristic dark UI engineered for long sessions." },
  { Icon: Lock, title: "Secure Login", desc: "JWT auth with hashed passwords and session controls." },
  { Icon: Zap, title: "Fast Responses", desc: "Optimized streaming for low-latency answers." },
  { Icon: Brain, title: "OpenAI + Gemini", desc: "Switch providers seamlessly from one interface." },
  { Icon: Ticket, title: "Redeem Key System", desc: "Activate access via redeem keys with expiry & limits." },
];

export function FeatureGrid() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ Icon, title, desc }, i) => (
        <div
          key={title}
          className="group relative rounded-2xl p-6 glass glow-border transition-all hover:-translate-y-1 hover:shadow-glow"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(120%_80%_at_50%_0%,oklch(0.62_0.235_25/0.18),transparent_60%)]" />
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>
  );
}