import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/albums", label: "Albums" },
  { to: "/videos", label: "Videos" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-4">
        <nav className="flex items-center justify-between rounded-full bg-card/80 backdrop-blur-md border shadow-soft px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <Sparkles className="size-5 text-primary" />
            <span className="text-gradient">Little Wonders</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-4 py-2 rounded-full text-sm font-medium hover:bg-accent transition"
                activeProps={{ className: "bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border hover:bg-accent transition">
                <Shield className="size-3.5" /> Admin
              </Link>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-full hover:bg-accent" aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
        <div className={cn("md:hidden overflow-hidden transition-all duration-300", open ? "max-h-96 mt-2 opacity-100" : "max-h-0 opacity-0")}>
          <div className="rounded-3xl bg-card/95 backdrop-blur-md border shadow-soft p-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-4 py-3 rounded-2xl text-sm font-medium hover:bg-accent transition"
                activeProps={{ className: "px-4 py-3 rounded-2xl text-sm font-medium bg-primary text-primary-foreground" }}
                activeOptions={{ exact: l.to === "/" }}>
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="px-4 py-3 rounded-2xl text-sm font-medium hover:bg-accent transition inline-flex items-center gap-2">
                <Shield className="size-4" /> Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
