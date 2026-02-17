"use client";

import { useState, useCallback, useEffect } from "react";
import type { Station } from "@/lib/types";

const STORAGE_KEY = "radio-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Station[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const saveFavorites = useCallback((newFavs: Station[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
    } catch {}
  }, []);

  const addFavorite = useCallback(
    (station: Station) => {
      if (favorites.some((f) => f.stationuuid === station.stationuuid)) return;
      saveFavorites([station, ...favorites]);
    },
    [favorites, saveFavorites]
  );

  const removeFavorite = useCallback(
    (stationuuid: string) => {
      saveFavorites(favorites.filter((f) => f.stationuuid !== stationuuid));
    },
    [favorites, saveFavorites]
  );

  const isFavorite = useCallback(
    (stationuuid: string) => favorites.some((f) => f.stationuuid === stationuuid),
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

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}
