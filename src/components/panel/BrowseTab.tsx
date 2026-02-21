"use client";

import { useState } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { CURATED_PLAYLISTS, PLAYLIST_CATEGORY_LABELS, PLAYLIST_CATEGORY_ORDER } from "@/lib/playlists";
import { searchStations, getTopClickStations, getTopVoteStations, getLastClickStations, getLastChangeStations } from "@/lib/radio-browser";
import type { Station, PlaylistDefinition, PlaylistCategory } from "@/lib/types";
import { StationRow } from "./StationRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ThumbsUp,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Loader2,
} from "lucide-react";

type View = "playlists" | "playlist-detail" | "popularity" | "popularity-detail";

const playlistsByCategory = PLAYLIST_CATEGORY_ORDER.reduce((acc, cat) => {
  acc[cat] = CURATED_PLAYLISTS.filter((p) => p.category === cat);
  return acc;
}, {} as Record<PlaylistCategory, PlaylistDefinition[]>);

export function BrowseTab() {
  const [view, setView] = useState<View>("playlists");
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDefinition | null>(null);
  const [playlistStations, setPlaylistStations] = useState<Station[]>([]);
  const [popularityStations, setPopularityStations] = useState<Station[]>([]);
  const [popularityType, setPopularityType] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["featured"]));
  const { setStationList, setStation, fetchRandomStation } = useRadioStore();

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const openPlaylist = async (playlist: PlaylistDefinition) => {
    setSelectedPlaylist(playlist);
    setView("playlist-detail");
    setLoading(true);
    try {
      const stations = await searchStations(playlist.query);
      setPlaylistStations(stations);
    } catch {
      setPlaylistStations([]);
    }
    setLoading(false);
  };

  const openPopularity = async (type: string) => {
    setPopularityType(type);
    setView("popularity-detail");
    setLoading(true);
    try {
      let stations: Station[] = [];
      switch (type) {
        case "topclick":
          stations = await getTopClickStations(100);
          break;
        case "topvote":
          stations = await getTopVoteStations(100);
          break;
        case "lastclick":
          stations = await getLastClickStations(100);
          break;
        case "lastchange":
          stations = await getLastChangeStations(100);
          break;
      }
      setPopularityStations(stations);
    } catch {
      setPopularityStations([]);
    }
    setLoading(false);
  };

  const handleRandomRide = async () => {
    setLoading(true);
    await fetchRandomStation();
    setLoading(false);
  };

  const handlePlayAll = () => {
    if (playlistStations.length > 0) {
      setStation(playlistStations[0]);
      setStationList(playlistStations, 0);
    }
  };

  if (view === "playlist-detail" && selectedPlaylist) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 h-7 text-xs"
            onClick={() => setView("playlists")}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
          <div className="mb-4">
            <h2 className="text-base font-semibold">{selectedPlaylist.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedPlaylist.description}
            </p>
            {playlistStations.length > 0 && (
              <Button size="sm" className="mt-2 h-7 text-xs" onClick={handlePlayAll}>
                <Play className="h-3 w-3 mr-1" />
                Play All
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {playlistStations.map((station) => (
                <StationRow key={station.stationuuid} station={station} showCountry />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  if (view === "popularity-detail") {
    const title =
      popularityType === "topclick" ? "Top Clicks" :
      popularityType === "topvote" ? "Top Votes" :
      popularityType === "lastclick" ? "Recently Played" :
      "Recently Added";

    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 h-7 text-xs"
            onClick={() => setView("playlists")}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
          <h2 className="text-base font-semibold mb-4">{title}</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {popularityStations.map((station) => (
                <StationRow key={station.stationuuid} station={station} showCountry />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Playlist Categories */}
        {PLAYLIST_CATEGORY_ORDER.map((cat) => {
          const playlists = playlistsByCategory[cat];
          const isExpanded = expandedCategories.has(cat);

          return (
            <PlaylistSection
              key={cat}
              label={PLAYLIST_CATEGORY_LABELS[cat]}
              count={playlists.length}
              expanded={isExpanded}
              onToggle={() => toggleCategory(cat)}
              playlists={playlists}
              onOpen={openPlaylist}
            />
          );
        })}

        {/* Random Ride */}
        <button
          onClick={handleRandomRide}
          disabled={loading}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/60 hover:bg-accent/30 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Shuffle className="h-5 w-5 text-primary" />
          )}
          <div className="text-left">
            <div className="text-sm font-medium">Random Ride</div>
            <div className="text-[10px] text-muted-foreground">
              Surprise station from anywhere in the world
            </div>
          </div>
        </button>

        <Separator />

        {/* By Popularity */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            By Popularity
          </h2>
          <div className="space-y-1">
            <PopularityRow
              icon={<TrendingUp className="h-4 w-4" />}
              label="Top Clicks"
              desc="Trending now"
              onClick={() => openPopularity("topclick")}
            />
            <PopularityRow
              icon={<ThumbsUp className="h-4 w-4" />}
              label="Top Votes"
              desc="All-time favorites"
              onClick={() => openPopularity("topvote")}
            />
            <PopularityRow
              icon={<Clock className="h-4 w-4" />}
              label="Recently Played"
              desc="What others are listening to"
              onClick={() => openPopularity("lastclick")}
            />
            <PopularityRow
              icon={<Sparkles className="h-4 w-4" />}
              label="Recently Added"
              desc="New stations"
              onClick={() => openPopularity("lastchange")}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function PlaylistSection({
  label,
  count,
  expanded,
  onToggle,
  playlists,
  onOpen,
}: {
  label: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  playlists: PlaylistDefinition[];
  onOpen: (p: PlaylistDefinition) => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
          <span className="ml-1.5 text-muted-foreground/50 normal-case tracking-normal">
            {count}
          </span>
        </h2>
        <ChevronRight
          className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-2">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onOpen(playlist)}
              className="text-left p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors group"
            >
              <div
                className="w-6 h-1 rounded-full mb-2"
                style={{ backgroundColor: playlist.color }}
              />
              <div className="text-sm font-medium">{playlist.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                {playlist.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PopularityRow({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      <div className="text-left">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}

function Play(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
