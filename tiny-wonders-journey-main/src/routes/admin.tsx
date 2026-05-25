import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlbumsManager } from "@/components/admin/AlbumsManager";
import { PhotosManager } from "@/components/admin/PhotosManager";
import { VideosManager } from "@/components/admin/VideosManager";
import { LogOut, Images, Film, FolderHeart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Little Wonders" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

type Tab = "albums" | "photos" | "videos";

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading, user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("albums");

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/admin/login" });
      else if (!isAdmin) navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading…</div></div>;
  }

  const tabs: { id: Tab; label: string; icon: typeof Images }[] = [
    { id: "albums", label: "Albums", icon: FolderHeart },
    { id: "photos", label: "Photos", icon: Images },
    { id: "videos", label: "Videos", icon: Film },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-background to-accent/20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-medium">
              <Sparkles className="size-3.5" /> Admin
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage albums, upload photos, curate videos.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="rounded-full border px-4 py-2 text-sm hover:bg-accent">View Site</Link>
            <button onClick={() => signOut().then(() => navigate({ to: "/" }))} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-destructive/10 text-destructive">
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </div>

        <div className="rounded-full bg-card border shadow-soft p-1 inline-flex gap-1 mb-6 overflow-x-auto max-w-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-card/60 border p-4 sm:p-6 shadow-soft">
          {tab === "albums" && <AlbumsManager />}
          {tab === "photos" && <PhotosManager />}
          {tab === "videos" && <VideosManager />}
        </div>
      </div>
    </div>
  );
}
