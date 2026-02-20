"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface UserPreferences {
  autoVisualizer: boolean;
  idleTimeout: number;
  defaultScene: string;
  visualMood: string | null;
}

const DEFAULT_PREFS: UserPreferences = {
  autoVisualizer: true,
  idleTimeout: 120,
  defaultScene: "auto",
  visualMood: null,
};

export function usePreferences() {
  const { status } = useSession();
  const isAuth = status === "authenticated";
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuth) {
      setLoaded(true);
      return;
    }

    fetch("/api/preferences")
      .then((res) => (res.ok ? res.json() : DEFAULT_PREFS))
      .then((data) => setPreferences({ ...DEFAULT_PREFS, ...data }))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isAuth]);

  const updatePreferences = useCallback(
    async (update: Partial<UserPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...update }));

      if (isAuth) {
        await fetch("/api/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }).catch(() => {});
      }
    },
    [isAuth]
  );

  return { preferences, updatePreferences, loaded, isCloudSynced: isAuth };
}
