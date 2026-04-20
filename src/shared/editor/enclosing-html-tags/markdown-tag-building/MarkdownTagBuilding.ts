import { MARKDOWN_TAG_PATTERN_DEFINITIONS } from '../constants';
import type { HtmlTagRange, MarkdownTagPatternDefinition } from '../interfaces';

/**
 * Converts a markdown token match into the shared tag-range structure.
 */
function createMarkdownTagRange(
  markdownPatternDefinition: MarkdownTagPatternDefinition,
  currentMatch: RegExpExecArray
): HtmlTagRange {
  const inset = markdownPatternDefinition.delimiterInset ?? 0;

  const openingTagStartOffset = currentMatch.index + inset;
  const openingTagEndOffset =
    openingTagStartOffset + markdownPatternDefinition.openingDelimiterLength;

  const closingTagEndOffset = currentMatch.index + currentMatch[0].length - inset;
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
    const markdownPatternDefinition = MARKDOWN_TAG_PATTERN_DEFINITIONS[patternDefinitionIndex];
    const markdownPattern = new RegExp(
      markdownPatternDefinition.patternSource,
      markdownPatternDefinition.patternFlags
    );

    let currentMatch: RegExpExecArray | null;

    while ((currentMatch = markdownPattern.exec(sourceText)) !== null) {
      markdownTagRanges.push(createMarkdownTagRange(markdownPatternDefinition, currentMatch));
    }
  }

  return markdownTagRanges;
}
