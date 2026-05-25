import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbums } from "@/lib/queries";
import { FloatingDecor } from "@/components/FloatingDecor";
import { useTheme } from "@/components/ThemeProvider";
import { Search, Calendar, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/albums")({
  head: () => ({
    meta: [
      { title: "All Albums — Little Wonders" },
      { name: "description", content: "Browse every album in the baby memory journey — month by month and special events." },
      { property: "og:title", content: "All Albums — Little Wonders" },
      { property: "og:url", content: "/albums" },
    ],
    links: [{ rel: "canonical", href: "/albums" }],
  }),
  component: AlbumsPage,
});

function AlbumsPage() {
  const { setTheme } = useTheme();
  useEffect(() => { setTheme("default"); }, [setTheme]);

  const { data: albums = [] } = useQuery({ queryKey: ["albums"], queryFn: fetchAlbums });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "month" | "event">("all");

  const filtered = useMemo(() => {
    return albums.filter((a) => {
      if (filter !== "all" && a.category !== filter) return false;
      if (q && !`${a.album_name} ${a.subtitle ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [albums, q, filter]);

  return (
    <>
      <FloatingDecor variant="mixed" density={12} />
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center animate-fade-up">
            <p className="text-sm uppercase tracking-widest text-primary font-medium">All Memories</p>
            <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold text-gradient">The Album Library</h1>
            <p className="mt-3 text-muted-foreground">Search, filter, and step into any moment.</p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search albums…"
                className="w-full rounded-full bg-card border pl-11 pr-4 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex gap-2 bg-card border rounded-full p-1 shadow-soft">
              {(["all","month","event"] as const).map((k) => (
                <button key={k} onClick={() => setFilter(k)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${filter === k ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                  {k === "all" ? "All" : k === "month" ? "Months" : "Events"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((a, i) => (
              <Link
                key={a.id}
                to="/album/$slug"
                params={{ slug: a.slug }}
                className="story-card group block overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-accent/30">
                  {a.album_cover ? (
                    <img src={a.album_cover} alt={a.album_name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">{a.emoji}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <span className="absolute top-4 left-4 text-3xl drop-shadow">{a.emoji}</span>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="font-display text-2xl font-semibold leading-tight">{a.album_name}</h3>
                    {a.subtitle && <p className="text-sm opacity-90 mt-1">{a.subtitle}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 capitalize"><Calendar className="size-3.5" />{a.category}</span>
                  <span className="inline-flex items-center gap-1.5 capitalize"><ImageIcon className="size-3.5" />{a.theme_name}</span>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-20">No albums found 🧸</p>
          )}
        </div>
      </section>
    </>
  );
}
