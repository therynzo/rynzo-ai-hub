import { Link } from "@tanstack/react-router";
import { Github, MessageCircle, Twitter, Send } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Advanced AI tools for developers, creators, Minecraft owners and VPS users.
              Built with passion for the future.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: MessageCircle, href: "https://discord.gg/UyCu489zmn", label: "Discord" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Github, href: "#", label: "GitHub" },
                { Icon: Send, href: "#", label: "Telegram" },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"
                   className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-primary hover:border-primary/60 hover:shadow-glow transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: [["Features","/features"],["AI Chat","/ai-chat"],["Pricing","/pricing"]] },
            { title: "Company", links: [["About","/about"],["Support","/support"],["Discord","https://discord.gg/UyCu489zmn"]] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("http") ? (
                      <a href={href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>
                    ) : (
                      <Link to={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">TheRynzo Ai © 2026 — All Rights Reserved</p>
          <p className="text-xs text-muted-foreground font-mono">Built for the AI generation.</p>
        </div>
      </div>
    </footer>
  );
}