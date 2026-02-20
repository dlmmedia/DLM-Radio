import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listeningHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const MAX_HISTORY = 200;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), MAX_HISTORY);
  const offset = Number(searchParams.get("offset") || 0);

  const rows = await db
    .select()
    .from(listeningHistory)
    .where(eq(listeningHistory.userId, session.user.id))
    .orderBy(desc(listeningHistory.listenedAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(rows.map((r) => r.stationData));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const stations: Array<{ stationuuid: string }> = Array.isArray(body)
    ? body
    : [body];

  if (!stations.length || !stations[0].stationuuid) {
    return NextResponse.json({ error: "Invalid station data" }, { status: 400 });
  }

  const values = stations.map((station) => ({
    userId: session.user!.id!,
    stationUuid: station.stationuuid,
    stationData: station,
  }));

  await db.insert(listeningHistory).values(values);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .delete(listeningHistory)
    .where(eq(listeningHistory.userId, session.user.id));

  return NextResponse.json({ ok: true });
}
