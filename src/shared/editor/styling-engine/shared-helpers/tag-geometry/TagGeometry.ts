import type { TagDefinition } from '../../interfaces';
import type { HtmlTagRange } from '../../../enclosing-html-tags/interfaces';
import { extractStylePropertyFromOpeningTag } from '../../tag-manipulation/style-parsing/StyleParsing';
/** Comparator: sorts tag ranges by content width (inner-to-outer). */
export function compareByContentWidth(rangeA: HtmlTagRange, rangeB: HtmlTagRange): number {
  const widthA = rangeA.closingTagStartOffset - rangeA.openingTagEndOffset;
  const widthB = rangeB.closingTagStartOffset - rangeB.openingTagEndOffset;
  return widthA - widthB;
}

/** Checks if a tag range fully encloses the given selection (inclusive boundaries). */
export function tagEnclosesSelection(
  tagRange: HtmlTagRange,
  selectionStartOffset: number,
  selectionEndOffset: number
): boolean {
  return (
    tagRange.openingTagEndOffset <= selectionStartOffset &&
    tagRange.closingTagStartOffset >= selectionEndOffset
  );
}

/**
 * Checks if a tag range's full span (opening start to closing end)
 * is contained within or exactly matches the selection.
 */
export function tagSpanIsWithinSelection(
  tagRange: HtmlTagRange,
  selectionStartOffset: number,
  selectionEndOffset: number
): boolean {
  return (
    tagRange.openingTagStartOffset >= selectionStartOffset &&
    tagRange.closingTagEndOffset <= selectionEndOffset
  );
}

/**
 * Filters tag ranges by a geometry predicate and tag definition match.
 * For span tags with attributes, also checks the CSS property name.
 */
export function filterMatchingTagRanges(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  tagDefinition: TagDefinition,
  geometryPredicate: (tagRange: HtmlTagRange) => boolean
): HtmlTagRange[] {
  const isSpanWithAttributes =
    tagDefinition.tagName === 'span' && tagDefinition.attributes !== undefined;
  const matchingRanges: HtmlTagRange[] = [];

  for (const tagRange of allTagRanges) {
    if (!geometryPredicate(tagRange)) continue;

    if (!isSpanWithAttributes) {
      if (tagRange.tagName === tagDefinition.tagName) matchingRanges.push(tagRange);
      continue;
    }

    if (tagRange.tagName !== 'span') continue;

    const openingTagText = sourceText.slice(
      tagRange.openingTagStartOffset,
      tagRange.openingTagEndOffset
    );
    const extracted = extractStylePropertyFromOpeningTag(openingTagText);
    if (extracted === null) continue;

    const targetPropertyName = Object.keys(tagDefinition.attributes!)[0];
    if (extracted.propertyName === targetPropertyName) matchingRanges.push(tagRange);
  }

  return matchingRanges;
}

/** Filters tag ranges by a geometry predicate, returning matches sorted inner-to-outer. */
export function filterTagRangesByGeometry(
  allTagRanges: HtmlTagRange[],
  geometryPredicate: (tagRange: HtmlTagRange) => boolean
): HtmlTagRange[] {
  const matchingRanges = allTagRanges.filter(geometryPredicate);
  matchingRanges.sort(compareByContentWidth);
  return matchingRanges;
}

/**
 * Finds the outermost tag range whose full span falls within the selection.
 * Used for delimiter-inclusive selections like selecting `<u>text</u>`.
 */
export function findDelimiterInclusiveMatch(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition
): HtmlTagRange | null {
  const matchingRanges = filterMatchingTagRanges(
    allTagRanges,
    sourceText,
    tagDefinition,
    (tagRange) => tagSpanIsWithinSelection(tagRange, selectionStartOffset, selectionEndOffset)
  );

  if (matchingRanges.length === 0) return null;

  // Return the outermost match (largest full span)
  return matchingRanges.reduce((outermost, candidate) => {
    const candidateSpan = candidate.closingTagEndOffset - candidate.openingTagStartOffset;
    const outermostSpan = outermost.closingTagEndOffset - outermost.openingTagStartOffset;
    return candidateSpan > outermostSpan ? candidate : outermost;
  });
}

/** Finds the innermost tag range that encloses the selection and matches the tag definition. */
export function findEnclosingMatchingTag(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition
): HtmlTagRange | null {
  const matchingRanges = filterMatchingTagRanges(
    allTagRanges,
    sourceText,
    tagDefinition,
    (tagRange) => tagEnclosesSelection(tagRange, selectionStartOffset, selectionEndOffset)
  );

  if (matchingRanges.length === 0) return null;

  // Return the innermost match (smallest content span)
  return matchingRanges.reduce((innermost, candidate) => {
    const candidateWidth = candidate.closingTagStartOffset - candidate.openingTagEndOffset;
    const innermostWidth = innermost.closingTagStartOffset - innermost.openingTagEndOffset;
    return candidateWidth < innermostWidth ? candidate : innermost;
  });
}
export function findAllEnclosingTags(
  allTagRanges: HtmlTagRange[],
  selectionStartOffset: number,
  selectionEndOffset: number
): HtmlTagRange[] {
  return filterTagRangesByGeometry(allTagRanges, (tagRange) =>
    tagEnclosesSelection(tagRange, selectionStartOffset, selectionEndOffset)
  );
}

/** Finds all tag ranges whose full span falls within the selection, sorted inner-to-outer. */
export function findAllTagsWithinSelection(
  allTagRanges: HtmlTagRange[],
  selectionStartOffset: number,
  selectionEndOffset: number
): HtmlTagRange[] {
  return filterTagRangesByGeometry(allTagRanges, (tagRange) =>
    tagSpanIsWithinSelection(tagRange, selectionStartOffset, selectionEndOffset)
  );
}
