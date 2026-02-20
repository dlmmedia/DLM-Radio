"use client";

import { useState } from "react";
import { usePlaylists } from "@/hooks/usePlaylists";
import type { Station } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ListMusic, Check, Loader2 } from "lucide-react";

interface AddToPlaylistDialogProps {
  station: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToPlaylistDialog({
  station,
  open,
  onOpenChange,
}: AddToPlaylistDialogProps) {
  const { playlists, createPlaylist, addStationToPlaylist } = usePlaylists();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  const handleCreate = async () => {
    if (!newName.trim() || !station) return;
    setCreating(true);
    try {
      const playlist = await createPlaylist(newName.trim());
      await addStationToPlaylist(playlist.id, station);
      setAddedTo((prev) => new Set([...prev, playlist.id]));
      setNewName("");
    } catch {} finally {
      setCreating(false);
    }
  };

  const handleAdd = async (playlistId: string) => {
    if (!station || addedTo.has(playlistId)) return;
    setAddingTo(playlistId);
    try {
      await addStationToPlaylist(playlistId, station);
      setAddedTo((prev) => new Set([...prev, playlistId]));
    } catch {} finally {
      setAddingTo(null);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setAddedTo(new Set());
      setNewName("");
      setCreating(false);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription className="truncate">
            {station?.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[240px]">
          {playlists.length > 0 ? (
            <div className="space-y-1">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAdd(pl.id)}
                  disabled={addingTo === pl.id || addedTo.has(pl.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors disabled:opacity-60"
                >
                  <ListMusic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{pl.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {pl.stationCount} station{pl.stationCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {addingTo === pl.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : addedTo.has(pl.id) ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No playlists yet. Create one below.
            </p>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="New playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="text-sm h-9"
          />
          <Button
            size="sm"
            className="h-9 px-3"
            disabled={!newName.trim() || creating}
            onClick={handleCreate}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
