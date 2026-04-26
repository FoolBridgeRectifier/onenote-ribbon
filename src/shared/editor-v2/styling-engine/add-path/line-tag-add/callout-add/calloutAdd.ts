import type { StylingContext, StylingResult, TextReplacement } from '../../../interfaces';
import { lineBoundsAt, sortReplacementsLastToFirst } from '../../../helpers';
import { DEFAULT_CALLOUT_TYPE, NESTED_CALLOUT_TYPE } from '../../../constants';

/** Adds a callout to the selected lines (X15 nested when an existing callout is selected). */
export function processCalloutAdd(context: StylingContext, segments: Array<{ start: number; end: number }>): StylingResult {
  const firstBounds = lineBoundsAt(context.sourceText, segments[0].start);
  const firstLine = context.sourceText.slice(firstBounds.lineStart, firstBounds.lineEnd);

  const calloutHeaderMatch = /^>\s*\[!(\w+)\]/.exec(firstLine);
  if (calloutHeaderMatch) return processNestedCallout(context, firstBounds);

  const replacements: TextReplacement[] = [];
  for (const segment of segments) {
    const bounds = lineBoundsAt(context.sourceText, segment.start);
    replacements.push({ fromOffset: bounds.lineStart, toOffset: bounds.lineStart, replacementText: '> ' });
  }
  replacements.push({
    fromOffset: firstBounds.lineStart, toOffset: firstBounds.lineStart,
    replacementText: `> [!${DEFAULT_CALLOUT_TYPE}]\n`,
  });
  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: false };
}

function processNestedCallout(context: StylingContext, headerBounds: { lineStart: number; lineEnd: number }): StylingResult {
  const replacements: TextReplacement[] = [];
  let cursor = headerBounds.lineEnd + 1;
  let firstContentLineStart: number | null = null;

  while (cursor < context.sourceText.length) {
    const lineBounds = lineBoundsAt(context.sourceText, cursor);
    const lineText = context.sourceText.slice(lineBounds.lineStart, lineBounds.lineEnd);
    if (firstContentLineStart === null) firstContentLineStart = lineBounds.lineStart;
    if (lineText.startsWith('> ')) {
      replacements.push({ fromOffset: lineBounds.lineStart, toOffset: lineBounds.lineStart, replacementText: '> ' });
    }
    cursor = lineBounds.lineEnd + 1;
    if (lineBounds.lineEnd >= context.sourceText.length - 1) break;
  }

  if (firstContentLineStart !== null) {
    replacements.push({
      fromOffset: firstContentLineStart, toOffset: firstContentLineStart,
      replacementText: `> [!${NESTED_CALLOUT_TYPE}]\n`,
    });
  }
  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
}
