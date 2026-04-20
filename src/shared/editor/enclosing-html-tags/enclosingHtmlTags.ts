import type { CursorOrSelectionLocation, EnclosingHtmlTagFinder, HtmlTagRange } from './interfaces';
import { buildTextIndex } from '../text-offset/TextOffset';
import { buildHtmlTagRanges } from './html-tag-building/HtmlTagBuilding';
import { buildMarkdownTagRanges } from './markdown-tag-building/MarkdownTagBuilding';
import { resolveLocationOffsets } from './location-resolution/LocationResolution';

export type {
  CursorOrSelectionLocation,
  EnclosingHtmlTagFinder,
  HtmlTagRange,
  TextPosition,
} from './interfaces';

/**
 * Builds a unified list of HTML and Markdown tag ranges for a source snapshot.
 */
export function buildTagRanges(sourceText: string): HtmlTagRange[] {
  const htmlTagRanges = buildHtmlTagRanges(sourceText);
  const markdownTagRanges = buildMarkdownTagRanges(sourceText);

  return [...htmlTagRanges, ...markdownTagRanges].sort(
    (firstTagRange, secondTagRange) =>
      firstTagRange.openingTagStartOffset - secondTagRange.openingTagStartOffset
  );
}

/**
 * Returns all tag ranges that fully enclose [leftOffset, rightOffset].
 *
 * A range encloses the query when:
 * - its opening tag ends at/before leftOffset
 * - its closing tag starts at/after rightOffset
 *
 * Results are returned inner-to-outer to match expected formatting precedence.
 */
function findEnclosingTagRanges(
  tagRanges: HtmlTagRange[],
  leftOffset: number,
  rightOffset: number
): HtmlTagRange[] {
  const enclosingTagRanges: HtmlTagRange[] = [];

  for (let rangeIndex = 0; rangeIndex < tagRanges.length; rangeIndex += 1) {
    const tagRange = tagRanges[rangeIndex];
    const startsBeforeOrAtLeft = tagRange.openingTagEndOffset <= leftOffset;
    const endsAfterOrAtRight = tagRange.closingTagStartOffset >= rightOffset;

    if (startsBeforeOrAtLeft && endsAfterOrAtRight) {
      enclosingTagRanges.push(tagRange);
    }
  }

  return enclosingTagRanges.reverse();
}

/**
 * Creates a reusable finder for a specific sourceText snapshot.
 *
 * Recommended usage for performance-sensitive cursor-change flows:
 * 1) Build once per content snapshot
 * 2) Reuse returned methods for all cursor/selection queries
 */
export function createEnclosingHtmlTagFinder(sourceText: string): EnclosingHtmlTagFinder {
  const textIndex = buildTextIndex(sourceText);
  const tagRanges = buildTagRanges(sourceText);

  const getEnclosingTagRanges = (location: CursorOrSelectionLocation): HtmlTagRange[] => {
    const { leftOffset, rightOffset } = resolveLocationOffsets(location, textIndex);

    return findEnclosingTagRanges(tagRanges, leftOffset, rightOffset);
  };

  const getEnclosingTagNames = (location: CursorOrSelectionLocation): string[] =>
    getEnclosingTagRanges(location).map((tagRange) => tagRange.tagName);

  return {
    getEnclosingTagRanges,
    getEnclosingTagNames,
  };
}

/**
 * Convenience one-shot helper when reuse is not needed.
 *
 * For hot paths, prefer createEnclosingHtmlTagFinder and reuse the finder.
 */
export function getEnclosingHtmlTagNames(
  sourceText: string,
  location: CursorOrSelectionLocation
): string[] {
  return createEnclosingHtmlTagFinder(sourceText).getEnclosingTagNames(location);
}
