"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const SHOW_DURATION = 30_000;
const HIDE_DURATION = 150_000;

/**
 * Cycles sign-in UI visibility: visible for 30s, hidden for 2.5min, repeat.
 * Returns true when sign-in prompts should be shown.
 * Always returns false when the user is authenticated.
 */
export function useSignInPulse() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (status === "loading" || session?.user) return;

    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    function startCycle() {
      setVisible(true);
      showTimer = setTimeout(() => {
        setVisible(false);
        hideTimer = setTimeout(startCycle, HIDE_DURATION);
      }, SHOW_DURATION);
    }

    startCycle();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [status, session]);

  if (status === "loading" || session?.user) return false;

  return visible;
}
