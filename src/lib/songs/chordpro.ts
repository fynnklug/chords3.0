import type { ChordTextPair, ParsedLine } from "./types";

/**
 * Parse a ChordPro line like "[G]Today is [D]going to be [Em]the day"
 * into an array of { chord, text } pairs.
 */
export function parseChordProLine(line: string): ParsedLine {
  const pairs: ChordTextPair[] = [];
  const regex = /\[([^\]]*)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(line)) !== null) {
    // Text before this chord (if any, and not the first chord)
    if (match.index > lastIndex) {
      const textBefore = line.slice(lastIndex, match.index);
      if (pairs.length > 0) {
        // Append to previous pair's text
        pairs[pairs.length - 1].text += textBefore;
      } else {
        pairs.push({ chord: null, text: textBefore });
      }
    }

    pairs.push({ chord: match[1], text: "" });
    lastIndex = regex.lastIndex;
  }

  // Remaining text after last chord
  if (lastIndex < line.length) {
    const remaining = line.slice(lastIndex);
    if (pairs.length > 0) {
      pairs[pairs.length - 1].text += remaining;
    } else {
      pairs.push({ chord: null, text: remaining });
    }
  }

  // If empty line
  if (pairs.length === 0) {
    pairs.push({ chord: null, text: line });
  }

  return { pairs, raw: line };
}

/**
 * Strip all chord tags from a ChordPro line, returning clean lyrics only.
 */
export function stripChords(line: string): string {
  return line.replace(/\[([^\]]*)\]/g, "");
}

/**
 * Check if a line contains any chords.
 */
export function hasChords(line: string): boolean {
  return /\[([^\]]*)\]/.test(line);
}
