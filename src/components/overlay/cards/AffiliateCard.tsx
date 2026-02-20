"use client";

import { OverlayCard } from "../OverlayCard";
import type { AffiliateItem } from "@/lib/overlay-content";
import { Headphones, Music, Cpu, Sparkles } from "lucide-react";

const categoryIcons = {
  "music-gear": Headphones,
  streaming: Music,
  tech: Cpu,
  lifestyle: Sparkles,
} as const;

const categoryLabels = {
  "music-gear": "Recommended Gear",
  streaming: "Streaming",
  tech: "Tech Pick",
  lifestyle: "Curated",
} as const;

interface AffiliateCardProps {
  item: AffiliateItem;
  onDismiss: () => void;
}

export function AffiliateCard({ item, onDismiss }: AffiliateCardProps) {
  const Icon = categoryIcons[item.category];

  return (
    <OverlayCard preset="fade-blur" className="group">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-3 rounded-xl bg-black/45 backdrop-blur-2xl border border-white/[0.06] px-3.5 py-3 shadow-2xl shadow-black/40 transition-all duration-300 hover:bg-black/55 hover:border-white/[0.1] w-[280px]"
        style={{
          boxShadow: `0 0 24px ${item.accent}08, 0 8px 32px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Icon */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `${item.accent}12`,
            border: `1px solid ${item.accent}20`,
          }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color: item.accent }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: `${item.accent}99` }}>
              {categoryLabels[item.category]}
            </span>
          </div>
          <p className="text-[12px] font-normal text-white/80 mt-0.5 truncate">
            {item.brand}
          </p>
          <p className="text-[11px] font-light text-white/45 leading-snug mt-0.5">
            {item.tagline}
          </p>
        </div>

        {/* CTA */}
        <span
          className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-200 group-hover:brightness-125"
          style={{
            backgroundColor: `${item.accent}15`,
            color: `${item.accent}CC`,
            border: `1px solid ${item.accent}25`,
          }}
        >
          {item.cta}
        </span>
      </a>

      <button
        onClick={onDismiss}
        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="Dismiss"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-white/60">
          <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </OverlayCard>
  );
}
