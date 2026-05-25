import { supabase } from "@/integrations/supabase/client";

export interface DbAlbum {
  id: string;
  slug: string;
  album_name: string;
  subtitle: string | null;
  album_cover: string | null;
  theme_name: string;
  category: string;
  emoji: string | null;
  display_order: number;
}

export interface DbPhoto {
  id: string;
  album_id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  display_order: number;
}

export interface DbVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  display_order: number;
}

export async function fetchAlbums(): Promise<DbAlbum[]> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return data as DbAlbum[];
}

export async function fetchAlbumBySlug(slug: string): Promise<DbAlbum | null> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as DbAlbum | null;
}

export async function fetchPhotos(albumId: string): Promise<DbPhoto[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("display_order");
  if (error) throw error;
  return data as DbPhoto[];
}

export async function fetchVideos(): Promise<DbVideo[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return data as DbVideo[];
}

export function getYoutubeId(url: string): string {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? url;
}
