import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlistLieder, lieder } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playlistId = parseInt(id, 10);

    const result = await db
      .select({
        id: lieder.id,
        title: lieder.title,
        artist: lieder.artist,
        content: lieder.content,
        createdAt: lieder.createdAt,
      })
      .from(playlistLieder)
      .innerJoin(lieder, eq(playlistLieder.liedId, lieder.id))
      .where(eq(playlistLieder.playlistId, playlistId))
      .orderBy(playlistLieder.addedAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch playlist songs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
