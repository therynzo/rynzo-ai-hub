import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogIn, UserPlus, LogOut, User as UserIcon, Shield } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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
  const { user, profile, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    toast.success("Signed out");
    nav({ to: "/" });
  };

  const initial = (profile?.username || profile?.email || user?.email || "U").charAt(0).toUpperCase();

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
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-primary hover:bg-secondary transition-colors">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-secondary transition-colors"
                >
                  <span className="h-7 w-7 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-xs font-bold text-primary-foreground">
                    {initial}
                  </span>
                  <span className="max-w-[120px] truncate">{profile?.username ?? "Profile"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-primary border border-primary/40 hover:bg-primary/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm text-foreground/90 hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-primary-foreground bg-[image:var(--gradient-primary)] shadow-glow hover:shadow-glow-lg transition-all"
                >
                  <UserPlus className="h-4 w-4" /> Register
                </Link>
              </>
            )}
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
              {user ? (
                <div className="mt-2 grid gap-2">
                  <Link to="/profile" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border border-border hover:bg-secondary">
                    <UserIcon className="h-4 w-4" /> Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border border-border hover:bg-secondary">
                      <Shield className="h-4 w-4" /> Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary border border-primary/40 hover:bg-primary/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-center border border-border hover:bg-secondary">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-center text-primary-foreground bg-[image:var(--gradient-primary)] shadow-glow">
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}