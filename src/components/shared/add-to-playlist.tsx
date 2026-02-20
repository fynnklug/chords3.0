"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
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
          className="h-9 border-border/20 bg-card"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          className="flex items-center justify-center size-9 shrink-0 rounded-lg border border-border/20 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </button>
      </div>

      {/* Existing playlists */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !playlists?.length ? (
        <div className="flex flex-col items-center py-8 text-center">
          <ListMusic className="size-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            Noch keine Playlisten vorhanden.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
          {playlists.map((pl) => {
            const isAdded = added.has(pl.id);
            const isAdding = addingTo === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => !isAdded && handleAdd(pl.id)}
                disabled={isAdded || isAdding}
                className="flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-card disabled:opacity-60"
              >
                <div className="flex items-center justify-center size-8 shrink-0 rounded-lg border border-border/20 bg-card">
                  <ListMusic className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium flex-1 truncate text-foreground">
                  {pl.name}
                </span>
                {isAdding ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : isAdded ? (
                  <Check className="size-4 text-foreground" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
