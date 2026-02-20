import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lieder } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const songs = await db
      .select()
      .from(lieder)
      .orderBy(desc(lieder.createdAt));
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
