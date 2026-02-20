import type { SongData } from "./types";

// Import all song JSON files statically
import wonderwall from "@/data/songs/wonderwall.json";
import letItBe from "@/data/songs/let-it-be.json";
import hallelujah from "@/data/songs/hallelujah.json";

const songsMap: Record<string, SongData> = {
  wonderwall: wonderwall as SongData,
  "let-it-be": letItBe as SongData,
  hallelujah: hallelujah as SongData,
};

/**
 * Get song content by slug. Returns null if not found.
 */
export function getSongBySlug(slug: string): SongData | null {
  return songsMap[slug] ?? null;
}

/**
 * Get all available songs.
 */
export function getAllSongs(): SongData[] {
  return Object.values(songsMap);
}

/**
 * Get all slugs.
 */
export function getAllSlugs(): string[] {
  return Object.keys(songsMap);
}
