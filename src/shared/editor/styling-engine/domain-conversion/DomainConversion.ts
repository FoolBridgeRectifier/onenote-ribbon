import type { HtmlTagDefinition, TextReplacement } from '../interfaces';
import type { HtmlTagRange } from '../../enclosing-html-tags/interfaces';
import { MARKDOWN_TO_HTML_TAG_MAP } from '../constants';
import { tagEnclosesSelection } from '../shared-helpers/tag-geometry/TagGeometry';
import { wrapTextWithTag } from '../tag-manipulation/TagManipulation';
import { convertMarkdownTokensToHtml } from '../markdown-to-html-conversion/MarkdownToHtmlConversion';

/**
 * When adding an HTML tag to content in a markdown domain that has markdown tokens,
 * converts the enclosing MD tags to their HTML equivalents and wraps with the target tag.
 * Returns a single replacement that replaces the full enclosing MD region.
 */
export function buildDomainConversionReplacements(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: HtmlTagDefinition,
  allTagRanges: HtmlTagRange[]
): TextReplacement[] {
  // Find enclosing MD tags that we need to convert
  const enclosingMarkdownRanges: HtmlTagRange[] = [];

  for (const tagRange of allTagRanges) {
    if (!tagEnclosesSelection(tagRange, selectionStartOffset, selectionEndOffset)) continue;

    // Check if this is a markdown tag by looking up in the conversion map
    if (MARKDOWN_TO_HTML_TAG_MAP.has(tagRange.tagName)) {
      enclosingMarkdownRanges.push(tagRange);
    }
  }

  if (enclosingMarkdownRanges.length === 0) {
    // No MD tags to convert — just wrap the selection directly
    return wrapTextWithTag(selectionStartOffset, selectionEndOffset, tagDefinition);
  }

  // Find the outermost MD tag range to determine the full region to replace
  const outermostRange = enclosingMarkdownRanges.reduce((outermost, candidate) => {
    return candidate.openingTagStartOffset < outermost.openingTagStartOffset
      ? candidate
      : outermost;
  });

  // Extract the text from outermost opening to outermost closing (inclusive of delimiters)
  const regionStart = outermostRange.openingTagStartOffset;
  const regionEnd = outermostRange.closingTagEndOffset;
  const regionText = sourceText.slice(regionStart, regionEnd);

  // Convert all MD tokens in the region to HTML, then wrap with the target HTML tag
  const convertedText = convertMarkdownTokensToHtml(regionText);
  const wrappedText = tagDefinition.openingMarkup + convertedText + tagDefinition.closingMarkup;

  return [{ fromOffset: regionStart, toOffset: regionEnd, replacementText: wrappedText }];
}
