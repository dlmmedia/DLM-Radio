"use client";

import Image from "next/image";
import { OverlayCard } from "../OverlayCard";
import type { AppPromo } from "@/lib/overlay-content";

interface AppPromoCardProps {
  promo: AppPromo;
  onDismiss: () => void;
}

export function AppPromoCard({ promo, onDismiss }: AppPromoCardProps) {
  return (
    <OverlayCard preset="slide-right" className="group">
      <a
        href={promo.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-3 rounded-xl bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-black/[0.1] dark:border-white/[0.08] px-3 py-2.5 shadow-2xl shadow-black/10 dark:shadow-black/40 transition-all duration-300 hover:bg-white/80 dark:hover:bg-black/60 hover:border-black/[0.15] dark:hover:border-white/[0.12] hover:translate-y-[-1px] w-[300px]"
        style={{
          borderLeftWidth: 2,
          borderLeftColor: promo.accent,
          boxShadow: `0 0 20px ${promo.accent}10, 0 8px 32px rgba(0,0,0,0.1)`,
        }}
      >
        {/* App thumbnail */}
        <div
          className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg"
          style={{
            boxShadow: `inset 0 0 0 1px ${promo.accent}33`,
          }}
        >
          <Image
            src={promo.image}
            alt={promo.name}
            fill
            className="object-cover object-top"
            sizes="48px"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-black/90 dark:text-white/90 truncate">
              {promo.name}
            </span>
          </div>
          <p className="text-[11px] font-normal text-black/65 dark:text-white/50 leading-snug line-clamp-2 mt-0.5">
            {promo.tagline}
          </p>
        </div>

        {/* CTA pill */}
        <span
          className="flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-medium tracking-wide transition-all duration-200 group-hover:brightness-110"
          style={{
            backgroundColor: `${promo.accent}20`,
            color: promo.accent,
            border: `1px solid ${promo.accent}30`,
          }}
        >
          {promo.cta}
        </span>
      </a>

      {/* Dismiss on click outside link */}
      <button
        onClick={onDismiss}
        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-black/15 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="Dismiss"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-black/70 dark:text-white/60">
          <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </OverlayCard>
  );
}
