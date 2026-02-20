"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { SongData } from "@/lib/songs/types";
import { ChordLine } from "@/components/song/chord-line";
import { motion, AnimatePresence } from "framer-motion";

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
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = songData.sections.length;

  const next = useCallback(() => {
    setCurrent((c) => {
      if (c >= total - 1) return c;
      setDirection(1);
      return c + 1;
    });
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => {
      if (c <= 0) return c;
      setDirection(-1);
      return c - 1;
    });
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
        // Fullscreen not supported or denied
      }
    }
    enterFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Wake Lock API
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // wake lock not available or denied
      }
    }
    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      wakeLock?.release();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Keyboard navigation
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
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, onClose]);

  // Tap zones: left third = prev, right two-thirds = next
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      const x = e.clientX;
      const w = window.innerWidth;
      if (x < w / 3) {
        prev();
      } else {
        next();
      }
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
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground truncate">
            {songData.title}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center justify-center size-8 rounded-full border border-border/20 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Schliessen"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, y: direction >= 0 ? 40 : -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction >= 0 ? -40 : 40 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-lg"
          >
            {section && (
              <>
                {section.label && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 text-center">
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
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom progress */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <button
          disabled={current === 0}
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="flex items-center justify-center size-8 rounded-full border border-border/20 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20"
          aria-label="Zurueck"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {songData.sections.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-4 h-1 bg-foreground"
                  : "size-1 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <button
          disabled={current === total - 1}
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="flex items-center justify-center size-8 rounded-full border border-border/20 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20"
          aria-label="Weiter"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
