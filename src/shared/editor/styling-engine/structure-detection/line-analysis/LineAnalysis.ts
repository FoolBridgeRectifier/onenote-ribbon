import type { InertZoneType, LinePrefixType, InertRange } from '../../interfaces';
import { LINE_PREFIX_PATTERNS, CALLOUT_PREFIX_PATTERN } from '../constants';

// ============================================================
// Inert Zone Lookup for a Line
// ============================================================

/**
 * Checks if a line (given by absolute offsets) falls inside any inert range.
 * Returns the zone type if the line is fully contained, null otherwise.
 */
export function findInertZoneForLine(
  lineStartOffset: number,
  lineEndOffset: number,
  inertRanges: InertRange[]
): InertZoneType | null {
  for (let rangeIndex = 0; rangeIndex < inertRanges.length; rangeIndex++) {
    const range = inertRanges[rangeIndex];

    if (lineStartOffset >= range.startOffset && lineEndOffset <= range.endOffset) {
      return range.zoneType;
    }
  }

  return null;
}

// ============================================================
// Line Prefix Extraction
// ============================================================

/**
 * Extracts the full composite prefix and innermost type for a single line of text.
 * Handles composite prefixes like "> - [ ] " (callout wrapping todo).
 */
export function extractLinePrefix(lineText: string): {
  linePrefix: string | null;
  linePrefixType: LinePrefixType;
} {
  let fullPrefix = '';
  let innermostType: LinePrefixType = 'none';
  let remainingText = lineText;

  // First pass: check for callout prefix
  const calloutPattern = new RegExp(CALLOUT_PREFIX_PATTERN.source, CALLOUT_PREFIX_PATTERN.flags);
  const calloutMatch = calloutPattern.exec(remainingText);

  if (calloutMatch) {
    fullPrefix += calloutMatch[1];
    innermostType = 'callout';
    remainingText = remainingText.slice(calloutMatch[1].length);
  }

  // Second pass: check for inner prefix (todo, bullet, numbered, heading, footnote, indent)
  for (let patternIndex = 0; patternIndex < LINE_PREFIX_PATTERNS.length; patternIndex++) {
    const { type, pattern } = LINE_PREFIX_PATTERNS[patternIndex];
    const freshPattern = new RegExp(pattern.source, pattern.flags);
    const prefixMatch = freshPattern.exec(remainingText);

    if (prefixMatch) {
      fullPrefix += prefixMatch[1];
      innermostType = type;
      break;
    }
  }

  if (fullPrefix === '') {
    return { linePrefix: null, linePrefixType: 'none' };
  }

  return { linePrefix: fullPrefix, linePrefixType: innermostType };
}

// ============================================================
// Selection Line Splitting
// ============================================================

/**
 * Splits the selection range into individual lines based on newline
 * positions in the source text. Returns absolute line start/end offsets.
 */
export function splitSelectionIntoLines(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number
): Array<{ lineStartOffset: number; lineEndOffset: number }> {
  const lines: Array<{ lineStartOffset: number; lineEndOffset: number }> = [];
  let currentOffset = selectionStartOffset;

  while (currentOffset <= selectionEndOffset) {
    const newlinePosition = sourceText.indexOf('\n', currentOffset);

    // If no newline found, or newline is beyond selection end, the line ends at selection end
    if (newlinePosition === -1 || newlinePosition >= selectionEndOffset) {
      lines.push({ lineStartOffset: currentOffset, lineEndOffset: selectionEndOffset });
      break;
    }

    // Line ends at the newline (exclusive — newline itself is a separator)
    lines.push({ lineStartOffset: currentOffset, lineEndOffset: newlinePosition });
    currentOffset = newlinePosition + 1;
  }

  return lines;
}
