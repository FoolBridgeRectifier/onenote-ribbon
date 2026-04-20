import type { InertZoneType, InertRange } from '../../interfaces';
import {
  CODE_FENCE_PATTERN,
  MATH_FENCE_PATTERN,
  TABLE_LINE_PATTERN,
  HORIZONTAL_RULE_PATTERN,
  INLINE_MATH_PATTERN,
  INLINE_CODE_PATTERN,
} from '../constants';

// ============================================================
// Inert Zone Scanning
// ============================================================

/**
 * Scans the full source text and builds a list of absolute offset ranges
 * that are considered inert (code blocks, math blocks, tables,
 * horizontal rules, inline math, inline code).
 */
export function buildInertRanges(sourceText: string): InertRange[] {
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
  output: InertRange[]
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
  output: InertRange[]
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
