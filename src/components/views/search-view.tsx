"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Search, Mic, Plus, Music } from "lucide-react";
import type { SongMeta } from "@/components/app-shell/app-shell";
import { AddToPlaylistContent } from "@/components/shared/add-to-playlist";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories = ["Alle", "Rock", "Classic", "Folk", "Worship", "Modern"];

interface SearchViewProps {
  onSingNow: (song: SongMeta) => void;
}

export function SearchView({ onSingNow }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [drawerSong, setDrawerSong] = useState<SongMeta | null>(null);

  const { data: songs, isLoading } = useSWR<SongMeta[]>("/api/songs", fetcher);

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
    if (activeCategory !== "Alle") {
      result = result.filter(
        (s) => s.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    return result;
  }, [songs, query, activeCategory]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Suche
          </h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Lied oder Interpret..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 border-border/20 bg-card"
            />
          </div>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  activeCategory === cat
                    ? "bg-foreground text-background"
                    : "border border-border/20 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </header>

      {/* Song list */}
      <div className="flex-1 px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex items-center justify-center size-12 rounded-full border border-border/20 mb-4">
              <Music className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Keine Lieder gefunden
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {query
                ? "Versuche einen anderen Suchbegriff."
                : "Es sind noch keine Lieder vorhanden."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((song) => (
              <div
                key={song.id}
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-card"
              >
                <button
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  onClick={() => onSingNow(song)}
                >
                  <div className="flex items-center justify-center size-10 shrink-0 rounded-lg border border-border/20 bg-card">
                    <Music className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground">
                      {song.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                      {song.category && (
                        <span className="ml-2 text-muted-foreground/50">
                          {song.category}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    onClick={() => setDrawerSong(song)}
                    aria-label="Zur Playlist hinzufuegen"
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    onClick={() => onSingNow(song)}
                    aria-label="Jetzt singen"
                  >
                    <Mic className="size-4" />
                  </Button>
                </div>
                {/* Mobile-visible buttons */}
                <div className="flex items-center gap-1 md:hidden">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    onClick={() => setDrawerSong(song)}
                    aria-label="Zur Playlist hinzufuegen"
                  >
                    <Plus className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to playlist drawer */}
      <Drawer
        open={!!drawerSong}
        onOpenChange={(o) => !o && setDrawerSong(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xs font-semibold uppercase tracking-[0.15em]">
              Zur Playlist hinzufuegen
            </DrawerTitle>
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
