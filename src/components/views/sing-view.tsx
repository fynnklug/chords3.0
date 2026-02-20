"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const { data: songData, isLoading } = useSWR<SongData>(
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
        <div className="flex items-center justify-center size-10 rounded-md bg-muted mb-3">
          <Music className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Kein Lied ausgewaehlt</p>
        <p className="text-sm text-muted-foreground mt-1">
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
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate">
              {song.title}
            </h1>
            {song.artist && (
              <p className="text-xs text-muted-foreground truncate">
                {song.artist}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant={showChords ? "default" : "outline"}
              className="cursor-pointer gap-1"
              onClick={() => setShowChords(!showChords)}
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
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Zur Playlist hinzufuegen"
                  >
                    <ListPlus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zur Playlist</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleShare}
                    aria-label="Teilen"
                  >
                    <Share2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Teilen</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPresentation(true)}
                    aria-label="Praesentationsmodus"
                  >
                    <Maximize className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Praesentation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Separator />
      </header>

      {/* Lyrics */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        ) : !songData || songData.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Inhalte vorhanden.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {songData.sections.map((section, i) => (
              <div key={i}>
                {section.label && (
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.lines.map((line, j) => (
                    <ChordLine key={j} line={line} showChords={showChords} />
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
            <DrawerTitle>Zur Playlist hinzufuegen</DrawerTitle>
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
