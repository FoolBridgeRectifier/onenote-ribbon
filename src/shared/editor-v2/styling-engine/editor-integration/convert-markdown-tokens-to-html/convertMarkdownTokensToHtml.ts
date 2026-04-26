import { MARKDOWN_TO_HTML_CONVERSION_TABLE } from './constants';
import type { MarkdownToHtmlConversionEntry } from './interfaces';

/** Escapes characters that have special meaning in regular expressions. */
function escapeRegexSpecialCharacters(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a regex matching a markdown delimiter pair wrapping arbitrary content.
 * Uses a non-greedy capture so that nested/multiple pairs resolve correctly when
 * the table is processed longest-delimiter-first.
 */
function buildDelimiterRegex(entry: MarkdownToHtmlConversionEntry): RegExp {
  const escapedOpening = escapeRegexSpecialCharacters(entry.markdownOpening);
  const escapedClosing = escapeRegexSpecialCharacters(entry.markdownClosing);
  return new RegExp(escapedOpening + '([\\s\\S]*?)' + escapedClosing, 'g');
}

/**
 * Wraps captured content with the HTML tags defined for a conversion entry.
 * For multi-tag entries (e.g. *** → bold+italic), the first tag wraps outermost
 * and the last tag wraps innermost.
 */
function buildHtmlReplacement(capturedContent: string, entry: MarkdownToHtmlConversionEntry): string {
  let result = capturedContent;
  for (let tagIndex = entry.htmlTags.length - 1; tagIndex >= 0; tagIndex--) {
    const tag = entry.htmlTags[tagIndex];
    result = tag.openingMarkup + result + tag.closingMarkup;
  }
  return result;
}

/**
 * Converts markdown inline formatting tokens (`**`, `*`, `~~`, `==`, etc.) to their
 * HTML equivalents. Used by the align-button to lift markdown text into a span wrapper.
 */
export function convertMarkdownTokensToHtml(text: string): string {
  let result = text;

  for (let entryIndex = 0; entryIndex < MARKDOWN_TO_HTML_CONVERSION_TABLE.length; entryIndex++) {
    const entry = MARKDOWN_TO_HTML_CONVERSION_TABLE[entryIndex];
    const delimiterRegex = buildDelimiterRegex(entry);
    result = result.replace(delimiterRegex, (_fullMatch, capturedContent) => {
      return buildHtmlReplacement(capturedContent, entry);
    });
  }

  return result;
}
