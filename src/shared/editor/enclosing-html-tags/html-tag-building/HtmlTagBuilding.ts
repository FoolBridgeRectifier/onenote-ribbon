import {
  CLOSING_TAG_PREFIX,
  HTML_TAG_PATTERN_FLAGS,
  HTML_TAG_PATTERN_SOURCE,
  SELF_CLOSING_TAG_END_PATTERN,
  VOID_HTML_TAG_NAMES,
} from '../constants';
import type { HtmlTagRange, OpeningTagBoundary } from '../interfaces';

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
  tagName: string
): number {
  for (let stackIndex = openingTagStack.length - 1; stackIndex >= 0; stackIndex -= 1) {
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
  const htmlTagPattern = new RegExp(HTML_TAG_PATTERN_SOURCE, HTML_TAG_PATTERN_FLAGS);
  const openingTagStack: OpeningTagBoundary[] = [];
  const tagRanges: HtmlTagRange[] = [];

  let currentMatch: RegExpExecArray | null;

  while ((currentMatch = htmlTagPattern.exec(sourceText)) !== null) {
    const fullTagText = currentMatch[0];
    const tagName = currentMatch[1].toLowerCase();
    const tagStartOffset = currentMatch.index;
    const tagEndOffset = tagStartOffset + fullTagText.length;

    if (isClosingTag(fullTagText)) {
      const matchingOpeningTagIndex = findMatchingOpeningTagIndex(openingTagStack, tagName);

      if (matchingOpeningTagIndex < 0) {
        continue;
      }

      // Drop malformed inner tags if the close tag skips expected nesting.
      const droppedOpeningTags = openingTagStack.splice(matchingOpeningTagIndex);
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
      firstTagRange.openingTagStartOffset - secondTagRange.openingTagStartOffset
  );
}
