export type SectionType = "verse" | "chorus" | "bridge" | "intro" | "outro" | "interlude" | "pre-chorus";

export interface SongSection {
  type: SectionType;
  label: string;
  lines: string[]; // ChordPro format: "[G]Today is [D]going to be..."
}

export interface SongData {
  slug: string;
  title: string;
  artist: string;
  category: string;
  sections: SongSection[];
}

/** Metadata stored in DB (no content) */
export interface SongMeta {
  id: number;
  slug: string;
  title: string;
  artist: string;
  category: string;
  createdAt: string;
}

/** Parsed chord-text pair for rendering */
export interface ChordTextPair {
  chord: string | null;
  text: string;
}

/** A fully parsed line with chord positions */
export interface ParsedLine {
  pairs: ChordTextPair[];
  raw: string;
}
