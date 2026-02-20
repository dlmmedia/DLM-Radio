import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id));

  if (rows.length === 0) {
    return NextResponse.json({
      autoVisualizer: true,
      idleTimeout: 120,
      defaultScene: "auto",
      visualMood: null,
    });
  }

  const { userId: _, updatedAt: __, ...prefs } = rows[0];
  return NextResponse.json(prefs);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.autoVisualizer === "boolean")
    update.autoVisualizer = body.autoVisualizer;
  if (typeof body.idleTimeout === "number")
    update.idleTimeout = body.idleTimeout;
  if (typeof body.defaultScene === "string")
    update.defaultScene = body.defaultScene;
  if (body.visualMood !== undefined)
    update.visualMood = body.visualMood;

  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id));

  if (existing.length === 0) {
    await db.insert(userPreferences).values({
      userId: session.user.id,
      ...update,
    });
  } else {
    await db
      .update(userPreferences)
      .set(update)
      .where(eq(userPreferences.userId, session.user.id));
  }

  return NextResponse.json({ ok: true });
}
