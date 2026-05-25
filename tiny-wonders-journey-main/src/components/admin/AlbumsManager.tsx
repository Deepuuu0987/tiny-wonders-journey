import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAlbums, type DbAlbum } from "@/lib/queries";
import { Plus, Trash2, Edit3, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const THEMES = ["pink","sky","teddy","rainbow","toys","cartoon","moon","balloon","nature","animal","candy","celebration","party"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AlbumsManager() {
  const [albums, setAlbums] = useState<DbAlbum[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DbAlbum>>({});
  const [creating, setCreating] = useState(false);

  const load = async () => setAlbums(await fetchAlbums());
  useEffect(() => { load(); }, []);

  const startEdit = (a: DbAlbum) => { setEditing(a.id); setForm(a); setCreating(false); };
  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ album_name: "", subtitle: "", theme_name: "pink", category: "event", emoji: "✨", display_order: (albums.at(-1)?.display_order ?? 0) + 1 });
  };

  const save = async () => {
    if (!form.album_name) return toast.error("Name required");
    const payload = {
      album_name: form.album_name,
      subtitle: form.subtitle ?? null,
      theme_name: form.theme_name || "pink",
      category: form.category || "event",
      emoji: form.emoji ?? null,
      album_cover: form.album_cover ?? null,
      display_order: form.display_order ?? 0,
      slug: form.slug || slugify(form.album_name),
    };
    if (creating) {
      const { error } = await supabase.from("albums").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Album created");
    } else if (editing) {
      const { error } = await supabase.from("albums").update(payload).eq("id", editing);
      if (error) return toast.error(error.message);
      toast.success("Album updated");
    }
    setEditing(null); setCreating(false); setForm({});
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this album and all its photos?")) return;
    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const move = async (a: DbAlbum, dir: -1 | 1) => {
    const sorted = [...albums].sort((x, y) => x.display_order - y.display_order);
    const idx = sorted.findIndex((x) => x.id === a.id);
    const other = sorted[idx + dir];
    if (!other) return;
    await supabase.from("albums").update({ display_order: other.display_order }).eq("id", a.id);
    await supabase.from("albums").update({ display_order: a.display_order }).eq("id", other.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold">Albums ({albums.length})</h2>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="size-4" /> New Album
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 rounded-2xl border bg-card p-4 shadow-soft">
          <h3 className="font-medium mb-3">{creating ? "New Album" : "Edit Album"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Album Name" value={form.album_name ?? ""} onChange={(v) => setForm({ ...form, album_name: v })} />
            <Input label="Subtitle" value={form.subtitle ?? ""} onChange={(v) => setForm({ ...form, subtitle: v })} />
            <Input label="Emoji" value={form.emoji ?? ""} onChange={(v) => setForm({ ...form, emoji: v })} />
            <Input label="Cover Image URL" value={form.album_cover ?? ""} onChange={(v) => setForm({ ...form, album_cover: v })} />
            <div>
              <label className="text-xs font-medium text-muted-foreground">Theme</label>
              <select value={form.theme_name ?? "pink"} onChange={(e) => setForm({ ...form, theme_name: e.target.value })} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm capitalize">
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category ?? "event"} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="month">Month</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm">
              <Save className="size-4" /> Save
            </button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
              <X className="size-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {albums.map((a, i) => (
          <div key={a.id} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{a.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{a.album_name}</p>
                <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                <p className="text-xs mt-1"><span className="px-2 py-0.5 rounded-full bg-accent capitalize">{a.theme_name}</span> <span className="ml-1 text-muted-foreground capitalize">{a.category}</span></p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <button onClick={() => move(a, -1)} disabled={i === 0} className="p-2 rounded-lg hover:bg-accent disabled:opacity-40" title="Move up"><ArrowUp className="size-4" /></button>
              <button onClick={() => move(a, 1)} disabled={i === albums.length - 1} className="p-2 rounded-lg hover:bg-accent disabled:opacity-40" title="Move down"><ArrowDown className="size-4" /></button>
              <div className="ml-auto flex gap-1">
                <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-accent" title="Edit"><Edit3 className="size-4" /></button>
                <button onClick={() => remove(a.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="size-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
    </div>
  );
}
