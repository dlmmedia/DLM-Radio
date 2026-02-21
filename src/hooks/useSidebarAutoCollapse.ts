"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/stores/radioStore";

const IDLE_TIMEOUT_MS = 15_000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "touchstart", "keydown", "scroll"] as const;

export function useSidebarAutoCollapse() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapsedByIdleRef = useRef(false);
  const hoveringPanelRef = useRef(false);
  const focusedInPanelRef = useRef(false);

  const scheduleCollapse = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (hoveringPanelRef.current || focusedInPanelRef.current) {
        scheduleCollapse();
        return;
      }

      const state = useRadioStore.getState();
      if (state.panelOpen) {
        collapsedByIdleRef.current = true;
        state.togglePanel();
      }
    }, IDLE_TIMEOUT_MS);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const { panelOpen } = useRadioStore.getState();

    if (collapsedByIdleRef.current && !panelOpen) {
      collapsedByIdleRef.current = false;
      useRadioStore.getState().togglePanel();
    }

    scheduleCollapse();
  }, [scheduleCollapse]);

  useEffect(() => {
    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    const attachPanelListeners = () => {
      const panel = document.querySelector("[data-sidebar-panel]");
      if (!panel) return;

      const onEnter = () => { hoveringPanelRef.current = true; };
      const onLeave = () => { hoveringPanelRef.current = false; };
      const onFocusIn = () => { focusedInPanelRef.current = true; };
      const onFocusOut = (e: Event) => {
        const fe = e as FocusEvent;
        if (!fe.relatedTarget || !panel.contains(fe.relatedTarget as Node)) {
          focusedInPanelRef.current = false;
        }
      };

      panel.addEventListener("mouseenter", onEnter);
      panel.addEventListener("mouseleave", onLeave);
      panel.addEventListener("focusin", onFocusIn);
      panel.addEventListener("focusout", onFocusOut);

      return () => {
        panel.removeEventListener("mouseenter", onEnter);
        panel.removeEventListener("mouseleave", onLeave);
        panel.removeEventListener("focusin", onFocusIn);
        panel.removeEventListener("focusout", onFocusOut);
      };
    };

    let cleanupPanel = attachPanelListeners();

    const unsub = useRadioStore.subscribe((state, prev) => {
      if (prev.panelOpen && !state.panelOpen && !collapsedByIdleRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      if (!prev.panelOpen && state.panelOpen) {
        collapsedByIdleRef.current = false;
        hoveringPanelRef.current = false;
        focusedInPanelRef.current = false;
        resetTimer();
        requestAnimationFrame(() => {
          cleanupPanel?.();
          cleanupPanel = attachPanelListeners();
        });
      }
      if (prev.panelOpen && !state.panelOpen) {
        hoveringPanelRef.current = false;
        focusedInPanelRef.current = false;
        cleanupPanel?.();
        cleanupPanel = undefined;
      }
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      cleanupPanel?.();
      unsub();
    };
  }, [resetTimer, scheduleCollapse]);
}
