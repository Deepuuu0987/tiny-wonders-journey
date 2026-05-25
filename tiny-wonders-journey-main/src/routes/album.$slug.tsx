import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbumBySlug, fetchPhotos } from "@/lib/queries";
import { useTheme } from "@/components/ThemeProvider";
import type { ThemeKey } from "@/data/albums";
import { FloatingDecor } from "@/components/FloatingDecor";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { ArrowLeft, LayoutGrid, Rows3 } from "lucide-react";

export const Route = createFileRoute("/album/$slug")({
  loader: async ({ params }) => {
    const album = await fetchAlbumBySlug(params.slug);
    if (!album) throw notFound();
    return { album };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.album;
    if (!a) return {};
    return {
      meta: [
        { title: `${a.album_name} — Little Wonders` },
        { name: "description", content: `${a.subtitle ?? ""} — photos from our baby's journey.` },
        { property: "og:title", content: `${a.album_name} — Little Wonders` },
        { property: "og:description", content: a.subtitle ?? "" },
        ...(a.album_cover ? [{ property: "og:image", content: a.album_cover }] : []),
        { property: "og:url", content: `/album/${a.slug}` },
      ],
      links: [{ rel: "canonical", href: `/album/${a.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="pt-40 text-center">
      <p className="text-5xl mb-3">🧸</p>
      <h1 className="font-display text-3xl">Album not found</h1>
      <Link to="/albums" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-primary-foreground text-sm">All albums</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="pt-40 text-center">
      <h1 className="font-display text-3xl">Couldn't open this album</h1>
      <button onClick={reset} className="mt-6 rounded-full bg-primary px-5 py-2.5 text-primary-foreground text-sm">Try again</button>
    </div>
  ),
  component: AlbumPage,
});

function AlbumPage() {
  const { album } = Route.useLoaderData();
  const { setTheme } = useTheme();
  const [view, setView] = useState<"masonry" | "grid">("masonry");

  const { data: photos = [] } = useQuery({
    queryKey: ["photos", album.id],
    queryFn: () => fetchPhotos(album.id),
  });

  useEffect(() => {
    setTheme(album.theme_name as ThemeKey);
    return () => setTheme("default");
  }, [album.theme_name, setTheme]);

  const isParty = album.theme_name === "party" || album.theme_name === "celebration";
  const images = photos.map((p) => ({ key: p.id, src: p.image_url }));

  const renderOverlay = ({ images, index, onIndexChange, visible, onClose }: any) => (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-50 transition-all ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 px-4 pb-4 pointer-events-auto">
        <button
          type="button"
          onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
          className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
        >
          Previous
        </button>
        <div className="flex flex-1 gap-2 overflow-x-auto rounded-3xl border border-white/10 bg-black/40 p-2 shadow-lg">
          {images.map((img: any, idx: number) => (
            <button
              key={img.key}
              type="button"
              onClick={() => onIndexChange(idx)}
              className={`shrink-0 rounded-2xl overflow-hidden border-2 ${idx === index ? "border-primary" : "border-transparent"}`}
            >
              <img src={img.src} alt={`Preview ${idx + 1}`} className="h-16 w-24 object-cover" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onIndexChange((index + 1) % images.length)}
          className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
        >
          Next
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      <FloatingDecor variant={isParty ? "confetti" : "mixed"} density={isParty ? 30 : 14} />

      <section className="pt-32 pb-12 px-4 sm:px-6 bg-hero-gradient">
        <div className="mx-auto max-w-6xl text-center">
          <Link to="/albums" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-6">
            <ArrowLeft className="size-4" /> All albums
          </Link>
          <div className="text-6xl mb-3 animate-float inline-block">{album.emoji}</div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-gradient animate-fade-up">{album.album_name}</h1>
          {album.subtitle && <p className="mt-3 text-lg text-foreground/75 animate-fade-up" style={{ animationDelay: "120ms" }}>{album.subtitle}</p>}
          <p className="mt-2 text-sm text-muted-foreground">{photos.length} photos</p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {photos.length > 0 && (
            <div className="flex justify-end mb-6">
              <div className="flex gap-1 bg-card border rounded-full p-1 shadow-soft">
                <button onClick={() => setView("masonry")} className={`p-2 rounded-full ${view === "masonry" ? "bg-primary text-primary-foreground" : ""}`} aria-label="Masonry"><Rows3 className="size-4" /></button>
                <button onClick={() => setView("grid")} className={`p-2 rounded-full ${view === "grid" ? "bg-primary text-primary-foreground" : ""}`} aria-label="Grid"><LayoutGrid className="size-4" /></button>
              </div>
            </div>
          )}

          {photos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-muted-foreground">No photos in this album yet.</p>
            </div>
          ) : (
            <PhotoProvider
              maskClosable
              photoClosable
              loop
              overlayRender={renderOverlay}
            >
              {view === "masonry" ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
                  {photos.map((p, i) => (
                    <PhotoView key={p.id} src={p.image_url}>
                      <button type="button" className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl shadow-soft hover:shadow-dreamy transition group">
                        <img src={p.thumbnail_url ?? p.image_url} alt={p.caption ?? `${album.album_name} photo ${i + 1}`} loading="lazy" className="w-full h-auto group-hover:scale-105 transition-transform duration-500" />
                      </button>
                    </PhotoView>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((p, i) => (
                    <PhotoView key={p.id} src={p.image_url}>
                      <button type="button" className="aspect-square overflow-hidden rounded-2xl shadow-soft hover:shadow-dreamy transition group">
                        <img src={p.thumbnail_url ?? p.image_url} alt={p.caption ?? `${album.album_name} photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </button>
                    </PhotoView>
                  ))}
                </div>
              )}
            </PhotoProvider>
          )}
        </div>
      </section>
    </>
  );
}
