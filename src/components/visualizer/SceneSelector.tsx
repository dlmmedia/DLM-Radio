"use client";

import { useRadioStore } from "@/stores/radioStore";
import { SCENE_META, SCENE_ORDER, getSceneForTags } from "@/lib/scene-presets";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  BarChart3,
  CircleDot,
  AudioLines,
  Sparkles,
  Waves,
  Globe,
  Wand2,
} from "lucide-react";
import type { SceneId } from "./scenes/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  CircleDot,
  AudioLines,
  Sparkles,
  Waves,
  Globe,
};

export function SceneSelector() {
  const visualizerScene = useRadioStore((s) => s.visualizerScene);
  const setVisualizerScene = useRadioStore((s) => s.setVisualizerScene);
  const currentStation = useRadioStore((s) => s.currentStation);
  const autoSceneId = getSceneForTags(currentStation?.tags ?? "");

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-black/[0.12] dark:border-white/10 rounded-full px-2 py-1.5">
        {/* Auto button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full transition-colors ${
                visualizerScene === "auto"
                  ? "bg-black/20 dark:bg-white/20 text-black dark:text-white"
                  : "text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
              }`}
              onClick={() => setVisualizerScene("auto")}
            >
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Auto ({SCENE_META[autoSceneId].name})
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-black/15 dark:bg-white/10 mx-0.5" />

        {SCENE_ORDER.map((id) => {
          const meta = SCENE_META[id];
          const Icon = ICON_MAP[meta.icon];
          const isActive =
            visualizerScene === id ||
            (visualizerScene === "auto" && id === autoSceneId);

          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full transition-colors ${
                    isActive
                      ? "bg-black/15 dark:bg-white/15 text-black dark:text-white"
                      : "text-black/55 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                  }`}
                  onClick={() => setVisualizerScene(id)}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {meta.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
