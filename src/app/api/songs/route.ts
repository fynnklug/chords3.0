import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lieder } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getAllSongs } from "@/lib/songs/loader";

export async function GET() {
  try {
    // Try to fetch from DB first
    const dbSongs = await db
      .select()
      .from(lieder)
      .orderBy(desc(lieder.createdAt));

    if (dbSongs.length > 0) {
      return NextResponse.json(dbSongs);
    }

    // Fallback: return metadata from local JSON files
    const localSongs = getAllSongs().map((s, i) => ({
      id: i + 1,
      slug: s.slug,
      title: s.title,
      artist: s.artist,
      category: s.category,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json(localSongs);
  } catch {
    // If DB is unavailable, fallback to local songs
    const localSongs = getAllSongs().map((s, i) => ({
      id: i + 1,
      slug: s.slug,
      title: s.title,
      artist: s.artist,
      category: s.category,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json(localSongs);
  }
}
