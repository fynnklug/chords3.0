"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import type { SongMeta } from "@/components/app-shell/app-shell";
import type { SongData } from "@/lib/songs/types";
import { PresentationMode } from "@/components/views/presentation-mode";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Playlist {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

interface PlaylistsViewProps {
  onOpenSong: (song: SongMeta) => void;
}

export function PlaylistsView({ onOpenSong }: PlaylistsViewProps) {
  const { data: playlists, isLoading } = useSWR<Playlist[]>(
    "/api/playlists",
    fetcher
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const { data: playlistSongs, isLoading: songsLoading } = useSWR<SongMeta[]>(
    selectedPlaylist ? `/api/playlists/${selectedPlaylist.id}/songs` : null,
    fetcher
  );
  const [presenting, setPresenting] = useState(false);
  const [presentSongData, setPresentSongData] = useState<SongData | null>(null);

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

  const handlePlayPlaylist = async () => {
    if (!playlistSongs?.length) return;
    const allSections: SongData["sections"] = [];
    for (const song of playlistSongs) {
      if (!song.slug) continue;
      try {
        const res = await fetch(`/api/songs/${song.slug}`);
        const data: SongData = await res.json();
        if (data.sections) {
          for (const section of data.sections) {
            allSections.push({
              ...section,
              label: `${data.title} - ${section.label}`,
            });
          }
        }
      } catch {
        // skip
      }
    }
    if (allSections.length > 0) {
      setPresentSongData({
        slug: "playlist",
        title: selectedPlaylist?.name ?? "Playlist",
        artist: "",
        category: "",
        sections: allSections,
      });
      setPresenting(true);
    }
  };

  if (presenting && presentSongData) {
    return (
      <PresentationMode
        songData={presentSongData}
        showChords={false}
        onClose={() => {
          setPresenting(false);
          setPresentSongData(null);
        }}
      />
    );
  }

  // Playlist detail
  if (selectedPlaylist) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 bg-background">
          <div className="flex items-center gap-2 px-4 h-14">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedPlaylist(null)}
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
          <Separator />
        </header>

        <div className="flex-1">
          {songsLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-9 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !playlistSongs?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="flex items-center justify-center size-10 rounded-md bg-muted mb-3">
                <Music className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Playlist ist leer</p>
              <p className="text-sm text-muted-foreground mt-1">
                {"Fuege Lieder ueber die Suche hinzu."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {playlistSongs.map((song, i) => (
                <div key={song.id}>
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50">
                    <button
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      onClick={() => onOpenSong(song)}
                    >
                      <div className="flex items-center justify-center size-9 shrink-0 rounded-md bg-muted">
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
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                  {i < playlistSongs.length - 1 && (
                    <Separator className="ml-16" />
                  )}
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
      <header className="sticky top-0 z-30 bg-background">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold">Playlisten</h1>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCreateOpen(true)}
            aria-label="Neue Playlist erstellen"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Separator />
      </header>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-10 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !playlists?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex items-center justify-center size-10 rounded-md bg-muted mb-3">
              <ListMusic className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Keine Playlisten</p>
            <p className="text-sm text-muted-foreground mt-1">
              Erstelle deine erste Playlist.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4 mr-1" />
              Playlist erstellen
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {playlists.map((pl, i) => (
              <div key={pl.id}>
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50">
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => setSelectedPlaylist(pl)}
                  >
                    <div className="flex items-center justify-center size-10 shrink-0 rounded-md bg-muted">
                      <ListMusic className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {pl.name}
                      </p>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(pl.id)}
                    aria-label="Playlist loeschen"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
                {i < playlists.length - 1 && (
                  <Separator className="ml-16" />
                )}
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
