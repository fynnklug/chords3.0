"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ListPlus, Share2, Maximize, Music } from "lucide-react";
import type { Song } from "@/components/app-shell/app-shell";
import { PresentationMode } from "@/components/views/presentation-mode";
import { AddToPlaylistContent } from "@/components/shared/add-to-playlist";

interface SingViewProps {
  song: Song | null;
}

function parseSections(content: string | null): { label: string; lines: string[] }[] {
  if (!content) return [];
  const raw = content.split("\n");
  const sections: { label: string; lines: string[] }[] = [];
  let current: { label: string; lines: string[] } = { label: "", lines: [] };

  for (const line of raw) {
    const trimmed = line.trim();
    // detect section headers like [Verse 1], [Chorus], etc.
    if (/^\[.+\]$/.test(trimmed)) {
      if (current.lines.length > 0 || current.label) {
        sections.push(current);
      }
      current = { label: trimmed.slice(1, -1), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0 || current.label) {
    sections.push(current);
  }
  return sections;
}

export function SingView({ song }: SingViewProps) {
  const [showPresentation, setShowPresentation] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sections = parseSections(song?.content ?? null);

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
        <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
          <Music className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Kein Lied ausgewaehlt</p>
        <p className="text-xs text-muted-foreground mt-1">
          {"Waehle ein Lied aus der Suche aus, um es hier zu singen."}
        </p>
      </div>
    );
  }

  if (showPresentation) {
    return (
      <PresentationMode
        sections={sections}
        title={song.title}
        onClose={() => setShowPresentation(false)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Action bar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate">{song.title}</h1>
            {song.artist && (
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDrawerOpen(true)}
              aria-label="Zur Playlist hinzufuegen"
            >
              <ListPlus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              aria-label="Teilen"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
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
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Inhalte vorhanden.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {sections.map((section, i) => (
              <div key={i}>
                {section.label && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.lines.map((line, j) => (
                    <p
                      key={j}
                      className={
                        line.trim() === ""
                          ? "h-3"
                          : "text-[15px] leading-relaxed font-mono"
                      }
                    >
                      {line}
                    </p>
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
