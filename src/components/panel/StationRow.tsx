"use client";

import { useRadioStore } from "@/stores/radioStore";
import { useFavorites } from "@/hooks/useFavorites";
import { getGenreColor, getCountryFlag } from "@/lib/constants";
import type { Station } from "@/lib/types";
import { Play, Pause, Radio, Heart } from "lucide-react";

interface StationRowProps {
  station: Station;
  showCountry?: boolean;
  onClick?: () => void;
}

export function StationRow({ station, showCountry = false, onClick }: StationRowProps) {
  const { currentStation, isPlaying, setStation, setPlaying } = useRadioStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isActive = currentStation?.stationuuid === station.stationuuid;
  const faved = isFavorite(station.stationuuid);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (isActive) {
      setPlaying(!isPlaying);
    } else {
      setStation(station);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(station);
  };

  const genre = station.tags?.split(",")[0]?.trim();
  const flag = showCountry ? getCountryFlag(station.countrycode) : null;

  return (
    <div
      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-accent/50 group ${
        isActive ? "bg-accent/60" : ""
      }`}
    >
      {/* Play indicator / Favicon */}
      <button onClick={handleClick} className="relative h-8 w-8 flex-shrink-0">
        {station.favicon ? (
          <img
            src={station.favicon}
            alt=""
            className="h-8 w-8 rounded object-cover bg-muted"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={`${station.favicon ? "hidden" : ""} h-8 w-8 rounded flex items-center justify-center`}
          style={{ backgroundColor: getGenreColor(station.tags) + "22" }}
        >
          <Radio className="h-3.5 w-3.5" style={{ color: getGenreColor(station.tags) }} />
        </div>
        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {isActive && isPlaying ? (
            <Pause className="h-3.5 w-3.5 text-white" />
          ) : (
            <Play className="h-3.5 w-3.5 text-white ml-0.5" />
          )}
        </div>
      </button>

      {/* Station info */}
      <button onClick={handleClick} className="min-w-0 flex-1 text-left">
        <div className="text-sm font-medium line-clamp-2 leading-snug" title={station.name}>
          {station.name}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-0.5">
          {genre && (
            <span className="font-medium" style={{ color: getGenreColor(station.tags) }}>{genre}</span>
          )}
          {flag && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{flag}</span>
            </>
          )}
          {station.bitrate > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="rounded-full bg-muted/60 px-1.5 py-px text-[10px] font-medium">{station.bitrate}k</span>
            </>
          )}
        </div>
      </button>

      {/* Favorite + Active indicator */}
      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
        <button
          onClick={handleFavorite}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
            faved
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-70 hover:!opacity-100"
          }`}
          title={faved ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              faved ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </button>
        {isActive && isPlaying && (
          <div className="flex gap-0.5 items-end h-4">
            <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "40%", animationDelay: "0ms" }} />
            <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "70%", animationDelay: "150ms" }} />
            <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "50%", animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}
