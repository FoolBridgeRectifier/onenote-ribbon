import type { TextReplacement } from '../../interfaces';
import { scanProtectedTokensInLine } from '../../../detection-engine/protected-tokens/protectedTokens';

/**
 * Splits [start, end) into non-protected sub-ranges by skipping over any protected token
 * (wikilink, embed, mdLink, code, todo). Used to "punch out" inline tag wrapping (A10).
 */
export function findNonProtectedSegments(
  sourceText: string,
  start: number,
  end: number,
): Array<{ start: number; end: number }> {
  const lineStart = sourceText.lastIndexOf('\n', start - 1) + 1;
  const lineEndIdx = (() => {
    const newline = sourceText.indexOf('\n', end);
    return newline === -1 ? sourceText.length : newline;
  })();
  const lineText = sourceText.slice(lineStart, lineEndIdx);

  const protectedRanges = scanProtectedTokensInLine(lineText, lineStart, 0)
    .filter((range) => range.startOffset < end && range.endOffset > start);

  if (protectedRanges.length === 0) return [{ start, end }];

  const segments: Array<{ start: number; end: number }> = [];
  let cursor = start;
  for (const range of protectedRanges) {
    if (cursor < range.startOffset) {
      segments.push({ start: cursor, end: Math.min(range.startOffset, end) });
    }
    cursor = Math.max(cursor, range.endOffset);
  }
  if (cursor < end) segments.push({ start: cursor, end });

  return segments.filter((segment) => segment.start < segment.end);
}

/**
 * Trims whitespace at both ends of each segment using `sourceText` so that surrounding
 * spaces are not wrapped (e.g. `before [[link]]` → wrap "before", skip trailing space).
 */
export function trimSegmentWhitespace(
  sourceText: string,
  segments: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> {
  return segments
    .map((segment) => {
      let trimmedStart = segment.start;
      let trimmedEnd = segment.end;
      while (trimmedStart < trimmedEnd && /\s/.test(sourceText[trimmedStart])) trimmedStart++;
      while (trimmedEnd > trimmedStart && /\s/.test(sourceText[trimmedEnd - 1])) trimmedEnd--;
      return { start: trimmedStart, end: trimmedEnd };
    })
    .filter((segment) => segment.start < segment.end);
}

/**
 * Builds wrap replacements for every segment via `wrapBuilder`, returns them unsorted.
 * Caller is responsible for last-to-first sort.
 */
export function buildPunchOutReplacements(
  segments: Array<{ start: number; end: number }>,
  wrapBuilder: (start: number, end: number) => TextReplacement[],
): TextReplacement[] {
  const replacements: TextReplacement[] = [];
  for (const segment of segments) replacements.push(...wrapBuilder(segment.start, segment.end));
  return replacements;
}
