"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { Station } from "@/lib/types";

const STORAGE_KEY = "radio-history";
const MERGED_KEY = "radio-history-merged";
const MAX_HISTORY = 50;

function readLocalHistory(): Station[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(history: Station[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function useHistory() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated" && !!session?.user?.id;
  const [history, setHistory] = useState<Station[]>([]);
  const [loaded, setLoaded] = useState(false);
  const merging = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (isAuth) {
      fetchCloudHistory();
    } else {
      setHistory(readLocalHistory());
      setLoaded(true);
    }
  }, [isAuth, status]);

  // Merge localStorage history into cloud on first authenticated session
  useEffect(() => {
    if (!isAuth || !loaded || merging.current) return;
    const alreadyMerged = localStorage.getItem(MERGED_KEY);
    if (alreadyMerged) return;

    const localHistory = readLocalHistory();
    if (localHistory.length === 0) {
      localStorage.setItem(MERGED_KEY, "true");
      return;
    }

    merging.current = true;
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localHistory),
    })
      .then(() => fetchCloudHistory())
      .finally(() => {
        localStorage.setItem(MERGED_KEY, "true");
        localStorage.removeItem(STORAGE_KEY);
        merging.current = false;
      });
  }, [isAuth, loaded]);

  async function fetchCloudHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {} finally {
      setLoaded(true);
    }
  }

  const addToHistory = useCallback(
    (station: Station) => {
      setHistory((prev) => {
        const filtered = prev.filter(
          (h) => h.stationuuid !== station.stationuuid
        );
        const newHistory = [station, ...filtered].slice(0, MAX_HISTORY);

        if (isAuth) {
          fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(station),
          }).catch(() => {});
        } else {
          writeLocalHistory(newHistory);
        }

        return newHistory;
      });
    },
    [isAuth]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);

    if (isAuth) {
      fetch("/api/history", { method: "DELETE" }).catch(() => {});
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, [isAuth]);

  return { history, addToHistory, clearHistory, isCloudSynced: isAuth };
}
