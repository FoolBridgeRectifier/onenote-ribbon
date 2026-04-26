import {
  BOLD_HTML_TAG, ITALIC_HTML_TAG, STRIKETHROUGH_HTML_TAG, HIGHLIGHT_HTML_TAG,
} from '../constants';
import type { MarkdownToHtmlConversionEntry } from './interfaces';

/**
 * Conversion table — longer delimiters first (`***` before `**` before `*`)
 * so that combined tokens are matched ahead of their substrings.
 */
export const MARKDOWN_TO_HTML_CONVERSION_TABLE: MarkdownToHtmlConversionEntry[] = [
  { markdownOpening: '***', markdownClosing: '***', htmlTags: [BOLD_HTML_TAG, ITALIC_HTML_TAG] },
  { markdownOpening: '**',  markdownClosing: '**',  htmlTags: [BOLD_HTML_TAG] },
  { markdownOpening: '__',  markdownClosing: '__',  htmlTags: [BOLD_HTML_TAG] },
  { markdownOpening: '*',   markdownClosing: '*',   htmlTags: [ITALIC_HTML_TAG] },
  { markdownOpening: '_',   markdownClosing: '_',   htmlTags: [ITALIC_HTML_TAG] },
  { markdownOpening: '~~',  markdownClosing: '~~',  htmlTags: [STRIKETHROUGH_HTML_TAG] },
  { markdownOpening: '==',  markdownClosing: '==',  htmlTags: [HIGHLIGHT_HTML_TAG] },
];
