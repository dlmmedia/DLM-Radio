"use client";

import { useRadioStore } from "@/stores/radioStore";
import { useFavorites } from "@/hooks/useFavorites";
import { getCountryFlag, getGenreColor } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Loader2,
  Radio,
} from "lucide-react";

export function PlayerBar() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    setPlaying,
    setVolume,
    toggleMute,
    nextStation,
    prevStation,
    setDrawerStation,
  } = useRadioStore();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!currentStation) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Radio className="h-4 w-4" />
          <span>Select a station to start listening</span>
        </div>
      </div>
    );
  }

  const genre = currentStation.tags?.split(",")[0]?.trim();
  const flag = getCountryFlag(currentStation.countrycode);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border/40 bg-background/90 backdrop-blur-xl">
      <div className="flex items-center h-full px-3 gap-3">
        {/* Transport Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={prevStation}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setPlaying(!isPlaying)}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={nextStation}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Station Info */}
        <button
          className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          onClick={() => setDrawerStation(currentStation)}
        >
          {currentStation.favicon ? (
            <img
              src={currentStation.favicon}
              alt=""
              className="h-9 w-9 rounded-md object-cover bg-muted flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getGenreColor(currentStation.tags) + "33" }}
            >
              <Radio className="h-4 w-4" style={{ color: getGenreColor(currentStation.tags) }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{currentStation.name}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {genre && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4"
                  style={{
                    borderColor: getGenreColor(currentStation.tags) + "66",
                    color: getGenreColor(currentStation.tags),
                  }}
                >
                  {genre}
                </Badge>
              )}
              {flag && <span>{flag}</span>}
              {currentStation.bitrate > 0 && (
                <span>{currentStation.bitrate}kbps</span>
              )}
              {currentStation.codec && (
                <span className="uppercase">{currentStation.codec}</span>
              )}
            </div>
          </div>
        </button>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={([v]) => setVolume(v / 100)}
            max={100}
            step={1}
            className="w-20"
          />
        </div>

        {/* Favorite */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleFavorite(currentStation)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite(currentStation.stationuuid)
                    ? "fill-red-500 text-red-500"
                    : ""
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFavorite(currentStation.stationuuid) ? "Remove from favorites" : "Add to favorites"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
