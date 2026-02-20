"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/stores/radioStore";

const IDLE_TIMEOUT_MS = 15_000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "touchstart", "keydown", "scroll"] as const;

export function useSidebarAutoCollapse() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapsedByIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const { panelOpen } = useRadioStore.getState();

    if (collapsedByIdleRef.current && !panelOpen) {
      collapsedByIdleRef.current = false;
      useRadioStore.getState().togglePanel();
    }

    timerRef.current = setTimeout(() => {
      const state = useRadioStore.getState();
      if (state.panelOpen) {
        collapsedByIdleRef.current = true;
        state.togglePanel();
      }
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    const unsub = useRadioStore.subscribe((state, prev) => {
      if (prev.panelOpen && !state.panelOpen && !collapsedByIdleRef.current) {
        // User manually closed — don't re-open on activity
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      if (!prev.panelOpen && state.panelOpen) {
        collapsedByIdleRef.current = false;
        resetTimer();
      }
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      unsub();
    };
  }, [resetTimer]);
}
