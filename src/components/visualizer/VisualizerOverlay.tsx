"use client";

import { useRadioStore } from "@/stores/radioStore";
import { SceneRenderer } from "./SceneRenderer";
import { StationInfoCard } from "./StationInfoCard";
import { SceneSelector } from "./SceneSelector";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function VisualizerOverlay() {
  const visualizerActive = useRadioStore((s) => s.visualizerActive);
  const setVisualizerActive = useRadioStore((s) => s.setVisualizerActive);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Mount/unmount with fade transition
  useEffect(() => {
    if (visualizerActive) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      setControlsVisible(true);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(timer);
    }
  }, [visualizerActive]);

  // Auto-hide controls after 4s of no mouse movement inside the overlay
  useEffect(() => {
    if (!mounted) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    const showControls = () => {
      setControlsVisible(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setControlsVisible(false), 4000);
    };

    showControls();

    window.addEventListener("mousemove", showControls);
    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener("mousemove", showControls);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Scene renderer (canvas or three.js) */}
      <SceneRenderer />

      {/* Station info card */}
      <div
        className={`transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <StationInfoCard />
      </div>

      {/* Scene selector */}
      <div
        className={`transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <SceneSelector />
      </div>

      {/* Close button */}
      <div
        className={`transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/60"
          onClick={() => setVisualizerActive(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
