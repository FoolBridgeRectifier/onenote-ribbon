import {
  CLOSING_TAG_PREFIX,
  HTML_TAG_PATTERN_FLAGS,
  HTML_TAG_PATTERN_SOURCE,
  MARKDOWN_TAG_PATTERN_DEFINITIONS,
  SELF_CLOSING_TAG_END_PATTERN,
  VOID_HTML_TAG_NAMES,
} from './constants';
import {
  CursorOrSelectionLocation,
  EnclosingHtmlTagFinder,
  HtmlTagRange,
  MarkdownTagPatternDefinition,
  OffsetRange,
  OpeningTagBoundary,
  TextIndex,
  TextPosition,
} from './interfaces';
import {
  buildTextIndex,
  positionToOffset,
} from '../text-offset/textOffset';

export type {
  CursorOrSelectionLocation,
  EnclosingHtmlTagFinder,
  HtmlTagRange,
  TextPosition,
} from './interfaces';

/**
 * Normalizes any two offsets into left-to-right order.
 */
function normalizeOffsets(
  firstOffset: number,
  secondOffset: number,
): OffsetRange {
  if (firstOffset <= secondOffset) {
    return {
      leftOffset: firstOffset,
      rightOffset: secondOffset,
    };
  }

  return {
    leftOffset: secondOffset,
    rightOffset: firstOffset,
  };
}

/**
 * Resolves cursor or selection inputs to a normalized offset range.
 *
 * Cursor queries become a zero-width range (leftOffset === rightOffset), while
 * selections are normalized so backward selections are handled consistently.
 */
function resolveLocationOffsets(
  location: CursorOrSelectionLocation,
  textIndex: TextIndex,
): OffsetRange {
  if ('cursorPosition' in location) {
    const cursorOffset = positionToOffset(location.cursorPosition, textIndex);

    return {
      leftOffset: cursorOffset,
      rightOffset: cursorOffset,
    };
  }

  const leftOffset = positionToOffset(location.leftPosition, textIndex);
  const rightOffset = positionToOffset(location.rightPosition, textIndex);

  return normalizeOffsets(leftOffset, rightOffset);
}

/**
 * Returns true when a parsed tag token is a closing tag (for example </sub>).
 */
function isClosingTag(fullTagText: string): boolean {
  return fullTagText.startsWith(CLOSING_TAG_PREFIX);
}

/**
 * Treats HTML void tags and explicit self-closing tags as non-enclosing,
 * because they do not have content ranges with matching close tags.
 */
function isSelfClosingTag(fullTagText: string, tagName: string): boolean {
  if (VOID_HTML_TAG_NAMES.has(tagName)) {
    return true;
  }

  return SELF_CLOSING_TAG_END_PATTERN.test(fullTagText);
}

/**
 * Finds the most recent opening tag with a matching name.
 *
 * The reverse scan mirrors normal stack pop behavior and preserves nested
 * matching from inner tags outwards.
 */
function findMatchingOpeningTagIndex(
  openingTagStack: OpeningTagBoundary[],
  tagName: string,
): number {
  for (
    let stackIndex = openingTagStack.length - 1;
    stackIndex >= 0;
    stackIndex -= 1
  ) {
    if (openingTagStack[stackIndex].tagName === tagName) {
      return stackIndex;
    }
  }

  return -1;
}

/**
 * Parses source text into opening/closing HTML tag ranges.
 *
 * This performs a single linear scan using a stack:
 * - opening tags are pushed
 * - closing tags pop the matching opening tag
 * - self-closing/void tags are ignored for enclosure checks
 *
 * Malformed nesting is tolerated by dropping skipped inner openings when a
 * later close tag matches an outer opening tag.
 */
