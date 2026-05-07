import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative">
        <span className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
        <img
          src={logo}
          alt="TheRynzo Ai"
          width={36}
          height={36}
          className="h-9 w-9 object-contain drop-shadow-[0_0_12px_oklch(0.62_0.235_25/0.7)]"
        />
      </span>
      {withText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          TheRynzo <span className="text-gradient-primary">Ai</span>
        </span>
      )}
    </Link>
  );
}