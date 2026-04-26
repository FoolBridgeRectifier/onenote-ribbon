import type { TagDefinition, StylingContext, StylingResult, TextReplacement } from '../../interfaces';
import { sortReplacementsLastToFirst, splitSelectionByLine, lineBoundsAt } from '../../helpers';
import { processInlineAdd } from '../inline-add/inlineAdd';
import { isMarkdownTag, getMdDelimiter } from '../inline-add/helpers';

/**
 * Multi-line inline add (A11/A12/A17).
 * - A11: none tagged → wrap each line.
 * - A12: mixed → wrap only untagged lines.
 * - A17: per-line wrapping skips the line prefix automatically (delegated to processInlineAdd).
 */
export function processMultiLineAdd(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  const segments = splitSelectionByLine(context.sourceText, context.selectionStartOffset, context.selectionEndOffset);

  // Per-line classification: determine which lines are already tagged with this tag.
  const lineStates = segments.map((segment) => ({
    segment,
    isTagged: isLineAlreadyTagged(context.sourceText, segment.start, segment.end, tagDefinition),
  }));

  const allTagged = lineStates.every((state) => state.isTagged);
  const anyTagged = lineStates.some((state) => state.isTagged);
  const replacements: TextReplacement[] = [];

  for (const state of lineStates) {
    if (state.isTagged) {
      // R14/R15: emit removal of the surrounding MD delimiters from this tagged line.
      replacements.push(...buildLineRemoval(context.sourceText, state.segment, tagDefinition));
      continue;
    }

    // Skip untagged lines in toggle-off mode (R15 mixed: remove from tagged, leave untagged untouched).
    if (anyTagged) continue;
    if (allTagged) continue;

    // Compute trimmed segment (skip leading whitespace inside line).
    const trimmedSegment = trimSegmentToContent(context.sourceText, state.segment);
    if (trimmedSegment.start >= trimmedSegment.end) continue;
    const subContext: StylingContext = {
      sourceText: context.sourceText,
      selectionStartOffset: trimmedSegment.start,
      selectionEndOffset: trimmedSegment.end,
    };
    const subResult = processInlineAdd(subContext, tagDefinition);
    replacements.push(...subResult.replacements);
  }

  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
}

/** R14/R15 helper: deletes the surrounding MD delimiters of a tagged line segment. */
function buildLineRemoval(sourceText: string, segment: { start: number; end: number }, tagDefinition: TagDefinition): TextReplacement[] {
  const delim = getMdDelimiter(tagDefinition);
  if (!delim) return [];
  const bounds = lineBoundsAt(sourceText, segment.start);
  const lineText = sourceText.slice(bounds.lineStart, bounds.lineEnd);
  const prefixLength = computePrefixLength(lineText);
  const contentStart = bounds.lineStart + prefixLength;
  const contentEnd = bounds.lineEnd;

  if (!lineText.slice(prefixLength).startsWith(delim)) return [];
  if (!lineText.slice(prefixLength).endsWith(delim)) return [];

  return [
    { fromOffset: contentEnd - delim.length, toOffset: contentEnd, replacementText: '' },
    { fromOffset: contentStart, toOffset: contentStart + delim.length, replacementText: '' },
  ];
}

/** Returns true when the line at [segmentStart, segmentEnd] is already wrapped with the tag. */
function isLineAlreadyTagged(sourceText: string, segmentStart: number, segmentEnd: number, tagDefinition: TagDefinition): boolean {
  if (!isMarkdownTag(tagDefinition)) return false;
  const delim = getMdDelimiter(tagDefinition);
  if (!delim) return false;
  // Skip leading line prefix.
  const bounds = lineBoundsAt(sourceText, segmentStart);
  const lineText = sourceText.slice(bounds.lineStart, bounds.lineEnd);
  const prefixLength = computePrefixLength(lineText);
  const content = lineText.slice(prefixLength);
  return content.startsWith(delim) && content.endsWith(delim) && content.length > delim.length * 2;
}

/** Trims leading line prefix from a per-line segment so wrap targets only the content. */
function trimSegmentToContent(sourceText: string, segment: { start: number; end: number }): { start: number; end: number } {
  const bounds = lineBoundsAt(sourceText, segment.start);
  const lineText = sourceText.slice(bounds.lineStart, bounds.lineEnd);
  const prefixLength = computePrefixLength(lineText);
  const contentStart = bounds.lineStart + prefixLength;
  return { start: Math.max(segment.start, contentStart), end: segment.end };
}

function computePrefixLength(lineText: string): number {
  const checkbox = /^- \[ ?\] /.exec(lineText);
  if (checkbox) return checkbox[0].length;
  const callout = /^> \[![^\]]+\]\s?/.exec(lineText);
  if (callout) return callout[0].length;
  const heading = /^(?:>\s)?#{1,6}\s/.exec(lineText);
  if (heading) return heading[0].length;
  const list = /^(?:>\s)?- /.exec(lineText);
  if (list) return list[0].length;
  const quote = /^>\s/.exec(lineText);
  if (quote) return quote[0].length;
  return 0;
}
