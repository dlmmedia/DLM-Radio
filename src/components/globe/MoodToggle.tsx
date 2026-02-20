"use client";

import { useTheme } from "next-themes";
import { useRadioStore } from "@/stores/radioStore";
import { MOOD_CONFIGS, MOOD_ORDER, type VisualMood } from "@/lib/visual-moods";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MoodToggle() {
  const visualMood = useRadioStore((s) => s.visualMood) as VisualMood;
  const cycleVisualMood = useRadioStore((s) => s.cycleVisualMood);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const { resolvedTheme } = useTheme();

  const config = MOOD_CONFIGS[visualMood];

  if (!isPlaying || resolvedTheme !== "dark") return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-20 left-3 z-40 bg-background/60 backdrop-blur-sm group"
      onClick={cycleVisualMood}
      title={`Visual mood: ${config.name}`}
    >
      <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
      <span className="sr-only">Visual mood: {config.name}</span>
    </Button>
  );
}
