import type { LineStructureContext, ProtectedRange, StructureContext } from '../interfaces';

import { ATOMIC_TOKEN_PATTERNS } from './constants';
import { buildInertRanges } from './inert-ranges/InertRanges';
import {
  findInertZoneForLine,
  extractLinePrefix,
  splitSelectionIntoLines,
} from './line-analysis/LineAnalysis';

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
  selectionEndOffset: number
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
        (existing) => candidateStart < existing.endOffset && candidateEnd > existing.startOffset
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
  selectionEndOffset: number
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
