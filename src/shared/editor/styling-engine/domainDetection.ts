import { createEnclosingHtmlTagFinder } from '../enclosing-html-tags/enclosingHtmlTags';
import { buildTextIndex, offsetToPosition } from '../text-offset/textOffset';
import { DomainDetectionResult, FormattingDomain } from './interfaces';

const MARKDOWN_TAG_NAMES = new Set(['bold', 'italic', 'strikethrough', 'highlight', 'code']);

/**
 * Detects whether the formatting context around a selection is markdown or HTML.
 *
 * Any enclosing HTML tag forces the domain to 'html'; otherwise defaults to 'markdown'.
 * Also reports whether markdown tokens and/or HTML tags are present for downstream decisions.
 */
export function detectFormattingDomain(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number
): DomainDetectionResult {
  const textIndex = buildTextIndex(sourceText);

  const leftPosition = offsetToPosition(selectionStartOffset, textIndex);
  const rightPosition = offsetToPosition(selectionEndOffset, textIndex);

  const finder = createEnclosingHtmlTagFinder(sourceText);

  const enclosingTagRanges = finder.getEnclosingTagRanges({
    leftPosition,
    rightPosition,
  });

  const markdownTagNames: string[] = [];
  const htmlTagNames: string[] = [];

  for (let rangeIndex = 0; rangeIndex < enclosingTagRanges.length; rangeIndex += 1) {
    const tagName = enclosingTagRanges[rangeIndex].tagName;

    if (MARKDOWN_TAG_NAMES.has(tagName)) {
      markdownTagNames.push(tagName);
    } else {
      htmlTagNames.push(tagName);
    }
  }

  const hasMarkdownTokens = markdownTagNames.length > 0;
  const hasHtmlTags = htmlTagNames.length > 0;

  const domain: FormattingDomain = hasHtmlTags ? 'html' : 'markdown';

  return {
    domain,
    hasMarkdownTokens,
    hasHtmlTags,
  };
}
