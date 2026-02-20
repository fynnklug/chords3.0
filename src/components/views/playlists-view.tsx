"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  ListMusic,
  Play,
  Trash2,
  ChevronLeft,
  Loader2,
  Music,
} from "lucide-react";
import type { Song } from "@/components/app-shell/app-shell";
import { PresentationMode } from "@/components/views/presentation-mode";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Playlist {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

interface PlaylistsViewProps {
  onOpenSong: (song: Song) => void;
}

export function PlaylistsView({ onOpenSong }: PlaylistsViewProps) {
  const { data: playlists, isLoading } = useSWR<Playlist[]>(
    "/api/playlists",
    fetcher
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Detail view
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const { data: playlistSongs, isLoading: songsLoading } = useSWR<Song[]>(
    selectedPlaylist ? `/api/playlists/${selectedPlaylist.id}/songs` : null,
    fetcher
  );

  // Presentation mode for full playlist
  const [presenting, setPresenting] = useState(false);
  const [presentSections, setPresentSections] = useState<
    { label: string; lines: string[] }[]
  >([]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      setCreateOpen(false);
      mutate("/api/playlists");
    } catch {
      // ignore
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    mutate("/api/playlists");
    if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
  };

  const handleRemoveSong = async (liedId: number) => {
    if (!selectedPlaylist) return;
    await fetch("/api/playlists/songs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: selectedPlaylist.id, liedId }),
    });
    mutate(`/api/playlists/${selectedPlaylist.id}/songs`);
  };

  const handlePlayPlaylist = () => {
    if (!playlistSongs?.length) return;
    // Combine all songs into sections for presentation
    const allSections: { label: string; lines: string[] }[] = [];
    for (const song of playlistSongs) {
      if (!song.content) continue;
      const raw = song.content.split("\n");
      let current: { label: string; lines: string[] } = {
        label: song.title,
        lines: [],
      };
      for (const line of raw) {
        const trimmed = line.trim();
        if (/^\[.+\]$/.test(trimmed)) {
          if (current.lines.length > 0 || current.label) {
            allSections.push(current);
          }
          current = {
            label: `${song.title} - ${trimmed.slice(1, -1)}`,
            lines: [],
          };
        } else {
          current.lines.push(line);
        }
      }
      if (current.lines.length > 0 || current.label) {
        allSections.push(current);
      }
    }
    setPresentSections(allSections);
    setPresenting(true);
  };

  if (presenting && presentSections.length > 0) {
    return (
      <PresentationMode
        sections={presentSections}
        title={selectedPlaylist?.name ?? "Playlist"}
        onClose={() => setPresenting(false)}
      />
    );
  }

  // Playlist detail
  if (selectedPlaylist) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-2 px-4 h-14">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setSelectedPlaylist(null);
              }}
              aria-label="Zurueck"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h1 className="text-sm font-semibold truncate flex-1">
              {selectedPlaylist.name}
            </h1>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePlayPlaylist}
              disabled={!playlistSongs?.length}
              aria-label="Playlist abspielen"
            >
              <Play className="size-4" />
            </Button>
          </div>
        </header>

        <div className="px-4 py-3">
          {songsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="size-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !playlistSongs?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
                <Music className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Playlist ist leer</p>
              <p className="text-xs text-muted-foreground mt-1">
                {"Fuege Lieder ueber die Suche hinzu."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {playlistSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => onOpenSong(song)}
                  >
                    <div className="flex items-center justify-center size-10 shrink-0 rounded-md bg-muted">
                      <Music className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {song.title}
                      </p>
                      {song.artist && (
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      )}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveSong(song.id)}
                    aria-label="Aus Playlist entfernen"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Playlists overview
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold tracking-tight">Playlisten</h1>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCreateOpen(true)}
            aria-label="Neue Playlist erstellen"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !playlists?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
              <ListMusic className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Keine Playlisten</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erstelle deine erste Playlist.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Playlist erstellen
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
              >
                <button
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  onClick={() => setSelectedPlaylist(pl)}
                >
                  <div className="flex items-center justify-center size-12 shrink-0 rounded-lg bg-muted">
                    <ListMusic className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{pl.name}</p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(pl.id)}
                  aria-label="Playlist loeschen"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create playlist dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Name der Playlist"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Erstellen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
