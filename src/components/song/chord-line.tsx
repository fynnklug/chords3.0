"use client";

import { parseChordProLine, stripChords } from "@/lib/songs/chordpro";

interface ChordLineProps {
  line: string;
  showChords: boolean;
}

/**
 * Renders a single ChordPro line.
 * - Singer mode: strips chords, shows clean text.
 * - Player mode: renders chords above the corresponding text positions.
 */
export function ChordLine({ line, showChords }: ChordLineProps) {
  if (!showChords) {
    const clean = stripChords(line);
    if (clean.trim() === "") return <div className="h-3" />;
    return (
      <p className="text-[15px] leading-relaxed text-foreground">{clean}</p>
    );
  }

  const { pairs } = parseChordProLine(line);
  const hasAnyChord = pairs.some((p) => p.chord);

  if (!hasAnyChord) {
    const text = pairs.map((p) => p.text).join("");
    if (text.trim() === "") return <div className="h-3" />;
    return (
      <p className="text-[15px] leading-relaxed text-foreground pt-5">{text}</p>
    );
  }

  return (
    <div className="relative pt-5">
      {/* Chord row */}
      <div className="absolute top-0 left-0 flex whitespace-pre" aria-hidden="true">
        {pairs.map((pair, i) => (
          <span key={i} className="relative inline-block">
            {pair.chord && (
              <span className="absolute -top-0 left-0 text-xs font-bold text-primary font-mono">
                {pair.chord}
              </span>
            )}
            {/* Invisible text to maintain spacing */}
            <span className="invisible text-[15px]">{pair.text}</span>
          </span>
        ))}
      </div>
      {/* Text row */}
      <p className="text-[15px] leading-relaxed text-foreground">
        {pairs.map((p) => p.text).join("")}
      </p>
    </div>
  );
}
