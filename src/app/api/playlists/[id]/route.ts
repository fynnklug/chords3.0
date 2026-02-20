import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists, playlistLieder } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const playlistId = parseInt(id, 10);

    // Delete all songs in the playlist first
    await db
      .delete(playlistLieder)
      .where(eq(playlistLieder.playlistId, playlistId));

    // Delete the playlist
    await db
      .delete(playlists)
      .where(
        and(
          eq(playlists.id, playlistId),
          eq(playlists.userId, session.user.id)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
