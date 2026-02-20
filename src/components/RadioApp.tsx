"use client";

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useRadioStore } from "@/stores/radioStore";
import { useHistory } from "@/hooks/useHistory";
import { useIdleDetector } from "@/hooks/useIdleDetector";
import { recordListening } from "@/lib/recommendations";
import { searchStations } from "@/lib/radio-browser";
import { PlayerBar } from "./player/PlayerBar";
import { StationDrawer } from "./station/StationDrawer";

const SidePanel = dynamic(
  () => import("./panel/SidePanel").then((m) => ({ default: m.SidePanel })),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const RadioGlobe = dynamic(
  () => import("./globe/RadioGlobe").then((m) => ({ default: m.RadioGlobe })),
  { ssr: false }
);

const SpaceBackground = dynamic(
  () =>
    import("./globe/SpaceBackground").then((m) => ({
      default: m.SpaceBackground,
    })),
  { ssr: false }
);

const SkyBackground = dynamic(
  () =>
    import("./globe/SkyBackground").then((m) => ({
      default: m.SkyBackground,
    })),
  { ssr: false }
);

const MoodToggle = dynamic(
  () =>
    import("./globe/MoodToggle").then((m) => ({
      default: m.MoodToggle,
    })),
  { ssr: false }
);

const VisualizerOverlay = dynamic(
  () =>
    import("./visualizer/VisualizerOverlay").then((m) => ({
      default: m.VisualizerOverlay,
    })),
  { ssr: false }
);

const OverlayOrchestrator = dynamic(
  () =>
    import("./overlay/OverlayOrchestrator").then((m) => ({
      default: m.OverlayOrchestrator,
    })),
  { ssr: false }
);

const SignInPrompt = dynamic(
  () =>
    import("./auth/SignInPrompt").then((m) => ({
      default: m.SignInPrompt,
    })),
  { ssr: false }
);

export function RadioApp() {
  useAudioEngine();
  useIdleDetector();
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
    cycleVisualMood,
    visualizerActive,
    setVisualizerActive,
  } = useRadioStore();

  // Auto-rotate visual mood every 4 minutes while playing
  const isPlaying = useRadioStore((s) => s.isPlaying);
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      useRadioStore.getState().cycleVisualMood();
    }, 4 * 60 * 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

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
        case "Escape": {
          const escState = useRadioStore.getState();
          if (escState.visualizerActive) {
            escState.setVisualizerActive(false);
          } else if (escState.drawerStation) {
            setDrawerStation(null);
          } else if (panelOpen) {
            togglePanel();
          }
          break;
        }
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
        case "v":
        case "V": {
          const state = useRadioStore.getState();
          state.setVisualizerActive(!state.visualizerActive);
          break;
        }
        case "b":
        case "B":
          cycleVisualMood();
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
      setVisualizerActive,
      cycleVisualMood,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative isolate h-screen w-screen overflow-hidden bg-[#F0F7FA] dark:bg-black">
      {/* Music-reactive background (behind the globe) */}
      {isDark ? <SpaceBackground /> : <SkyBackground />}

      {/* Globe with transparent background — bottom-16 accounts for PlayerBar */}
      <div className="absolute inset-0 bottom-16 z-[1]">
        <RadioGlobe />
      </div>

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

      {/* Visual mood toggle */}
      <MoodToggle />

      {/* Visualizer toggle */}
      {isPlaying && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed bottom-20 right-3 z-40 h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm"
              onClick={() =>
                useRadioStore.getState().setVisualizerActive(
                  !useRadioStore.getState().visualizerActive
                )
              }
            >
              <MonitorPlay className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Visualizer (V)</TooltipContent>
        </Tooltip>
      )}

      {/* Marketing overlay system (z-33, between globe and UI controls) */}
      <OverlayOrchestrator />

      {/* Side Panel */}
      <SidePanel />

      {/* Station Drawer */}
      <StationDrawer />

      {/* Player Bar */}
      <PlayerBar />

      {/* Fullscreen Visualizer */}
      <VisualizerOverlay />

      {/* First-visit sign-in prompt */}
      <SignInPrompt />
    </div>
  );
}
