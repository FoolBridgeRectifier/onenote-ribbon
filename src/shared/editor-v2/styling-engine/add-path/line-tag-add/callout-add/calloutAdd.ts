import type { StylingContext, StylingResult, TextReplacement } from '../../../interfaces';
import { lineBoundsAt, sortReplacementsLastToFirst } from '../../../helpers';
import { DEFAULT_CALLOUT_TYPE, NESTED_CALLOUT_TYPE } from '../../../constants';

/** Adds a callout to the selected lines (X15 nested when only the body is selected; remove when header is selected). */
export function processCalloutAdd(context: StylingContext, segments: Array<{ start: number; end: number }>): StylingResult {
  const firstBounds = lineBoundsAt(context.sourceText, segments[0].start);
  const firstLine = context.sourceText.slice(firstBounds.lineStart, firstBounds.lineEnd);

  const calloutHeaderMatch = /^>\s*\[!(\w+)\]\s?/.exec(firstLine);
  if (calloutHeaderMatch) {
    // Single-line selection confined to the header → REMOVE the marker (toggle off).
    // Multi-line selection (header + body) → NEST the callout (X15).
    const onlyHeaderLine = segments.length === 1 && segments[0].end <= firstBounds.lineEnd;
    if (onlyHeaderLine) {
      return removeCalloutMarker(firstBounds.lineStart, calloutHeaderMatch);
    }
    return processNestedCallout(context, firstBounds);
  }

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

/** Deletes only the `[!type] ` marker, preserving the quote prefix and text on the header line. */
function removeCalloutMarker(lineStart: number, headerMatch: RegExpExecArray): StylingResult {
  // headerMatch[0] is e.g. `> [!note] `; we keep the leading `> ` and drop the `[!type] ` payload.
  const leadingQuoteMatch = /^>\s*/.exec(headerMatch[0])!;
  const markerStart = lineStart + leadingQuoteMatch[0].length;
  const markerEnd = lineStart + headerMatch[0].length;
  return {
    replacements: [{ fromOffset: markerStart, toOffset: markerEnd, replacementText: '' }],
    isNoOp: false,
  };
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
    // X15 — nested callout header lives inside the parent callout, so it carries the parent's `> ` quote prefix.
    replacements.push({
      fromOffset: firstContentLineStart, toOffset: firstContentLineStart,
      replacementText: `> > [!${NESTED_CALLOUT_TYPE}]\n`,
    });
  }
  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
}
