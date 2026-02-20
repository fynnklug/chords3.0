import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { history, lieder, playlists } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth-helpers";
import { eq, desc, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    // Count total songs sung
    const [sungCount] = await db
      .select({ value: count() })
      .from(history)
      .where(eq(history.userId, userId));

    // Count total playlists
    const [playlistCount] = await db
      .select({ value: count() })
      .from(playlists)
      .where(eq(playlists.userId, userId));

    // Recent songs (last 10)
    const recentSongs = await db
      .select({
        id: history.id,
        title: lieder.title,
        artist: lieder.artist,
        sungAt: history.sungAt,
      })
      .from(history)
      .innerJoin(lieder, eq(history.liedId, lieder.id))
      .where(eq(history.userId, userId))
      .orderBy(desc(history.sungAt))
      .limit(10);

    return NextResponse.json({
      totalSung: sungCount?.value ?? 0,
      totalPlaylists: playlistCount?.value ?? 0,
      recentSongs,
    });
  } catch (error) {
    console.error("Failed to fetch profile stats:", error);
    return NextResponse.json(
      { totalSung: 0, totalPlaylists: 0, recentSongs: [] },
      { status: 500 }
    );
  }
}
