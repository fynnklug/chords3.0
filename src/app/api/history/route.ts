import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { history } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { liedId } = await req.json();
    if (!liedId) {
      return NextResponse.json(
        { error: "liedId required" },
        { status: 400 }
      );
    }
    await db.insert(history).values({
      userId: session.user.id,
      liedId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to record history:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
