"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRadioStore } from "@/stores/radioStore";
import { useFavorites } from "@/hooks/useFavorites";
import { searchStations, voteForStation } from "@/lib/radio-browser";
import { getGenreColor, getCountryFlag } from "@/lib/constants";
import type { Station } from "@/lib/types";
import { StationRow } from "@/components/panel/StationRow";
import { AddToPlaylistDialog } from "@/components/playlist/AddToPlaylistDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  ThumbsUp,
  ExternalLink,
  Radio,
  Globe,
  Signal,
  Loader2,
  ListPlus,
} from "lucide-react";

export function StationDrawer() {
  const { drawerStation, setDrawerStation } = useRadioStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { status } = useSession();
  const isAuth = status === "authenticated";
  const [similarStations, setSimilarStations] = useState<Station[]>([]);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);

  useEffect(() => {
    if (!drawerStation) return;
    setVoted(false);
    setLoading(true);

    const tag = drawerStation.tags?.split(",")[0]?.trim();
    if (tag) {
      searchStations({
        tag,
        countrycode: drawerStation.countrycode,
        limit: 10,
        order: "votes",
        reverse: true,
        hidebroken: true,
      })
        .then((stations) => {
          setSimilarStations(
            stations.filter((s) => s.stationuuid !== drawerStation.stationuuid)
          );
        })
        .catch(() => setSimilarStations([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [drawerStation]);

  const handleVote = async () => {
    if (!drawerStation || voting || voted) return;
    setVoting(true);
    try {
      await voteForStation(drawerStation.stationuuid);
      setVoted(true);
    } catch {}
    setVoting(false);
  };

  return (
    <AnimatePresence>
      {drawerStation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setDrawerStation(null)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 max-h-[70vh] bg-background border-t border-border/40 rounded-t-xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <ScrollArea className="max-h-[calc(70vh-3rem)]">
              <div className="px-5 pb-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  {drawerStation.favicon ? (
                    <img
                      src={drawerStation.favicon}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover bg-muted flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: getGenreColor(drawerStation.tags) + "22" }}
                    >
                      <Radio className="h-5 w-5" style={{ color: getGenreColor(drawerStation.tags) }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold truncate">
                      {drawerStation.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {getCountryFlag(drawerStation.countrycode) && (
                        <span>{getCountryFlag(drawerStation.countrycode)}</span>
                      )}
                      <span>{drawerStation.country}</span>
                      {drawerStation.state && <span>• {drawerStation.state}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => setDrawerStation(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tags */}
                {drawerStation.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {drawerStation.tags.split(",").filter(Boolean).slice(0, 8).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {drawerStation.codec && (
                    <div className="flex items-center gap-1">
                      <Signal className="h-3 w-3" />
                      <span className="uppercase">{drawerStation.codec}</span>
                      {drawerStation.bitrate > 0 && (
                        <span>{drawerStation.bitrate}kbps</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{drawerStation.votes} votes</span>
                  </div>
                  {drawerStation.language && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{drawerStation.language.split(",")[0]}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => toggleFavorite(drawerStation)}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 mr-1.5 ${
                        isFavorite(drawerStation.stationuuid)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    {isFavorite(drawerStation.stationuuid) ? "Favorited" : "Favorite"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={handleVote}
                    disabled={voting || voted}
                  >
                    {voting ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <ThumbsUp
                        className={`h-3.5 w-3.5 mr-1.5 ${voted ? "fill-primary text-primary" : ""}`}
                      />
                    )}
                    {voted ? "Voted!" : "Vote"}
                  </Button>
                  {isAuth && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setPlaylistDialogOpen(true)}
                    >
                      <ListPlus className="h-3.5 w-3.5 mr-1.5" />
                      Add to Playlist
                    </Button>
                  )}
                  {drawerStation.homepage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      asChild
                    >
                      <a
                        href={drawerStation.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>

                {/* Similar Stations */}
                {similarStations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Similar Stations
                      </h3>
                      <div className="space-y-0.5">
                        {similarStations.slice(0, 5).map((station) => (
                          <StationRow
                            key={station.stationuuid}
                            station={station}
                            onClick={() => {
                              useRadioStore.getState().setStation(station);
                              setDrawerStation(station);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Add to Playlist Dialog */}
          {isAuth && (
            <AddToPlaylistDialog
              station={drawerStation}
              open={playlistDialogOpen}
              onOpenChange={setPlaylistDialogOpen}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
