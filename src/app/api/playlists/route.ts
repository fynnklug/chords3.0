import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth-helpers";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await requireSession();
    const result = await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, session.user.id))
      .orderBy(desc(playlists.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch playlists:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const [result] = await db
      .insert(playlists)
      .values({ name, userId: session.user.id })
      .returning();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create playlist:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
