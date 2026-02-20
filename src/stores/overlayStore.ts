"use client";

import { create } from "zustand";

export type OverlayCardType =
  | "app-promo"
  | "affiliate"
  | "hint"
  | "context"
  | "ticker";

export interface ActiveCard {
  id: string;
  type: OverlayCardType;
  contentId: string;
  shownAt: number;
  duration: number;
}

interface OverlayState {
  activeCards: ActiveCard[];
  tickerActive: boolean;
  tickerContentIndex: number;

  shownIds: Set<string>;
  shownHints: Set<string>;
  lastShownAt: number;
  cardHistory: { id: string; shownAt: number }[];

  paused: boolean;

  showCard: (card: ActiveCard) => void;
  dismissCard: (id: string) => void;
  setTickerActive: (active: boolean) => void;
  advanceTickerIndex: () => void;
  markHintShown: (hintId: string) => void;
  setPaused: (paused: boolean) => void;
  isOnCooldown: (contentId: string, cooldownMs: number) => boolean;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  activeCards: [],
  tickerActive: false,
  tickerContentIndex: 0,

  shownIds: new Set(),
  shownHints: new Set(),
  lastShownAt: 0,
  cardHistory: [],

  paused: false,

  showCard: (card) =>
    set((s) => ({
      activeCards: [...s.activeCards, card],
      shownIds: new Set(s.shownIds).add(card.contentId),
      lastShownAt: Date.now(),
      cardHistory: [...s.cardHistory, { id: card.contentId, shownAt: card.shownAt }],
    })),

  dismissCard: (id) =>
    set((s) => ({
      activeCards: s.activeCards.filter((c) => c.id !== id),
    })),

  setTickerActive: (active) => set({ tickerActive: active }),

  advanceTickerIndex: () =>
    set((s) => ({ tickerContentIndex: s.tickerContentIndex + 1 })),

  markHintShown: (hintId) =>
    set((s) => {
      const next = new Set(s.shownHints);
      next.add(hintId);
      return { shownHints: next };
    }),

  setPaused: (paused) => set({ paused }),

  isOnCooldown: (contentId, cooldownMs) => {
    const { cardHistory } = get();
    const last = [...cardHistory].reverse().find((h) => h.id === contentId);
    if (!last) return false;
    return Date.now() - last.shownAt < cooldownMs;
  },
}));
