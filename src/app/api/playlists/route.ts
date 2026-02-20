import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { playlists, playlistStations } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: playlists.id,
      name: playlists.name,
      description: playlists.description,
      isPublic: playlists.isPublic,
      createdAt: playlists.createdAt,
      updatedAt: playlists.updatedAt,
      stationCount: count(playlistStations.id),
    })
    .from(playlists)
    .leftJoin(playlistStations, eq(playlists.id, playlistStations.playlistId))
    .where(eq(playlists.userId, session.user.id))
    .groupBy(playlists.id)
    .orderBy(playlists.updatedAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const [playlist] = await db
    .insert(playlists)
    .values({
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .returning();

  return NextResponse.json(playlist, { status: 201 });
}
