import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/ai-chat", label: "AI Chat" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`glass glow-border rounded-2xl px-4 sm:px-5 py-2.5 flex items-center justify-between transition-all ${
            scrolled ? "shadow-glow" : ""
          }`}
        >
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/support"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm text-foreground/90 hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogIn className="h-4 w-4" /> Login
            </Link>
            <Link
              to="/support"
              className="group relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-primary-foreground bg-[image:var(--gradient-primary)] shadow-glow hover:shadow-glow-lg transition-all"
            >
              <UserPlus className="h-4 w-4" /> Register
            </Link>
          </div>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/60 hover:bg-secondary transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden mt-2 glass glow-border rounded-2xl p-3 animate-fade-in-up">
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg"
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "text-foreground bg-secondary/60" }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/support" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-center border border-border hover:bg-secondary">
                  Login
                </Link>
                <Link to="/support" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-center text-primary-foreground bg-[image:var(--gradient-primary)] shadow-glow">
                  Register
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}