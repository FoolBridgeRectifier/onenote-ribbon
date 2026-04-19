import {
  InertZoneType,
  LinePrefixType,
  LineStructureContext,
  ProtectedRange,
  StructureContext,
} from './interfaces';

import {
  LINE_PREFIX_PATTERNS,
  CALLOUT_PREFIX_PATTERN,
  ATOMIC_TOKEN_PATTERNS,
  CODE_FENCE_PATTERN,
  MATH_FENCE_PATTERN,
  TABLE_LINE_PATTERN,
  HORIZONTAL_RULE_PATTERN,
  INLINE_MATH_PATTERN,
  INLINE_CODE_PATTERN,
} from './constants';

// ============================================================
// Inert Zone Types
// ============================================================

interface InertRange {
  startOffset: number;
  endOffset: number;
  zoneType: InertZoneType;
}

// ============================================================
// Inert Zone Scanning
// ============================================================

/**
 * Scans the full source text and builds a list of absolute offset ranges
 * that are considered inert (code blocks, math blocks, tables,
 * horizontal rules, inline math, inline code).
 */
function buildInertRanges(sourceText: string): InertRange[] {
  const inertRanges: InertRange[] = [];

  // Fenced code blocks: pair up ``` lines
  collectFencedBlockRanges(sourceText, CODE_FENCE_PATTERN, 'codeBlock', inertRanges);

  // Math blocks: pair up $$ lines
  collectFencedBlockRanges(sourceText, MATH_FENCE_PATTERN, 'mathBlock', inertRanges);

  // Table lines: each matching line is independently inert
  collectMatchRanges(sourceText, TABLE_LINE_PATTERN, 'table', inertRanges);

  // Horizontal rules: each matching line is independently inert
  collectMatchRanges(sourceText, HORIZONTAL_RULE_PATTERN, 'horizontalRule', inertRanges);

  // Inline math: each match is an inert span
  collectMatchRanges(sourceText, INLINE_MATH_PATTERN, 'inlineMath', inertRanges);

  // Inline code: each match is an inert span
  collectMatchRanges(sourceText, INLINE_CODE_PATTERN, 'inlineCode', inertRanges);

  return inertRanges;
}

/**
 * Pairs up fence delimiter matches (like ``` or $$) to form block ranges.
 * The inert range spans from the start of the opening fence line
 * to the end of the closing fence line.
 */
function collectFencedBlockRanges(
  sourceText: string,
  patternTemplate: RegExp,
  zoneType: InertZoneType,
  output: InertRange[],
): void {
  const pattern = new RegExp(patternTemplate.source, patternTemplate.flags);
  const fencePositions: Array<{ startOffset: number; endOffset: number }> = [];

  let match = pattern.exec(sourceText);
  while (match !== null) {
    // Find the end of this fence's line
    let lineEndOffset = sourceText.indexOf('\n', match.index);
    if (lineEndOffset === -1) {
      lineEndOffset = sourceText.length;
    }

    fencePositions.push({ startOffset: match.index, endOffset: lineEndOffset });
    match = pattern.exec(sourceText);
  }

  // Pair consecutive fences: first opens, second closes
  for (let pairIndex = 0; pairIndex + 1 < fencePositions.length; pairIndex += 2) {
    const openFence = fencePositions[pairIndex];
    const closeFence = fencePositions[pairIndex + 1];

    output.push({
      startOffset: openFence.startOffset,
      endOffset: closeFence.endOffset,
      zoneType,
    });
  }
}

/**
 * Each regex match is treated as an independent inert range (line-level or inline span).
 */
function collectMatchRanges(
  sourceText: string,
  patternTemplate: RegExp,
  zoneType: InertZoneType,
  output: InertRange[],
): void {
  const pattern = new RegExp(patternTemplate.source, patternTemplate.flags);

  let match = pattern.exec(sourceText);
  while (match !== null) {
    output.push({
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      zoneType,
    });
    match = pattern.exec(sourceText);
  }
}

