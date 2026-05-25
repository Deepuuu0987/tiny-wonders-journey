import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({ meta: [{ title: "Admin Login — Little Wonders" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const email = username.trim().toLowerCase().includes("@")
      ? username.trim().toLowerCase()
      : `${username.trim().toLowerCase()}@admin.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Invalid username or password");
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/admin" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-hero-gradient">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 font-display text-2xl font-semibold">
          <Sparkles className="size-6 text-primary" />
          <span className="text-gradient">Little Wonders</span>
        </Link>
        <div className="rounded-3xl bg-card/90 backdrop-blur border shadow-dreamy p-8">
          <h1 className="font-display text-3xl font-semibold text-center">Admin Sign In</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Manage your baby memory journey</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Username</label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Anvithasri"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition"
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to site</Link>
        </p>
      </div>
    </section>
  );
}
