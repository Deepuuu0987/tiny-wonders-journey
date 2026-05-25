import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAlbums, fetchPhotos, type DbAlbum, type DbPhoto } from "@/lib/queries";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Upload, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

const ACCEPT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const ACCEPT_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

const getFileExtension = (file: File) => file.name.split(".").pop()?.toLowerCase();
const isSupportedImage = (file: File) => {
  if (ACCEPT_TYPES.has(file.type.toLowerCase())) return true;
  const ext = getFileExtension(file);
  return ext ? ACCEPT_EXTENSIONS.has(ext) : false;
};

export function PhotosManager() {
  const [albums, setAlbums] = useState<DbAlbum[]>([]);
  const [albumId, setAlbumId] = useState<string>("");
  const [photos, setPhotos] = useState<DbPhoto[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAlbums().then((a) => { setAlbums(a); if (!albumId && a[0]) setAlbumId(a[0].id); }); }, []);
  useEffect(() => { if (albumId) fetchPhotos(albumId).then(setPhotos); }, [albumId]);

  const currentAlbum = albums.find((a) => a.id === albumId);

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter(isSupportedImage).slice(0, 100);
    if (list.length === 0) return toast.error("No valid images selected. Use JPG, JPEG, PNG, WEBP, HEIC, or HEIF.");
    const items: UploadItem[] = list.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
    }));
    setUploads((prev) => [...prev, ...items]);
  };

  const startUpload = async () => {
    if (!currentAlbum) return;
    const pending = uploads.filter((u) => u.status === "pending");
    if (pending.length === 0) return;

    const startOrder = (photos.at(-1)?.display_order ?? 0) + 1;

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, status: "uploading", progress: 5 } : u));
      try {
        const { full, thumb } = await optimizeImage(item.file);
        setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, progress: 40 } : u));

        const stamp = `${Date.now()}-${i}`;
        const fullPath = `${currentAlbum.slug}/${stamp}-${full.name}`;
        const thumbPath = `${currentAlbum.slug}/thumbs/${stamp}-${thumb.name}`;

        const up1 = await supabase.storage.from("album-photos").upload(fullPath, full, { contentType: "image/webp" });
        if (up1.error) throw up1.error;
        setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, progress: 70 } : u));

        const up2 = await supabase.storage.from("album-photos").upload(thumbPath, thumb, { contentType: "image/webp" });
        if (up2.error) throw up2.error;

        const { data: fullUrl } = supabase.storage.from("album-photos").getPublicUrl(fullPath);
        const { data: thumbUrl } = supabase.storage.from("album-photos").getPublicUrl(thumbPath);

        const { error: dbErr } = await supabase.from("photos").insert({
          album_id: currentAlbum.id,
          image_url: fullUrl.publicUrl,
          thumbnail_url: thumbUrl.publicUrl,
          display_order: startOrder + i,
        });
        if (dbErr) throw dbErr;

        setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, progress: 100, status: "done" } : u));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, status: "error", error: msg } : u));
      }
    }

    fetchPhotos(currentAlbum.id).then(setPhotos);
    toast.success("Upload complete!");
  };

  const clearDone = () => setUploads((prev) => prev.filter((u) => u.status !== "done"));

  const removePhoto = async (p: DbPhoto) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("photos").delete().eq("id", p.id);
    fetchPhotos(albumId).then(setPhotos);
    toast.success("Photo removed");
  };

  const saveCaption = async (id: string) => {
    await supabase.from("photos").update({ caption: captionDraft }).eq("id", id);
    setEditingCaption(null);
    fetchPhotos(albumId).then(setPhotos);
  };

  const movePhoto = async (p: DbPhoto, dir: -1 | 1) => {
    const idx = photos.findIndex((x) => x.id === p.id);
    const other = photos[idx + dir];
    if (!other) return;
    await supabase.from("photos").update({ display_order: other.display_order }).eq("id", p.id);
    await supabase.from("photos").update({ display_order: p.display_order }).eq("id", other.id);
    fetchPhotos(albumId).then(setPhotos);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold">Photos</h2>
        <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} className="rounded-xl border bg-card px-4 py-2 text-sm">
          {albums.map((a) => <option key={a.id} value={a.id}>{a.album_name}</option>)}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
      >
        <Upload className="size-10 mx-auto text-muted-foreground" />
        <p className="mt-3 font-medium">Drag photos here, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, JPEG, PNG, WEBP, HEIC, HEIF · up to 100 at once · auto-optimized to WebP</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploads.length > 0 && (
        <div className="mt-4 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{uploads.length} files · {uploads.filter((u) => u.status === "done").length} done</p>
            <div className="flex gap-2">
              <button onClick={startUpload} className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium hover:opacity-90">Start Upload</button>
              <button onClick={clearDone} className="rounded-full border px-4 py-1.5 text-xs">Clear Done</button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2 max-h-72 overflow-y-auto">
            {uploads.map((u) => (
              <div key={u.id} className="relative aspect-square rounded-lg overflow-hidden border group">
                <img src={u.preview} alt="" className="w-full h-full object-cover" />
                {u.status === "uploading" && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
                    <div className="h-full bg-primary transition-all" style={{ width: `${u.progress}%` }} />
                  </div>
                )}
                {u.status === "done" && <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center"><Check className="text-white size-6" /></div>}
                {u.status === "error" && <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center text-white text-[10px] p-1 text-center">{u.error}</div>}
                {u.status === "pending" && (
                  <button onClick={() => setUploads((p) => p.filter((x) => x.id !== u.id))} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100">
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-medium mb-3">{photos.length} photos in this album</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((p, i) => (
            <div key={p.id} className="rounded-xl border bg-card overflow-hidden shadow-soft">
              <div className="aspect-square overflow-hidden">
                <img src={p.thumbnail_url ?? p.image_url} alt={p.caption ?? ""} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                {editingCaption === p.id ? (
                  <div className="flex gap-1">
                    <input value={captionDraft} onChange={(e) => setCaptionDraft(e.target.value)} className="flex-1 rounded-md border bg-background px-2 py-1 text-xs" />
                    <button onClick={() => saveCaption(p.id)} className="p-1 text-primary"><Check className="size-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingCaption(p.id); setCaptionDraft(p.caption ?? ""); }} className="text-xs text-muted-foreground truncate w-full text-left hover:text-foreground">
                    {p.caption || "Add caption…"}
                  </button>
                )}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex gap-0.5">
                    <button onClick={() => movePhoto(p, -1)} disabled={i === 0} className="text-xs px-1 disabled:opacity-30">←</button>
                    <button onClick={() => movePhoto(p, 1)} disabled={i === photos.length - 1} className="text-xs px-1 disabled:opacity-30">→</button>
                  </div>
                  <button onClick={() => removePhoto(p)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="size-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {photos.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No photos yet — drop some above!</p>}
      </div>
    </div>
  );
}
