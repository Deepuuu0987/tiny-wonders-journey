import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, startIndex, onClose }: Props) {
  const [i, setI] = useState(startIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => { setZoom(1); setI((v) => (v + 1) % images.length); };
  const prev = () => { setZoom(1); setI((v) => (v - 1 + images.length) % images.length); };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-up">
      <button onClick={onClose} className="absolute top-5 right-5 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center" aria-label="Close">
        <X />
      </button>
      <div className="absolute top-5 left-5 flex gap-2">
        <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="size-11 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"><ZoomIn /></button>
        <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="size-11 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"><ZoomOut /></button>
      </div>
      <button onClick={prev} className="absolute left-3 md:left-8 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"><ChevronLeft /></button>
      <div className="max-w-[92vw] max-h-[85vh] overflow-auto">
        <img
          src={images[i]}
          alt=""
          style={{ transform: `scale(${zoom})`, transition: "transform 0.3s" }}
          className="max-w-[92vw] max-h-[85vh] object-contain rounded-2xl select-none"
        />
      </div>
      <button onClick={next} className="absolute right-3 md:right-8 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"><ChevronRight /></button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">{i + 1} / {images.length}</div>
    </div>
  );
}
