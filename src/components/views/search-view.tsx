"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Search, Mic, ListPlus, Music } from "lucide-react";
import type { Song } from "@/components/app-shell/app-shell";
import { AddToPlaylistContent } from "@/components/shared/add-to-playlist";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories = ["Alle", "Worship", "Lobpreis", "Hymne", "Modern", "Klassisch"];

interface SearchViewProps {
  onSingNow: (song: Song) => void;
}

export function SearchView({ onSingNow }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [drawerSong, setDrawerSong] = useState<Song | null>(null);

  const { data: songs, isLoading } = useSWR<Song[]>("/api/songs", fetcher);

  const filtered = useMemo(() => {
    if (!songs) return [];
    let result = songs;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [songs, query, activeCategory]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-lg font-semibold tracking-tight">Suche</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Lied oder Interpret suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0"
              >
                <Badge
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 text-xs"
                >
                  {cat}
                </Badge>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </header>

      {/* Song list */}
      <div className="flex-1 px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
              <Music className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Keine Lieder gefunden</p>
            <p className="text-xs text-muted-foreground mt-1">
              {query
                ? "Versuche einen anderen Suchbegriff."
                : "Es sind noch keine Lieder vorhanden."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-center size-10 shrink-0 rounded-md bg-muted">
                  <Music className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  {song.artist && (
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDrawerSong(song)}
                    aria-label="Zur Playlist hinzufuegen"
                  >
                    <ListPlus className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onSingNow(song)}
                    aria-label="Jetzt singen"
                  >
                    <Mic className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to playlist drawer */}
      <Drawer open={!!drawerSong} onOpenChange={(o) => !o && setDrawerSong(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Zur Playlist hinzufuegen</DrawerTitle>
          </DrawerHeader>
          {drawerSong && (
            <AddToPlaylistContent
              songId={drawerSong.id}
              onDone={() => setDrawerSong(null)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
