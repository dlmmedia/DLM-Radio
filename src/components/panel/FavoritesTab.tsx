"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlaylists, type PlaylistDetail } from "@/hooks/usePlaylists";
import { useRadioStore } from "@/stores/radioStore";
import { StationRow } from "./StationRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  ListMusic,
  Plus,
  ChevronLeft,
  Trash2,
  Cloud,
  Loader2,
  Lock,
} from "lucide-react";

type View = "main" | "playlist-detail";

export function FavoritesTab() {
  const { status } = useSession();
  const isAuth = status === "authenticated";
  const { favorites, isCloudSynced } = useFavorites();
  const {
    playlists,
    loading: playlistsLoading,
    isAuth: playlistsAuth,
    createPlaylist,
    deletePlaylist,
    getPlaylistDetail,
  } = usePlaylists();
  const { setStation, setStationList } = useRadioStore();

  const [view, setView] = useState<View>("main");
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const openPlaylist = async (id: string) => {
    setLoadingDetail(true);
    setView("playlist-detail");
    const detail = await getPlaylistDetail(id);
    setSelectedPlaylist(detail);
    setLoadingDetail(false);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setCreatingPlaylist(true);
    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
    } catch {} finally {
      setCreatingPlaylist(false);
    }
  };

  if (view === "playlist-detail" && selectedPlaylist) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-7 text-xs"
              onClick={() => { setView("main"); setSelectedPlaylist(null); }}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={async () => {
                await deletePlaylist(selectedPlaylist.id);
                setView("main");
                setSelectedPlaylist(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <h2 className="text-base font-semibold">{selectedPlaylist.name}</h2>
          {selectedPlaylist.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedPlaylist.description}
            </p>
          )}
          {selectedPlaylist.stations.length > 0 && (
            <Button
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={() => {
                setStation(selectedPlaylist.stations[0]);
                setStationList(selectedPlaylist.stations, 0);
              }}
            >
              Play All
            </Button>
          )}
          <div className="mt-4 space-y-0.5">
            {loadingDetail ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : selectedPlaylist.stations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No stations in this playlist yet.
              </p>
            ) : (
              selectedPlaylist.stations.map((station) => (
                <StationRow
                  key={station.stationuuid}
                  station={station}
                  showCountry
                />
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Sync indicator */}
        {isCloudSynced && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Cloud className="h-3 w-3" />
            <span>Synced to your account</span>
          </div>
        )}

        {/* Favorites section */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Favorites{favorites.length > 0 && ` (${favorites.length})`}
          </h2>
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-8">
              <Heart className="h-10 w-10 opacity-30" />
              <div className="text-center">
                <p className="text-sm font-medium">No favorites yet</p>
                <p className="text-xs mt-1">
                  Tap the heart icon on any station to save it here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {favorites.map((station) => (
                <StationRow
                  key={station.stationuuid}
                  station={station}
                  showCountry
                />
              ))}
            </div>
          )}
        </div>

        {/* Playlists section (auth only) */}
        {isAuth && (
          <>
            <Separator />
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Your Playlists
              </h2>
              {playlistsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-1 mb-3">
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => openPlaylist(pl.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors"
                      >
                        <ListMusic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {pl.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {pl.stationCount} station
                            {pl.stationCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                    {playlists.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Create your first playlist below
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="New playlist..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreatePlaylist()
                      }
                      className="text-sm h-8"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5"
                      disabled={!newPlaylistName.trim() || creatingPlaylist}
                      onClick={handleCreatePlaylist}
                    >
                      {creatingPlaylist ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Sign in prompt for non-auth */}
        {!isAuth && status !== "loading" && (
          <>
            <Separator />
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent/30">
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Sign in to sync favorites across devices and create playlists
              </p>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
