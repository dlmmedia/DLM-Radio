"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/stores/radioStore";

const IDLE_EVENTS = ["mousemove", "mousedown", "touchstart", "scroll"] as const;

export function useIdleDetector() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByIdleRef = useRef(false);

  const isPlaying = useRadioStore((s) => s.isPlaying);
  const autoVisualizer = useRadioStore((s) => s.autoVisualizer);
  const idleTimeout = useRadioStore((s) => s.idleTimeout);

  const startIdleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const state = useRadioStore.getState();
      if (state.isPlaying && state.autoVisualizer && !state.visualizerActive) {
        openedByIdleRef.current = true;
        state.setVisualizerActive(true);
      }
    }, idleTimeout * 1000);
  }, [idleTimeout]);

  useEffect(() => {
    if (!autoVisualizer || !isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const onActivity = () => {
      // Only auto-dismiss if the idle detector was the one that opened it
      if (openedByIdleRef.current && useRadioStore.getState().visualizerActive) {
        openedByIdleRef.current = false;
        useRadioStore.getState().setVisualizerActive(false);
      }

      startIdleTimer();
    };

    startIdleTimer();

    for (const event of IDLE_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of IDLE_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, [isPlaying, autoVisualizer, startIdleTimer]);

  // Reset the idle-opened flag when visualizer is manually closed
  useEffect(() => {
    const unsub = useRadioStore.subscribe((state, prev) => {
      if (prev.visualizerActive && !state.visualizerActive) {
        openedByIdleRef.current = false;
        // Restart idle timer so it can re-trigger later
        if (state.isPlaying && state.autoVisualizer) {
          startIdleTimer();
        }
      }
    });
    return unsub;
  }, [startIdleTimer]);
}
