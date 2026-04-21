import type { HtmlTagDefinition, StructureContext } from '../interfaces';
import type { HtmlTagRange } from '../../enclosing-html-tags/interfaces';
import { MARKDOWN_TO_HTML_TAG_MAP } from '../constants';
import {
  findEnclosingMatchingTag,
  findDelimiterInclusiveMatch,
} from '../shared-helpers/tag-geometry/TagGeometry';

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
  tagDefinition: HtmlTagDefinition
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
