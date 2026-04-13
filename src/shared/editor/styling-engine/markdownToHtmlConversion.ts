import {
  MARKDOWN_TO_HTML_CONVERSION_TABLE,
  MarkdownToHtmlConversionEntry,
} from './constants';

// Escapes characters that have special meaning in regular expressions
function escapeRegexSpecialCharacters(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a regex that matches a markdown delimiter pair wrapping arbitrary content.
 * Uses [\s\S]*? (non-greedy) so nested/multiple pairs resolve correctly
 * when the conversion table is processed longest-delimiter-first.
 */
function buildDelimiterRegex(entry: MarkdownToHtmlConversionEntry): RegExp {
  const escapedOpening = escapeRegexSpecialCharacters(entry.markdownOpening);
  const escapedClosing = escapeRegexSpecialCharacters(entry.markdownClosing);

  return new RegExp(escapedOpening + '([\\s\\S]*?)' + escapedClosing, 'g');
}

/**
 * Wraps captured content with the HTML tags defined for a conversion entry.
 * For multi-tag entries (e.g. *** -> bold+italic), the first tag in the array
 * wraps outermost and the last tag wraps innermost.
 */
function buildHtmlReplacement(
  capturedContent: string,
  entry: MarkdownToHtmlConversionEntry,
): string {
  let result = capturedContent;

  // Wrap from innermost (last tag) to outermost (first tag)
  for (
    let tagIndex = entry.htmlTags.length - 1;
    tagIndex >= 0;
    tagIndex -= 1
  ) {
    const tag = entry.htmlTags[tagIndex];
    result = tag.openingMarkup + result + tag.closingMarkup;
  }

  return result;
}

/**
 * Converts markdown inline formatting tokens to their HTML equivalents.
 *
 * Processes the conversion table in order (longest delimiters first) so that
 * `***` is replaced before `**` before `*`, avoiding partial-match conflicts.
 */
export function convertMarkdownTokensToHtml(text: string): string {
  let result = text;

  for (
    let entryIndex = 0;
    entryIndex < MARKDOWN_TO_HTML_CONVERSION_TABLE.length;
    entryIndex += 1
  ) {
    const entry = MARKDOWN_TO_HTML_CONVERSION_TABLE[entryIndex];
    const delimiterRegex = buildDelimiterRegex(entry);

    result = result.replace(delimiterRegex, (_fullMatch, capturedContent) => {
      return buildHtmlReplacement(capturedContent, entry);
    });
  }

  return result;
}

/**
 * Returns true if the text contains at least one matched pair of markdown
 * formatting tokens from the conversion table.
 */
export function containsMarkdownTokens(text: string): boolean {
  for (
    let entryIndex = 0;
    entryIndex < MARKDOWN_TO_HTML_CONVERSION_TABLE.length;
    entryIndex += 1
  ) {
    const entry = MARKDOWN_TO_HTML_CONVERSION_TABLE[entryIndex];
    const delimiterRegex = buildDelimiterRegex(entry);

    if (delimiterRegex.test(text)) {
      return true;
    }
  }

  return false;
}