// ============================================================
// Inert Zone Lookup for a Line
// ============================================================

/**
 * Checks if a line (given by absolute offsets) falls inside any inert range.
 * Returns the zone type if the line is fully contained, null otherwise.
 */
function findInertZoneForLine(
  lineStartOffset: number,
  lineEndOffset: number,
  inertRanges: InertRange[],
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
function extractLinePrefix(
  lineText: string,
): { linePrefix: string | null; linePrefixType: LinePrefixType } {
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
function splitSelectionIntoLines(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
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

// ============================================================
// Atomic Token Scanning
// ============================================================

/**
 * Scans the selected text for atomic tokens (embeds, wikilinks, etc.)
 * and returns non-overlapping protected ranges with offsets relative
 * to selectionStartOffset.
 */
function scanAtomicTokens(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
): ProtectedRange[] {
  const selectedText = sourceText.slice(selectionStartOffset, selectionEndOffset);
  const protectedRanges: ProtectedRange[] = [];

  for (let tokenIndex = 0; tokenIndex < ATOMIC_TOKEN_PATTERNS.length; tokenIndex++) {
    const { tokenType, pattern: patternTemplate } = ATOMIC_TOKEN_PATTERNS[tokenIndex];
    const pattern = new RegExp(patternTemplate.source, patternTemplate.flags);

    let match = pattern.exec(selectedText);
    while (match !== null) {
      const candidateStart = match.index;
      const candidateEnd = match.index + match[0].length;

      // Check overlap against all previously claimed ranges
      const overlapsExisting = protectedRanges.some(
        (existing) => candidateStart < existing.endOffset && candidateEnd > existing.startOffset,
      );

      if (!overlapsExisting) {
        protectedRanges.push({
          startOffset: candidateStart,
          endOffset: candidateEnd,
          tokenType: tokenType as ProtectedRange['tokenType'],
        });
      }

      match = pattern.exec(selectedText);
    }
  }

  return protectedRanges;
}

// ============================================================
// Main Export
// ============================================================

/**
 * Detects the structural context of a text selection: line prefixes,
 * inert zones, and atomic token ranges that must be preserved.
 */
export function detectStructureContext(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
): StructureContext {
  const inertRanges = buildInertRanges(sourceText);

  // Find absolute start of the first line containing the selection
  // (walk backward from selectionStartOffset to previous newline or start of text)
  let firstLineStart = selectionStartOffset;
  while (firstLineStart > 0 && sourceText[firstLineStart - 1] !== '\n') {
    firstLineStart--;
  }

  // Find absolute end of the last line containing the selection
  let lastLineEnd = selectionEndOffset;
  while (lastLineEnd < sourceText.length && sourceText[lastLineEnd] !== '\n') {
    lastLineEnd++;
  }

  // Split into lines using full line boundaries
  const lineRanges = splitSelectionIntoLines(sourceText, firstLineStart, lastLineEnd);

  const lines: LineStructureContext[] = [];

  for (let lineIndex = 0; lineIndex < lineRanges.length; lineIndex++) {
    const { lineStartOffset, lineEndOffset } = lineRanges[lineIndex];
    const lineText = sourceText.slice(lineStartOffset, lineEndOffset);

    const inertZone = findInertZoneForLine(lineStartOffset, lineEndOffset, inertRanges);

    const { linePrefix, linePrefixType } = extractLinePrefix(lineText);

    const prefixLength = linePrefix ? linePrefix.length : 0;
    const contentStartOffset = lineStartOffset + prefixLength;

    lines.push({
      lineStartOffset,
      lineEndOffset,
      linePrefix,
      linePrefixType,
      contentStartOffset,
      inertZone,
    });
  }

  const isFullyInert = lines.length > 0 && lines.every((line) => line.inertZone !== null);

  const protectedRanges = scanAtomicTokens(sourceText, selectionStartOffset, selectionEndOffset);

  return {
    lines,
    protectedRanges,
    isFullyInert,
  };
}
