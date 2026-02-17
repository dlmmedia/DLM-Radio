"use client";

import { useEffect, useState } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { searchStations, getTopClickStations } from "@/lib/radio-browser";
import type { Station } from "@/lib/types";
import { StationRow } from "./StationRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapPin, TrendingUp, Globe } from "lucide-react";

export function ExploreTab() {
  const { exploreCity, exploreCountry, exploreCountryCode } = useRadioStore();
  const [localStations, setLocalStations] = useState<Station[]>([]);
  const [popularStations, setPopularStations] = useState<Station[]>([]);
  const [trendingStations, setTrendingStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (exploreCountryCode) {
          const [local, popular] = await Promise.all([
            searchStations({
              countrycode: exploreCountryCode,
              state: exploreCity || undefined,
              order: "clickcount",
              reverse: true,
              limit: 20,
              hidebroken: true,
            }),
            searchStations({
              countrycode: exploreCountryCode,
              order: "votes",
              reverse: true,
              limit: 20,
              hidebroken: true,
            }),
          ]);
          setLocalStations(local);
          setPopularStations(popular);
        } else {
          const trending = await getTopClickStations(30);
          setTrendingStations(trending);
        }
      } catch (err) {
        console.error("Failed to load explore data:", err);
      }
      setLoading(false);
    }
    load();
  }, [exploreCity, exploreCountry, exploreCountryCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  // If no location selected, show trending
  if (!exploreCountryCode) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Trending Now</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Click a station on the globe to explore by location
          </p>
          <div className="space-y-0.5">
            {trendingStations.map((station) => (
              <StationRow key={station.stationuuid} station={station} showCountry />
            ))}
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* Location Header */}
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">
              {exploreCity || exploreCountry}
            </h2>
          </div>
          {exploreCity && exploreCountry && (
            <p className="text-xs text-muted-foreground ml-6">{exploreCountry}</p>
          )}
        </div>

        {/* Stations in area */}
        {localStations.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {exploreCity ? `Stations in ${exploreCity}` : "Stations"}
            </h3>
            <div className="space-y-0.5">
              {localStations.map((station) => (
                <StationRow key={station.stationuuid} station={station} />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Popular in country */}
        {popularStations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Popular in {exploreCountry}
              </h3>
            </div>
            <div className="space-y-0.5">
              {popularStations.map((station) => (
                <StationRow key={station.stationuuid} station={station} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
