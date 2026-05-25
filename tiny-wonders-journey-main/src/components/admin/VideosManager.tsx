import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchVideos, getYoutubeId, type DbVideo } from "@/lib/queries";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";

export function VideosManager() {
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<DbVideo>>({});

  const load = async () => setVideos(await fetchVideos());
  useEffect(() => { load(); }, []);

  const startCreate = () => { setCreating(true); setEditing(null); setForm({ title: "", description: "", youtube_url: "", display_order: (videos.at(-1)?.display_order ?? 0) + 1 }); };
  const startEdit = (v: DbVideo) => { setEditing(v.id); setCreating(false); setForm(v); };

  const save = async () => {
    if (!form.title || !form.youtube_url) return toast.error("Title & URL required");
    const payload = {
      title: form.title,
      description: form.description ?? null,
      youtube_url: form.youtube_url,
      display_order: form.display_order ?? 0,
    };
    if (creating) {
      const { error } = await supabase.from("videos").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Video added");
    } else if (editing) {
      const { error } = await supabase.from("videos").update(payload).eq("id", editing);
      if (error) return toast.error(error.message);
      toast.success("Video updated");
    }
    setEditing(null); setCreating(false); setForm({});
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold">Videos ({videos.length})</h2>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="size-4" /> Add Video
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 rounded-2xl border bg-card p-4 shadow-soft">
          <h3 className="font-medium mb-3">{creating ? "New Video" : "Edit Video"}</h3>
          <div className="space-y-3">
            <Input label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
            <Input label="Description" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v })} />
            <Input label="YouTube URL or ID" value={form.youtube_url ?? ""} onChange={(v) => setForm({ ...form, youtube_url: v })} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm"><Save className="size-4" /> Save</button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><X className="size-4" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((v) => (
          <div key={v.id} className="rounded-2xl border bg-card overflow-hidden shadow-soft">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(v.youtube_url)}`}
                title={v.title}
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-4">
              <p className="font-medium">{v.title}</p>
              {v.description && <p className="text-xs text-muted-foreground mt-1">{v.description}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(v)} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border hover:bg-accent"><Edit3 className="size-3" /> Edit</button>
                <button onClick={() => remove(v.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border text-destructive hover:bg-destructive/10"><Trash2 className="size-3" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {videos.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No videos yet</p>}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
    </div>
  );
}