export function buildHtmlTagRanges(sourceText: string): HtmlTagRange[] {
  // Build a fresh global pattern each call to avoid stale RegExp lastIndex state.
  const htmlTagPattern = new RegExp(
    HTML_TAG_PATTERN_SOURCE,
    HTML_TAG_PATTERN_FLAGS,
  );
  const openingTagStack: OpeningTagBoundary[] = [];
  const tagRanges: HtmlTagRange[] = [];

  let currentMatch: RegExpExecArray | null = null;

  while ((currentMatch = htmlTagPattern.exec(sourceText)) !== null) {
    const fullTagText = currentMatch[0];
    const tagName = currentMatch[1].toLowerCase();
    const tagStartOffset = currentMatch.index;
    const tagEndOffset = tagStartOffset + fullTagText.length;

    if (isClosingTag(fullTagText)) {
      const matchingOpeningTagIndex = findMatchingOpeningTagIndex(
        openingTagStack,
        tagName,
      );

      if (matchingOpeningTagIndex < 0) {
        continue;
      }

      // Drop malformed inner tags if the close tag skips expected nesting.
      const droppedOpeningTags = openingTagStack.splice(
        matchingOpeningTagIndex,
      );
      const matchingOpeningTag = droppedOpeningTags[0];

      tagRanges.push({
        tagName,
        openingTagStartOffset: matchingOpeningTag.openingTagStartOffset,
        openingTagEndOffset: matchingOpeningTag.openingTagEndOffset,
        closingTagStartOffset: tagStartOffset,
        closingTagEndOffset: tagEndOffset,
      });

      continue;
    }

    if (isSelfClosingTag(fullTagText, tagName)) {
      continue;
    }

    openingTagStack.push({
      tagName,
      openingTagStartOffset: tagStartOffset,
      openingTagEndOffset: tagEndOffset,
    });
  }

  return tagRanges.sort(
    (firstTagRange, secondTagRange) =>
      firstTagRange.openingTagStartOffset -
      secondTagRange.openingTagStartOffset,
  );
}

/**
 * Converts a markdown token match into the shared tag-range structure.
 */
function createMarkdownTagRange(
  markdownPatternDefinition: MarkdownTagPatternDefinition,
  currentMatch: RegExpExecArray,
): HtmlTagRange {
  const openingTagStartOffset = currentMatch.index;
  const openingTagEndOffset =
    openingTagStartOffset + markdownPatternDefinition.openingDelimiterLength;
  const closingTagEndOffset = currentMatch.index + currentMatch[0].length;
  const closingTagStartOffset =
    closingTagEndOffset - markdownPatternDefinition.closingDelimiterLength;

  return {
    tagName: markdownPatternDefinition.tagName,
    openingTagStartOffset,
    openingTagEndOffset,
    closingTagStartOffset,
    closingTagEndOffset,
  };
}

/**
 * Parses markdown inline wrappers (for example **bold**, _italic_, ~~strike~~)
 * into the same range model used for HTML tags.
 */
export function buildMarkdownTagRanges(sourceText: string): HtmlTagRange[] {
  const markdownTagRanges: HtmlTagRange[] = [];

  for (
    let patternDefinitionIndex = 0;
    patternDefinitionIndex < MARKDOWN_TAG_PATTERN_DEFINITIONS.length;
    patternDefinitionIndex += 1
  ) {
    const markdownPatternDefinition =
      MARKDOWN_TAG_PATTERN_DEFINITIONS[patternDefinitionIndex];
    const markdownPattern = new RegExp(
      markdownPatternDefinition.patternSource,
      markdownPatternDefinition.patternFlags,
    );

    let currentMatch: RegExpExecArray | null = null;

    while ((currentMatch = markdownPattern.exec(sourceText)) !== null) {
      markdownTagRanges.push(
        createMarkdownTagRange(markdownPatternDefinition, currentMatch),
      );
    }
  }

  return markdownTagRanges;
}

/**
 * Builds a unified list of HTML and Markdown tag ranges for a source snapshot.
 */
export function buildTagRanges(sourceText: string): HtmlTagRange[] {
  const htmlTagRanges = buildHtmlTagRanges(sourceText);
  const markdownTagRanges = buildMarkdownTagRanges(sourceText);

  return [...htmlTagRanges, ...markdownTagRanges].sort(
    (firstTagRange, secondTagRange) =>
      firstTagRange.openingTagStartOffset -
      secondTagRange.openingTagStartOffset,
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
  rightOffset: number,
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
export function createEnclosingHtmlTagFinder(
  sourceText: string,
): EnclosingHtmlTagFinder {
  const textIndex = buildTextIndex(sourceText);
  const tagRanges = buildTagRanges(sourceText);

  const getEnclosingTagRanges = (
    location: CursorOrSelectionLocation,
  ): HtmlTagRange[] => {
    const { leftOffset, rightOffset } = resolveLocationOffsets(
      location,
      textIndex,
    );

    return findEnclosingTagRanges(tagRanges, leftOffset, rightOffset);
  };

  const getEnclosingTagNames = (
    location: CursorOrSelectionLocation,
  ): string[] =>
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
  location: CursorOrSelectionLocation,
): string[] {
  return createEnclosingHtmlTagFinder(sourceText).getEnclosingTagNames(
    location,
  );
}
