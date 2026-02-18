"use client";

import { useEffect, useState, useRef } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { getGenreColor, getCountryFlag } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

export function StationInfoCard() {
  const currentStation = useRadioStore((s) => s.currentStation);
  const [visible, setVisible] = useState(true);
  const [minimal, setMinimal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show full card on station change, then fade to minimal after 6s
  useEffect(() => {
    setVisible(true);
    setMinimal(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMinimal(true);
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStation?.stationuuid]);

  if (!currentStation) return null;

  const genre = currentStation.tags?.split(",")[0]?.trim();
  const flag = getCountryFlag(currentStation.countrycode);
  const genreColor = getGenreColor(currentStation.tags);

  return (
    <div
      className={`absolute top-6 left-1/2 -translate-x-1/2 z-10 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`flex items-center gap-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-500 ${
          minimal ? "px-4 py-2" : "px-5 py-3"
        }`}
      >
        {/* Station icon */}
        {!minimal && (
          <>
            {currentStation.favicon ? (
              <img
                src={currentStation.favicon}
                alt=""
                className="h-10 w-10 rounded-lg object-cover bg-muted/20 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: genreColor + "33" }}
              >
                <Radio className="h-5 w-5" style={{ color: genreColor }} />
              </div>
            )}
          </>
        )}

        <div className={`min-w-0 ${minimal ? "" : "max-w-[280px]"}`}>
          <div className="text-sm font-medium text-white truncate">
            {currentStation.name}
          </div>
          {!minimal && (
            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/60">
              {genre && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 border-white/20"
                  style={{ color: genreColor }}
                >
                  {genre}
                </Badge>
              )}
              {flag && <span>{flag}</span>}
              {currentStation.country && (
                <span className="truncate">{currentStation.country}</span>
              )}
              {currentStation.bitrate > 0 && (
                <span>{currentStation.bitrate}kbps</span>
              )}
            </div>
          )}
        </div>

        {/* Minimal mode: pulsing dot */}
        {minimal && (
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: genreColor }}
          />
        )}
      </div>
    </div>
  );
}
