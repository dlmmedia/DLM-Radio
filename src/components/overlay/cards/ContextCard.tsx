"use client";

import { OverlayCard } from "../OverlayCard";
import type { ContextFact } from "@/lib/overlay-content";
import { Globe, Music } from "lucide-react";

interface ContextCardProps {
  fact: ContextFact;
  onDismiss: () => void;
}

const countryFlags: Record<string, string> = {
  US: "\u{1F1FA}\u{1F1F8}",
  GB: "\u{1F1EC}\u{1F1E7}",
  JP: "\u{1F1EF}\u{1F1F5}",
  BR: "\u{1F1E7}\u{1F1F7}",
  DE: "\u{1F1E9}\u{1F1EA}",
  FR: "\u{1F1EB}\u{1F1F7}",
  IN: "\u{1F1EE}\u{1F1F3}",
  AU: "\u{1F1E6}\u{1F1FA}",
  NG: "\u{1F1F3}\u{1F1EC}",
  MX: "\u{1F1F2}\u{1F1FD}",
  KR: "\u{1F1F0}\u{1F1F7}",
  ZA: "\u{1F1FF}\u{1F1E6}",
  EG: "\u{1F1EA}\u{1F1EC}",
  IT: "\u{1F1EE}\u{1F1F9}",
  SE: "\u{1F1F8}\u{1F1EA}",
};

export function ContextCard({ fact, onDismiss }: ContextCardProps) {
  const isCountry = !!fact.countryCode;
  const flag = fact.countryCode ? countryFlags[fact.countryCode] : null;

  return (
    <OverlayCard preset="drift-up" className="group">
      <div className="w-[220px] rounded-xl bg-black/35 backdrop-blur-2xl border border-white/[0.06] p-4 shadow-2xl shadow-black/30 transition-all duration-300 hover:bg-black/45 hover:border-white/[0.1]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          {flag ? (
            <span className="text-lg leading-none">{flag}</span>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06]">
              {isCountry ? (
                <Globe className="h-3.5 w-3.5 text-white/40" />
              ) : (
                <Music className="h-3.5 w-3.5 text-white/40" />
              )}
            </div>
          )}
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
            {isCountry ? "Did you know?" : fact.genre ?? "Music"}
          </span>
        </div>

        {/* Fact */}
        <p className="text-[12px] font-light text-white/55 leading-relaxed">
          {fact.fact}
        </p>
      </div>

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
