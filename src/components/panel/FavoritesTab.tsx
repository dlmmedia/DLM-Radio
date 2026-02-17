"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { StationRow } from "./StationRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart } from "lucide-react";

export function FavoritesTab() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground px-8">
        <Heart className="h-10 w-10 opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium">No favorites yet</p>
          <p className="text-xs mt-1">
            Tap the heart icon on any station to save it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {favorites.length} station{favorites.length !== 1 ? "s" : ""}
        </h2>
        <div className="space-y-0.5">
          {favorites.map((station) => (
            <StationRow key={station.stationuuid} station={station} showCountry />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
