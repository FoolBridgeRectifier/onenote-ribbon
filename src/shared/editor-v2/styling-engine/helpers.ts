import type { StylingContext, TextReplacement } from './interfaces';

export function selectAll(sourceText: string): StylingContext {
  return { sourceText, selectionStartOffset: 0, selectionEndOffset: sourceText.length };
}

export function selectRange(sourceText: string, start: number, end: number): StylingContext {
  return { sourceText, selectionStartOffset: start, selectionEndOffset: end };
}

/** Apply last-to-first replacements to produce the final output string. */
export function applyReplacements(sourceText: string, replacements: TextReplacement[]): string {
  let result = sourceText;

  for (const rep of replacements)
    result = result.slice(0, rep.fromOffset) + rep.replacementText + result.slice(rep.toOffset);

  return result;
}

/** Sort replacements last-to-first by fromOffset (descending) so they apply without offset drift. */
export function sortReplacementsLastToFirst(replacements: TextReplacement[]): TextReplacement[] {
  return [...replacements].sort((left, right) => right.fromOffset - left.fromOffset);
}

/** Returns the [lineStartOffset, lineEndOffset] for the line containing absolute `offset`. */
export function lineBoundsAt(sourceText: string, offset: number): { lineStart: number; lineEnd: number; lineIndex: number } {
  let lineStart = 0;
  let lineIndex = 0;
  for (let i = 0; i < offset && i < sourceText.length; i++) {
    if (sourceText[i] === '\n') { lineStart = i + 1; lineIndex++; }
  }
  let lineEnd = lineStart;
  while (lineEnd < sourceText.length && sourceText[lineEnd] !== '\n') lineEnd++;
  return { lineStart, lineEnd, lineIndex };
}

/** Splits the selection range into per-line absolute [start,end] segments. */
export function splitSelectionByLine(sourceText: string, startOffset: number, endOffset: number): Array<{ start: number; end: number }> {
  const segments: Array<{ start: number; end: number }> = [];
  let cursor = startOffset;
  while (cursor < endOffset) {
    const newline = sourceText.indexOf('\n', cursor);
    const segmentEnd = newline === -1 || newline >= endOffset ? endOffset : newline;
    segments.push({ start: cursor, end: segmentEnd });
    cursor = segmentEnd + 1;
  }
  return segments;
}
