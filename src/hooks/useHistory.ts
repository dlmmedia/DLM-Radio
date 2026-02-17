"use client";

import { useState, useCallback, useEffect } from "react";
import type { Station } from "@/lib/types";

const STORAGE_KEY = "radio-history";
const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState<Station[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addToHistory = useCallback(
    (station: Station) => {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.stationuuid !== station.stationuuid);
        const newHistory = [station, ...filtered].slice(0, MAX_HISTORY);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch {}
        return newHistory;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { history, addToHistory, clearHistory };
}
