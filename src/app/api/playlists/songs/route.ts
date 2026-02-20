import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlistLieder } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { playlistId, liedId } = await req.json();
    if (!playlistId || !liedId) {
      return NextResponse.json(
        { error: "playlistId and liedId required" },
        { status: 400 }
      );
    }
    await db
      .insert(playlistLieder)
      .values({ playlistId, liedId })
      .onConflictDoNothing();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to add song to playlist:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { playlistId, liedId } = await req.json();
    if (!playlistId || !liedId) {
      return NextResponse.json(
        { error: "playlistId and liedId required" },
        { status: 400 }
      );
    }
    await db
      .delete(playlistLieder)
      .where(
        and(
          eq(playlistLieder.playlistId, playlistId),
          eq(playlistLieder.liedId, liedId)
        )
      );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to remove song from playlist:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
