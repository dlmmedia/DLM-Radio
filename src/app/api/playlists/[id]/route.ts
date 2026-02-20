import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { playlists, playlistStations } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [playlist] = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, id), eq(playlists.userId, session.user.id)));

  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stations = await db
    .select()
    .from(playlistStations)
    .where(eq(playlistStations.playlistId, id))
    .orderBy(asc(playlistStations.position));

  return NextResponse.json({
    ...playlist,
    stations: stations.map((s) => s.stationData),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") update.name = body.name.trim();
  if (body.description !== undefined)
    update.description = body.description?.trim() || null;
  if (typeof body.isPublic === "boolean") update.isPublic = body.isPublic;

  await db
    .update(playlists)
    .set(update)
    .where(and(eq(playlists.id, id), eq(playlists.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db
    .delete(playlists)
    .where(and(eq(playlists.id, id), eq(playlists.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
