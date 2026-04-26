import type { TagDefinition, StylingResult, TextReplacement } from '../../../interfaces';
import { sortReplacementsLastToFirst } from '../../../helpers';
import { getMdDelimiter } from '../helpers';
import { scanProtectedTokensInLine } from '../../../../detection-engine/protected-tokens/protectedTokens';

/**
 * For A7/A9: detects same-type MD delimiters that touch / are inside [start, end].
 * Returns merged-region replacements when found, null when no boundary tokens exist.
 */
export function tryMergeOrExtendMd(sourceText: string, start: number, end: number, tagDefinition: TagDefinition): StylingResult | null {
  const delim = getMdDelimiter(tagDefinition);
  if (!delim) return null;

  const lineStart = sourceText.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = (() => {
    const newline = sourceText.indexOf('\n', end);
    return newline === -1 ? sourceText.length : newline;
  })();
  const delimiterPositions = findAllDelimiterPositions(sourceText, lineStart, lineEnd, delim);

  // Pair them as open/close in document order.
  const pairs: Array<{ openStart: number; openEnd: number; closeStart: number; closeEnd: number }> = [];
  for (let index = 0; index + 1 < delimiterPositions.length; index += 2) {
    const openPos = delimiterPositions[index];
    const closePos = delimiterPositions[index + 1];
    pairs.push({
      openStart: openPos, openEnd: openPos + delim.length,
      closeStart: closePos, closeEnd: closePos + delim.length,
    });
  }

  // Candidate pairs touching/overlapping the selection.
  const candidates = pairs.filter((pair) => pair.openStart <= end && pair.closeEnd >= start);
  if (candidates.length === 0) return null;

  const minBound = Math.min(start, candidates[0].openStart);
  const maxBound = Math.max(end, candidates[candidates.length - 1].closeEnd);
  const tokensInBox = delimiterPositions.filter((pos) => pos >= minBound && pos + delim.length <= maxBound);

  if (isSelectionFullyCoveredByPairs(sourceText, start, end, candidates)) {
    // A9 full: delete every same-type delimiter in box.
    const replacements = tokensInBox.map((pos) => ({
      fromOffset: pos, toOffset: pos + delim.length, replacementText: '',
    }));
    return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
  }

  return buildMergeReplacements(tokensInBox, minBound, maxBound, delim);
}

/** Builds replacements for the merge/extend path: keep boundary delims, delete interior, insert missing. */
function buildMergeReplacements(tokensInBox: number[], minBound: number, maxBound: number, delim: string): StylingResult {
  const replacements: TextReplacement[] = [];
  const hasMinDelim = tokensInBox[0] === minBound;
  const lastToken = tokensInBox[tokensInBox.length - 1];
  const hasMaxDelim = lastToken !== undefined && lastToken + delim.length === maxBound;

  for (const pos of tokensInBox) {
    if (pos === minBound && hasMinDelim) continue;
    if (pos === maxBound - delim.length && hasMaxDelim) continue;
    replacements.push({ fromOffset: pos, toOffset: pos + delim.length, replacementText: '' });
  }
  if (!hasMinDelim) replacements.push({ fromOffset: minBound, toOffset: minBound, replacementText: delim });
  if (!hasMaxDelim) replacements.push({ fromOffset: maxBound, toOffset: maxBound, replacementText: delim });

  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: false };
}

function findAllDelimiterPositions(sourceText: string, lineStart: number, lineEnd: number, delim: string): number[] {
  const positions: number[] = [];
  let cursor = lineStart;
  while (cursor < lineEnd) {
    const found = sourceText.indexOf(delim, cursor);
    if (found === -1 || found >= lineEnd) break;
    positions.push(found);
    cursor = found + delim.length;
  }
  return positions;
}

/** Returns true when every non-whitespace, non-delimiter char in selection sits inside a candidate pair OR a protected range. */
function isSelectionFullyCoveredByPairs(
  sourceText: string, start: number, end: number,
  pairs: Array<{ openStart: number; openEnd: number; closeStart: number; closeEnd: number }>,
): boolean {
  // Pre-compute protected ranges across the selection's lines (wikilinks, embeds, code spans, etc.).
  const protectedRanges = collectProtectedRangesAcrossSelection(sourceText, start, end);

  for (let pos = start; pos < end; pos++) {
    const ch = sourceText[pos];
    if (/\s/.test(ch)) continue;
    const isInDelim = pairs.some((pair) =>
      (pos >= pair.openStart && pos < pair.openEnd) ||
      (pos >= pair.closeStart && pos < pair.closeEnd));
    if (isInDelim) continue;
    const insideContent = pairs.some((pair) => pos >= pair.openEnd && pos < pair.closeStart);
    if (insideContent) continue;
    const insideProtected = protectedRanges.some((range) => pos >= range.start && pos < range.end);
    if (insideProtected) continue;
    return false;
  }
  return true;
}

/** Walks each line touched by [start, end] and accumulates protected token ranges as absolute offsets. */
function collectProtectedRangesAcrossSelection(sourceText: string, start: number, end: number): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  let lineStartOffset = sourceText.lastIndexOf('\n', start - 1) + 1;
  let lineIndex = sourceText.slice(0, lineStartOffset).split('\n').length - 1;

  while (lineStartOffset < end) {
    const newlineOffset = sourceText.indexOf('\n', lineStartOffset);
    const lineEndOffset = newlineOffset === -1 ? sourceText.length : newlineOffset;
    const lineText = sourceText.slice(lineStartOffset, lineEndOffset);
    const found = scanProtectedTokensInLine(lineText, lineStartOffset, lineIndex);
    for (const protectedRange of found) {
      ranges.push({ start: protectedRange.startOffset, end: protectedRange.endOffset });
    }
    lineStartOffset = lineEndOffset + 1;
    lineIndex += 1;
  }
  return ranges;
}
