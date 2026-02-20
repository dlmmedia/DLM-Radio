"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Station } from "@/lib/types";

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  stationCount: number;
}

export interface PlaylistDetail extends Omit<Playlist, "stationCount"> {
  stations: Station[];
}

export function usePlaylists() {
  const { status } = useSession();
  const isAuth = status === "authenticated";
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!isAuth) return;
    setLoading(true);
    try {
      const res = await fetch("/api/playlists");
      if (res.ok) setPlaylists(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) fetchPlaylists();
  }, [isAuth, fetchPlaylists]);

  const createPlaylist = useCallback(
    async (name: string, description?: string) => {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to create playlist");
      const playlist = await res.json();
      setPlaylists((prev) => [...prev, { ...playlist, stationCount: 0 }]);
      return playlist;
    },
    []
  );

  const deletePlaylist = useCallback(async (id: string) => {
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePlaylist = useCallback(
    async (id: string, data: { name?: string; description?: string }) => {
      await fetch(`/api/playlists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setPlaylists((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
      );
    },
    []
  );

  const getPlaylistDetail = useCallback(
    async (id: string): Promise<PlaylistDetail | null> => {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    []
  );

  const addStationToPlaylist = useCallback(
    async (playlistId: string, station: Station) => {
      const res = await fetch(`/api/playlists/${playlistId}/stations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(station),
      });
      if (!res.ok) throw new Error("Failed to add station");
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, stationCount: p.stationCount + 1 } : p
        )
      );
    },
    []
  );

  const removeStationFromPlaylist = useCallback(
    async (playlistId: string, stationuuid: string) => {
      await fetch(
        `/api/playlists/${playlistId}/stations?stationuuid=${encodeURIComponent(stationuuid)}`,
        { method: "DELETE" }
      );
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId
            ? { ...p, stationCount: Math.max(0, p.stationCount - 1) }
            : p
        )
      );
    },
    []
  );

  return {
    playlists,
    loading,
    isAuth,
    fetchPlaylists,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    getPlaylistDetail,
    addStationToPlaylist,
    removeStationFromPlaylist,
  };
}
