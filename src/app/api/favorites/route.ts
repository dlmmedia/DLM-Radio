import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, session.user.id))
    .orderBy(favorites.createdAt);

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

  await db.insert(favorites).values(values).onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stationUuid = searchParams.get("stationuuid");

  if (!stationUuid) {
    return NextResponse.json({ error: "Missing stationuuid" }, { status: 400 });
  }

  await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, session.user.id),
        eq(favorites.stationUuid, stationUuid)
      )
    );

  return NextResponse.json({ ok: true });
}
