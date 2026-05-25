import { Link } from "@tanstack/react-router";
import type { Album } from "@/data/albums";
import { ImageIcon, Calendar } from "lucide-react";

export function AlbumCard({ album, index = 0 }: { album: Album; index?: number }) {
  return (
    <Link
      to="/album/$slug"
      params={{ slug: album.slug }}
      className="story-card group block overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={album.cover}
          alt={album.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="absolute top-4 left-4 text-3xl drop-shadow">{album.emoji}</span>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="font-display text-2xl font-semibold leading-tight">{album.title}</h3>
          <p className="text-sm opacity-90 mt-1">{album.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />{album.date}</span>
        <span className="inline-flex items-center gap-1.5"><ImageIcon className="size-3.5" />{album.photos.length} photos</span>
      </div>
    </Link>
  );
}
