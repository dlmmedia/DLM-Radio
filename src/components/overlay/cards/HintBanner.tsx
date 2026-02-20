"use client";

import { OverlayCard } from "../OverlayCard";
import type { HintItem } from "@/lib/overlay-content";
import {
  MonitorPlay,
  Shuffle,
  Maximize,
  VolumeX,
  Palette,
  ArrowLeftRight,
  Globe,
  Search,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "monitor-play": MonitorPlay,
  shuffle: Shuffle,
  maximize: Maximize,
  "volume-x": VolumeX,
  palette: Palette,
  "arrow-left-right": ArrowLeftRight,
  globe: Globe,
  search: Search,
};

interface HintBannerProps {
  hint: HintItem;
  onDismiss: () => void;
}

export function HintBanner({ hint, onDismiss }: HintBannerProps) {
  const Icon = iconMap[hint.icon] ?? Globe;

  return (
    <OverlayCard preset="drop-bounce">
      <div className="flex items-center gap-2.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/[0.08] px-4 py-2 shadow-lg shadow-black/30 max-w-[480px]">
        <Icon className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
        <span className="text-[12px] font-light text-white/60 whitespace-nowrap">
          {hint.text}
        </span>
        <button
          onClick={onDismiss}
          className="ml-1 flex-shrink-0 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </OverlayCard>
  );
}
