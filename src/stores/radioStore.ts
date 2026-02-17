"use client";

import { create } from "zustand";
import type { Station, PanelTab } from "@/lib/types";

interface RadioState {
  // Playback
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;

  // Station list context
  stationList: Station[];
  stationListIndex: number;

  // UI
  panelTab: PanelTab;
  panelOpen: boolean;
  drawerStation: Station | null;
  searchQuery: string;

  // Explore context
  exploreCity: string | null;
  exploreCountry: string | null;
  exploreCountryCode: string | null;

  // Actions
  setStation: (station: Station) => void;
  setPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setStationList: (list: Station[], index?: number) => void;
  nextStation: () => void;
  prevStation: () => void;
  setPanelTab: (tab: PanelTab) => void;
  togglePanel: () => void;
  setDrawerStation: (station: Station | null) => void;
  setSearchQuery: (query: string) => void;
  setExploreLocation: (city: string | null, country: string | null, countryCode: string | null) => void;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  currentStation: null,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  isMuted: false,
  stationList: [],
  stationListIndex: -1,
  panelTab: "explore",
  panelOpen: true,
  drawerStation: null,
  searchQuery: "",
  exploreCity: null,
  exploreCountry: null,
  exploreCountryCode: null,

  setStation: (station) =>
    set({
      currentStation: station,
      isPlaying: true,
      isLoading: true,
      drawerStation: null,
    }),

  setPlaying: (playing) => set({ isPlaying: playing }),
  setLoading: (loading) => set({ isLoading: loading }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  setStationList: (list, index = 0) =>
    set({ stationList: list, stationListIndex: index }),

  nextStation: () => {
    const { stationList, stationListIndex } = get();
    if (stationList.length === 0) return;
    const next = (stationListIndex + 1) % stationList.length;
    set({
      currentStation: stationList[next],
      stationListIndex: next,
      isPlaying: true,
      isLoading: true,
    });
  },

  prevStation: () => {
    const { stationList, stationListIndex } = get();
    if (stationList.length === 0) return;
    const prev = stationListIndex <= 0 ? stationList.length - 1 : stationListIndex - 1;
    set({
      currentStation: stationList[prev],
      stationListIndex: prev,
      isPlaying: true,
      isLoading: true,
    });
  },

  setPanelTab: (tab) => set({ panelTab: tab, panelOpen: true }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  setDrawerStation: (station) => set({ drawerStation: station }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setExploreLocation: (city, country, countryCode) =>
    set({
      exploreCity: city,
      exploreCountry: country,
      exploreCountryCode: countryCode,
      panelTab: "explore",
      panelOpen: true,
    }),
}));
