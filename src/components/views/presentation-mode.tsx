"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PresentationModeProps {
  sections: { label: string; lines: string[] }[];
  title: string;
  onClose: () => void;
}

export function PresentationMode({
  sections,
  title,
  onClose,
}: PresentationModeProps) {
  const [current, setCurrent] = useState(0);
  const total = sections.length;

  const next = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
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

  // Touch navigation
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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

  const section = sections[current];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      onClick={handleTap}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
        </div>
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
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {section && (
          <>
            {section.label && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                {section.label}
              </p>
            )}
            <div className="space-y-1 text-center">
              {section.lines.map((line, i) => (
                <p
                  key={i}
                  className={
                    line.trim() === ""
                      ? "h-4"
                      : "text-lg leading-relaxed font-mono"
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom progress */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
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
        <p className="text-xs text-muted-foreground font-mono">
          {current + 1} / {total}
        </p>
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
