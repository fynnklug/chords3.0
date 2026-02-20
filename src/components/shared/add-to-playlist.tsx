"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Plus, ListMusic, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Playlist {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

interface AddToPlaylistContentProps {
  songId: number;
  onDone: () => void;
}

export function AddToPlaylistContent({
  songId,
  onDone,
}: AddToPlaylistContentProps) {
  const { data: playlists, isLoading } = useSWR<Playlist[]>(
    "/api/playlists",
    fetcher
  );
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const handleAdd = async (playlistId: number) => {
    setAddingTo(playlistId);
    try {
      await fetch("/api/playlists/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, liedId: songId }),
      });
      setAdded((prev) => new Set(prev).add(playlistId));
      mutate("/api/playlists");
    } catch {
      // ignore
    }
    setAddingTo(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const playlist = await res.json();
      await handleAdd(playlist.id);
      setNewName("");
      mutate("/api/playlists");
    } catch {
      // ignore
    }
    setCreating(false);
  };

  return (
    <div className="px-4 pb-6">
      {/* Create new playlist */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Neue Playlist..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="h-9"
        />
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </div>

      {/* Existing playlists */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !playlists?.length ? (
        <div className="flex flex-col items-center py-8 text-center">
          <ListMusic className="size-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Noch keine Playlisten vorhanden.
          </p>
        </div>
      ) : (
        <div className="flex flex-col max-h-64 overflow-y-auto">
          {playlists.map((pl, i) => {
            const isAdded = added.has(pl.id);
            const isAdding = addingTo === pl.id;
            return (
              <div key={pl.id}>
                <button
                  onClick={() => !isAdded && handleAdd(pl.id)}
                  disabled={isAdded || isAdding}
                  className="flex items-center gap-3 w-full px-2 py-2.5 text-left hover:bg-muted/50 rounded-md disabled:opacity-60"
                >
                  <div className="flex items-center justify-center size-8 shrink-0 rounded-md bg-muted">
                    <ListMusic className="size-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">
                    {pl.name}
                  </span>
                  {isAdding ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : isAdded ? (
                    <Check className="size-4 text-foreground" />
                  ) : null}
                </button>
                {i < playlists.length - 1 && <Separator className="ml-12" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
