"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { Station } from "@/lib/types";

const STORAGE_KEY = "radio-favorites";
const MERGED_KEY = "radio-favorites-merged";

function readLocalFavorites(): Station[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(favs: Station[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {}
}

export function useFavorites() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated" && !!session?.user?.id;
  const [favorites, setFavorites] = useState<Station[]>([]);
  const [loaded, setLoaded] = useState(false);
  const merging = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (isAuth) {
      fetchCloudFavorites();
    } else {
      setFavorites(readLocalFavorites());
      setLoaded(true);
    }
  }, [isAuth, status]);

  // Merge localStorage favorites into cloud on first authenticated session
  useEffect(() => {
    if (!isAuth || !loaded || merging.current) return;
    const alreadyMerged = localStorage.getItem(MERGED_KEY);
    if (alreadyMerged) return;

    const localFavs = readLocalFavorites();
    if (localFavs.length === 0) {
      localStorage.setItem(MERGED_KEY, "true");
      return;
    }

    merging.current = true;
    const existingUuids = new Set(favorites.map((f) => f.stationuuid));
    const toMerge = localFavs.filter((f) => !existingUuids.has(f.stationuuid));

    if (toMerge.length > 0) {
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toMerge),
      })
        .then(() => fetchCloudFavorites())
        .finally(() => {
          localStorage.setItem(MERGED_KEY, "true");
          localStorage.removeItem(STORAGE_KEY);
          merging.current = false;
        });
    } else {
      localStorage.setItem(MERGED_KEY, "true");
      localStorage.removeItem(STORAGE_KEY);
      merging.current = false;
    }
  }, [isAuth, loaded]);

  async function fetchCloudFavorites() {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {} finally {
      setLoaded(true);
    }
  }

  const addFavorite = useCallback(
    (station: Station) => {
      if (favorites.some((f) => f.stationuuid === station.stationuuid)) return;
      const updated = [station, ...favorites];
      setFavorites(updated);

      if (isAuth) {
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(station),
        }).catch(() => {});
      } else {
        writeLocalFavorites(updated);
      }
    },
    [favorites, isAuth]
  );

  const removeFavorite = useCallback(
    (stationuuid: string) => {
      const updated = favorites.filter((f) => f.stationuuid !== stationuuid);
      setFavorites(updated);

      if (isAuth) {
        fetch(`/api/favorites?stationuuid=${encodeURIComponent(stationuuid)}`, {
          method: "DELETE",
        }).catch(() => {});
      } else {
        writeLocalFavorites(updated);
      }
    },
    [favorites, isAuth]
  );

  const isFavorite = useCallback(
    (stationuuid: string) =>
      favorites.some((f) => f.stationuuid === stationuuid),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (station: Station) => {
      if (isFavorite(station.stationuuid)) {
        removeFavorite(station.stationuuid);
      } else {
        addFavorite(station);
      }
    },
    [isFavorite, removeFavorite, addFavorite]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, isCloudSynced: isAuth };
}
