import { NextRequest, NextResponse } from "next/server";
import { getSongBySlug } from "@/lib/songs/loader";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const song = getSongBySlug(slug);

  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  return NextResponse.json(song);
}
