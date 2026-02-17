"use client";

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useRadioStore } from "@/stores/radioStore";
import { useHistory } from "@/hooks/useHistory";
import { recordListening } from "@/lib/recommendations";
import { searchStations } from "@/lib/radio-browser";
import { PlayerBar } from "./player/PlayerBar";
import { StationDrawer } from "./station/StationDrawer";

const SidePanel = dynamic(
  () => import("./panel/SidePanel").then((m) => ({ default: m.SidePanel })),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const RadioGlobe = dynamic(
  () => import("./globe/RadioGlobe").then((m) => ({ default: m.RadioGlobe })),
  { ssr: false }
);

const AudioVisualOverlay = dynamic(
  () =>
    import("./globe/AudioVisualOverlay").then((m) => ({
      default: m.AudioVisualOverlay,
    })),
  { ssr: false }
);

export function RadioApp() {
  useAudioEngine();
  const { addToHistory } = useHistory();
  const {
    currentStation,
    panelOpen,
    togglePanel,
    setPlaying,
    nextStation,
    prevStation,
    setVolume,
    toggleMute,
    volume,
    setPanelTab,
    setDrawerStation,
    setStation,
    setStationList,
  } = useRadioStore();

  // Record listening to history & recommendations
  useEffect(() => {
    if (currentStation) {
      addToHistory(currentStation);
      recordListening(currentStation);
    }
  }, [currentStation, addToHistory]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setPlaying(!useRadioStore.getState().isPlaying);
          break;
        case "ArrowRight":
          e.preventDefault();
          nextStation();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevStation();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(volume + 0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(volume - 0.05);
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case "r":
        case "R":
          try {
            const stations = await searchStations({
              order: "random",
              limit: 1,
              hidebroken: true,
              has_geo_info: true,
            });
            if (stations.length > 0) {
              setStation(stations[0]);
              setStationList(stations, 0);
            }
          } catch {}
          break;
        case "Escape":
          if (useRadioStore.getState().drawerStation) {
            setDrawerStation(null);
          } else if (panelOpen) {
            togglePanel();
          }
          break;
        case "1":
          setPanelTab("explore");
          break;
        case "2":
          setPanelTab("favorites");
          break;
        case "3":
          setPanelTab("browse");
          break;
        case "4":
          setPanelTab("search");
          break;
      }
    },
    [
      setPlaying,
      nextStation,
      prevStation,
      setVolume,
      volume,
      toggleMute,
      panelOpen,
      togglePanel,
      setPanelTab,
      setDrawerStation,
      setStation,
      setStationList,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Globe */}
      <div className="absolute inset-0">
        <RadioGlobe />
      </div>

      {/* Audio-reactive visual overlay (glow + particles) */}
      <AudioVisualOverlay />

      {/* Panel toggle */}
      {!panelOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-40 bg-background/60 backdrop-blur-sm"
          onClick={togglePanel}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Side Panel */}
      <SidePanel />

      {/* Station Drawer */}
      <StationDrawer />

      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
}
