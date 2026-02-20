"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ListPlus, Share2, Maximize, Music, Guitar, MicVocal } from "lucide-react";
import type { SongMeta } from "@/components/app-shell/app-shell";
import type { SongData } from "@/lib/songs/types";
import { PresentationMode } from "@/components/views/presentation-mode";
import { AddToPlaylistContent } from "@/components/shared/add-to-playlist";
import { ChordLine } from "@/components/song/chord-line";

interface SingViewProps {
  song: SongMeta | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SingView({ song }: SingViewProps) {
  const [showPresentation, setShowPresentation] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showChords, setShowChords] = useState(false);

  // Fetch song content from JSON via API
  const { data: songData } = useSWR<SongData>(
    song?.slug ? `/api/songs/${song.slug}` : null,
    fetcher
  );

  const handleShare = useCallback(async () => {
    if (!song) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `${song.title}${song.artist ? ` - ${song.artist}` : ""}`,
        });
      } catch {
        // user cancelled
      }
    }
  }, [song]);

  // Record to history when song loads
  useEffect(() => {
    if (!song) return;
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liedId: song.id }),
    }).catch(() => {});
  }, [song?.id]);

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-4rem)] text-center px-6">
        <div className="flex items-center justify-center size-14 rounded-full border border-border/20 mb-4">
          <Music className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Kein Lied ausgewaehlt
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {"Waehle ein Lied aus der Suche aus."}
        </p>
      </div>
    );
  }

  if (showPresentation && songData) {
    return (
      <PresentationMode
        songData={songData}
        showChords={showChords}
        onClose={() => setShowPresentation(false)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Action bar */}
      <header className="sticky top-0 z-30 border-b border-border/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate text-foreground">
              {song.title}
            </h1>
            {song.artist && (
              <p className="text-xs text-muted-foreground truncate">
                {song.artist}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Singer / Player toggle */}
            <button
              onClick={() => setShowChords(!showChords)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                showChords
                  ? "bg-foreground text-background"
                  : "border border-border/20 text-muted-foreground hover:text-foreground"
              }`}
              aria-label={showChords ? "Akkorde ausblenden" : "Akkorde anzeigen"}
            >
              {showChords ? (
                <>
                  <Guitar className="size-3" />
                  Player
                </>
              ) : (
                <>
                  <MicVocal className="size-3" />
                  Singer
                </>
              )}
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => setDrawerOpen(true)}
              aria-label="Zur Playlist hinzufuegen"
            >
              <ListPlus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={handleShare}
              aria-label="Teilen"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => setShowPresentation(true)}
              aria-label="Praesentationsmodus"
            >
              <Maximize className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Lyrics */}
      <div className="px-4 py-6">
        {!songData ? (
          <div className="flex flex-col items-center py-12">
            <div className="size-5 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
          </div>
        ) : songData.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Inhalte vorhanden.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {songData.sections.map((section, i) => (
              <div key={i}>
                {section.label && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.lines.map((line, j) => (
                    <ChordLine
                      key={j}
                      line={line}
                      showChords={showChords}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to playlist drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xs font-semibold uppercase tracking-[0.15em]">
              Zur Playlist hinzufuegen
            </DrawerTitle>
          </DrawerHeader>
          <AddToPlaylistContent
            songId={song.id}
            onDone={() => setDrawerOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
