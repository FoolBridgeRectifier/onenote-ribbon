import type { ProtectedRange } from '../interfaces';
import { PROTECTED_TOKEN_RECOGNISERS } from '../constants';

/**
 * Scans the slice of text [startOffset, endOffset) on `lineIndex` for protected
 * tokens. Returns ProtectedRange entries with absolute character offsets across
 * the document, computed from `lineStartOffset` (offset where the line begins).
 *
 * Overlapping matches are pruned: if two patterns match at overlapping positions
 * the earlier one in `PROTECTED_TOKEN_RECOGNISERS` wins.
 */
export function scanProtectedTokensInLine(
  line: string,
  lineStartOffset: number,
  scanStartCh: number
): ProtectedRange[] {
  const results: ProtectedRange[] = [];

  for (const { pattern, tokenType } of PROTECTED_TOKEN_RECOGNISERS) {
    pattern.lastIndex = scanStartCh;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const startCh = match.index;
      const endCh = startCh + match[0].length;

      // Skip if this match overlaps an already-claimed range.
      const overlaps = results.some(
        (range) =>
          (startCh + lineStartOffset) < range.endOffset &&
          (endCh + lineStartOffset) > range.startOffset,
      );
      if (overlaps) continue;

      results.push({
        startOffset: lineStartOffset + startCh,
        endOffset: lineStartOffset + endCh,
        tokenType,
      });
    }
  }

  // Sort by start offset for stable, predictable ordering.
  results.sort((leftRange, rightRange) => leftRange.startOffset - rightRange.startOffset);
  return results;
}
