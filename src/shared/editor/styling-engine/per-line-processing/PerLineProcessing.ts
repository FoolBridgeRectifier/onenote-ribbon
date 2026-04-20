import type {
  TagDefinition,
  TextReplacement,
  StylingResult,
  StylingContext,
  StructureContext,
} from '../interfaces';
import type { HtmlTagRange } from '../../enclosing-html-tags/interfaces';
import { buildTagRanges } from '../../enclosing-html-tags/EnclosingHtmlTags';
import { sortReplacementsLastToFirst } from '../shared-helpers/SharedHelpers';
import {
  findEnclosingMatchingTag,
  findDelimiterInclusiveMatch,
} from '../shared-helpers/tag-geometry/TagGeometry';
import { MARKDOWN_TO_HTML_TAG_MAP } from '../constants';
/**
 * Determines if the selection spans multiple lines where at least one line
 * has a structural prefix (bullet, numbered, todo, heading, callout, etc.).
 */
export function shouldProcessPerLine(structureContext: StructureContext): boolean {
  if (structureContext.lines.length <= 1) return false;
  return structureContext.lines.some(
    (line) => line.linePrefixType !== 'none' && line.inertZone === null
  );
}

/**
 * Computes the effective content range for each line that intersects the selection.
 * Each range starts after the line prefix (or at the selection start, whichever is later).
 */
export function buildEffectiveLineRanges(
  structureContext: StructureContext,
  selectionStartOffset: number,
  selectionEndOffset: number
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];

  for (const line of structureContext.lines) {
    if (line.inertZone !== null) continue;

    const effectiveStart = Math.max(selectionStartOffset, line.contentStartOffset);
    const effectiveEnd = Math.min(selectionEndOffset, line.lineEndOffset);
    if (effectiveStart >= effectiveEnd) continue;
    ranges.push({ start: effectiveStart, end: effectiveEnd });
  }

  return ranges;
}

/**
 * Checks whether the given content range has a matching formatting tag,
 * including HTML equivalents for markdown tags.
 */
export function lineHasMatchingTag(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  rangeStart: number,
  rangeEnd: number,
  tagDefinition: TagDefinition
): boolean {
  if (
    findEnclosingMatchingTag(allTagRanges, sourceText, rangeStart, rangeEnd, tagDefinition) !== null
  )
    return true;
  if (
    findDelimiterInclusiveMatch(allTagRanges, sourceText, rangeStart, rangeEnd, tagDefinition) !==
    null
  )
    return true;

  if (tagDefinition.domain === 'markdown') {
    const htmlEquivalent = MARKDOWN_TO_HTML_TAG_MAP.get(tagDefinition.tagName);

    if (htmlEquivalent) {
      if (
        findEnclosingMatchingTag(allTagRanges, sourceText, rangeStart, rangeEnd, htmlEquivalent) !==
        null
      )
        return true;
      if (
        findDelimiterInclusiveMatch(
          allTagRanges,
          sourceText,
          rangeStart,
          rangeEnd,
          htmlEquivalent
        ) !== null
      )
        return true;
    }
  }

  return false;
}

/** for multi-line structured selections.
 * If ALL lines have the tag → removes from all. Otherwise → adds to lines missing it.
 * Takes toggleTag and addTag as parameters to avoid circular dependencies.
 */
export function toggleTagPerLine(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  structureContext: StructureContext,
  toggleTagFn: (context: StylingContext, tagDefinition: TagDefinition) => StylingResult,
  addTagFn: (context: StylingContext, tagDefinition: TagDefinition) => StylingResult
): StylingResult {
  const lineRanges = buildEffectiveLineRanges(
    structureContext,
    selectionStartOffset,
    selectionEndOffset
  );
  if (lineRanges.length === 0) return { replacements: [], isNoOp: true };

  const allTagRanges = buildTagRanges(sourceText);
  const tagPresent = lineRanges.map((range) =>
    lineHasMatchingTag(allTagRanges, sourceText, range.start, range.end, tagDefinition)
  );

  const allHaveTag = tagPresent.every(Boolean);
  const allReplacements: TextReplacement[] = [];

  if (allHaveTag) {
    for (const range of lineRanges) {
      const lineContext: StylingContext = {
        sourceText,
        selectionStartOffset: range.start,
        selectionEndOffset: range.end,
        selectedText: sourceText.slice(range.start, range.end),
      };
      const result = toggleTagFn(lineContext, tagDefinition);
      if (!result.isNoOp) allReplacements.push(...result.replacements);
    }
  } else {
    for (let lineIndex = 0; lineIndex < lineRanges.length; lineIndex++) {
      if (tagPresent[lineIndex]) continue;
      const range = lineRanges[lineIndex];
      const lineContext: StylingContext = {
        sourceText,
        selectionStartOffset: range.start,
        selectionEndOffset: range.end,
        selectedText: sourceText.slice(range.start, range.end),
      };
      const result = addTagFn(lineContext, tagDefinition);
      if (!result.isNoOp) allReplacements.push(...result.replacements);
    }
  }

  return {
    replacements: sortReplacementsLastToFirst(allReplacements),
    isNoOp: allReplacements.length === 0,
  };
}

/**
 * Adds a formatting tag per-line for multi-line structured selections.
 * Takes addTag as a parameter to avoid circular dependencies.
 */
export function addTagPerLine(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  structureContext: StructureContext,
  addTagFn: (context: StylingContext, tagDefinition: TagDefinition) => StylingResult
): StylingResult {
  const lineRanges = buildEffectiveLineRanges(
    structureContext,
    selectionStartOffset,
    selectionEndOffset
  );
  if (lineRanges.length === 0) return { replacements: [], isNoOp: true };

  const allReplacements: TextReplacement[] = [];

  for (const range of lineRanges) {
    const lineContext: StylingContext = {
      sourceText,
      selectionStartOffset: range.start,
      selectionEndOffset: range.end,
      selectedText: sourceText.slice(range.start, range.end),
    };
    const result = addTagFn(lineContext, tagDefinition);
    if (!result.isNoOp) allReplacements.push(...result.replacements);
  }

  return {
    replacements: sortReplacementsLastToFirst(allReplacements),
    isNoOp: allReplacements.length === 0,
  };
}
