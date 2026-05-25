import baby1 from "@/assets/baby-1.jpg";
import baby2 from "@/assets/baby-2.jpg";
import baby3 from "@/assets/baby-3.jpg";
import babyBirthday from "@/assets/baby-birthday.jpg";
import heroBaby from "@/assets/hero-baby.jpg";

export type ThemeKey =
  | "pink" | "sky" | "teddy" | "rainbow" | "toys" | "cartoon"
  | "moon" | "balloon" | "nature" | "animal" | "candy" | "celebration" | "party";

export type AlbumCategory = "month" | "event";

export interface Album {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  cover: string;
  theme: ThemeKey;
  category: AlbumCategory;
  emoji: string;
  photos: string[];
}

// Repeat sample images to mimic 100+ photos. In production, replace with real URLs.
const pool = [heroBaby, baby1, baby2, baby3, babyBirthday];
const makePhotos = (count: number, seed: number) =>
  Array.from({ length: count }, (_, i) => pool[(i + seed) % pool.length]);

const monthCovers: Record<number, string> = {
  1: baby1, 2: baby2, 3: baby3, 4: heroBaby, 5: baby2,
  6: baby3, 7: baby2, 8: heroBaby, 9: baby1, 10: baby3,
  11: heroBaby, 12: babyBirthday,
};

const monthThemes: ThemeKey[] = [
  "pink","sky","teddy","rainbow","toys","cartoon",
  "moon","balloon","nature","animal","candy","celebration",
];

const monthTitles = [
  "Tiny Beginnings","Stars in Her Eyes","Cuddles & Comfort","Rainbow Smiles",
  "Playful Days","Cartoon Adventures","To the Moon","Up, Up & Away",
  "Little Explorer","Animal Friends","Sweet as Candy","One Year of Wonder",
];

export const monthAlbums: Album[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  return {
    slug: `month-${month}`,
    title: `Month ${month}`,
    subtitle: monthTitles[i],
    date: `Month ${month}`,
    cover: monthCovers[month],
    theme: monthThemes[i],
    category: "month",
    emoji: ["🌸","⭐","🧸","🌈","🎈","🎨","🌙","🎉","🌿","🐻","🍭","🎂"][i],
    photos: makePhotos(24, i),
  };
});

export const eventAlbums: Album[] = [
  {
    slug: "naming-ceremony",
    title: "Naming Ceremony",
    subtitle: "The day we whispered her name",
    date: "Special Day",
    cover: baby1,
    theme: "pink",
    category: "event",
    emoji: "🕊️",
    photos: makePhotos(18, 2),
  },
  {
    slug: "first-birthday",
    title: "First Birthday",
    subtitle: "One whole year of magic",
    date: "Big Day",
    cover: babyBirthday,
    theme: "party",
    category: "event",
    emoji: "🎂",
    photos: makePhotos(36, 4),
  },
  {
    slug: "family-moments",
    title: "Family Moments",
    subtitle: "Wrapped in love together",
    date: "Always",
    cover: baby3,
    theme: "teddy",
    category: "event",
    emoji: "👨‍👩‍👧",
    photos: makePhotos(22, 1),
  },
  {
    slug: "special-memories",
    title: "Special Memories",
    subtitle: "Little moments, big magic",
    date: "Forever",
    cover: heroBaby,
    theme: "rainbow",
    category: "event",
    emoji: "✨",
    photos: makePhotos(28, 3),
  },
];

export const allAlbums: Album[] = [...monthAlbums, ...eventAlbums];

export const findAlbum = (slug: string) =>
  allAlbums.find((a) => a.slug === slug);

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}

export const videos: VideoItem[] = [
  { id: "v1", title: "First Steps", description: "Wobble, wobble, walk!", youtubeId: "dQw4w9WgXcQ" },
  { id: "v2", title: "First Words", description: "Mama. Dada. Magic.", youtubeId: "L_jWHffIx5E" },
  { id: "v3", title: "Birthday Smash Cake", description: "Frosting everywhere.", youtubeId: "9bZkp7q19f0" },
  { id: "v4", title: "Bedtime Lullaby", description: "Sweet dreams, little one.", youtubeId: "hT_nvWreIhg" },
];
