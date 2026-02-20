"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { SongData } from "@/lib/songs/types";
import { ChordLine } from "@/components/song/chord-line";

interface PresentationModeProps {
  songData: SongData;
  showChords: boolean;
  onClose: () => void;
}

export function PresentationMode({
  songData,
  showChords,
  onClose,
}: PresentationModeProps) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = songData.sections.length;

  const next = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  // Fullscreen API
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    async function enterFullscreen() {
      try {
        if (el && document.fullscreenElement !== el) {
          await el.requestFullscreen();
        }
      } catch {
        // not supported
      }
    }
    enterFullscreen();
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Wake Lock
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // denied
      }
    }
    requestWakeLock();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      wakeLock?.release();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, onClose]);

  // Tap zones
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      const x = e.clientX;
      const w = window.innerWidth;
      if (x < w / 3) prev();
      else next();
    },
    [next, prev]
  );

  const section = songData.sections[current];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      onClick={handleTap}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b">
        <p className="text-sm font-medium truncate flex-1">
          {songData.title}
        </p>
        <span className="text-xs text-muted-foreground mr-3">
          {current + 1} / {total}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Schliessen"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 overflow-hidden">
        {section && (
          <div className="w-full max-w-lg">
            {section.label && (
              <p className="text-xs font-semibold text-muted-foreground mb-4 text-center">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.lines.map((line, i) => (
                <div key={i} className="text-center">
                  <ChordLine line={line} showChords={showChords} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 border-t">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={current === 0}
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Zurueck"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={current === total - 1}
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Weiter"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
