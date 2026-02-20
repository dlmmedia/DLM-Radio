import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { playlists, playlistStations } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

async function verifyPlaylistOwner(playlistId: string, userId: string) {
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
  return !!playlist;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyPlaylistOwner(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const station = await req.json();
  if (!station?.stationuuid) {
    return NextResponse.json({ error: "Invalid station data" }, { status: 400 });
  }

  const [{ stationCount }] = await db
    .select({ stationCount: count() })
    .from(playlistStations)
    .where(eq(playlistStations.playlistId, id));

  await db.insert(playlistStations).values({
    playlistId: id,
    stationUuid: station.stationuuid,
    stationData: station,
    position: stationCount,
  });

  await db
    .update(playlists)
    .set({ updatedAt: new Date() })
    .where(eq(playlists.id, id));

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await verifyPlaylistOwner(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const stationUuid = searchParams.get("stationuuid");

  if (!stationUuid) {
    return NextResponse.json({ error: "Missing stationuuid" }, { status: 400 });
  }

  await db
    .delete(playlistStations)
    .where(
      and(
        eq(playlistStations.playlistId, id),
        eq(playlistStations.stationUuid, stationUuid)
      )
    );

  return NextResponse.json({ ok: true });
}
