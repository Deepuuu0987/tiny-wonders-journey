import { useState } from "react";
import { Play, X } from "lucide-react";

export function VideoPlayer({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const thumb = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  return (
    <>
      <button onClick={() => setOpen(true)} className="story-card group relative block w-full overflow-hidden text-left">
        <div className="aspect-video relative">
          <img src={thumb} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/30 grid place-items-center">
            <span className="size-16 rounded-full bg-white/95 grid place-items-center shadow-dreamy group-hover:scale-110 transition">
              <Play className="size-7 text-primary fill-primary ml-1" />
            </span>
          </div>
        </div>
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90 grid place-items-center p-4 animate-fade-up" onClick={() => setOpen(false)}>
          <button className="absolute top-5 right-5 size-11 rounded-full bg-white/10 text-white grid place-items-center" onClick={() => setOpen(false)}><X /></button>
          <div className="w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="w-full h-full rounded-2xl shadow-dreamy"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
