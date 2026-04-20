import type { TagDefinition, MarkdownToHtmlConversionEntry } from './interfaces';

// ============================================================
// HTML-only Tag Definitions
// ============================================================

export const UNDERLINE_TAG: TagDefinition = {
  tagName: 'u',
  domain: 'html',
  openingMarkup: '<u>',
  closingMarkup: '</u>',
};

export const SUBSCRIPT_TAG: TagDefinition = {
  tagName: 'sub',
  domain: 'html',
  openingMarkup: '<sub>',
  closingMarkup: '</sub>',
};

export const SUPERSCRIPT_TAG: TagDefinition = {
  tagName: 'sup',
  domain: 'html',
  openingMarkup: '<sup>',
  closingMarkup: '</sup>',
};

// ============================================================
// Markdown-native Tag Definitions
// ============================================================

export const BOLD_MD_TAG: TagDefinition = {
  tagName: 'bold',
  domain: 'markdown',
  openingMarkup: '**',
  closingMarkup: '**',
};

export const ITALIC_MD_TAG: TagDefinition = {
  tagName: 'italic',
  domain: 'markdown',
  openingMarkup: '*',
  closingMarkup: '*',
};

export const STRIKETHROUGH_MD_TAG: TagDefinition = {
  tagName: 'strikethrough',
  domain: 'markdown',
  openingMarkup: '~~',
  closingMarkup: '~~',
};

export const HIGHLIGHT_MD_TAG: TagDefinition = {
  tagName: 'highlight',
  domain: 'markdown',
  openingMarkup: '==',
  closingMarkup: '==',
};

// ============================================================
// HTML Equivalent Tag Definitions (used for domain conversion)
// ============================================================

export const BOLD_HTML_TAG: TagDefinition = {
  tagName: 'b',
  domain: 'html',
  openingMarkup: '<b>',
  closingMarkup: '</b>',
};

export const ITALIC_HTML_TAG: TagDefinition = {
  tagName: 'i',
  domain: 'html',
  openingMarkup: '<i>',
  closingMarkup: '</i>',
};

export const STRIKETHROUGH_HTML_TAG: TagDefinition = {
  tagName: 's',
  domain: 'html',
  openingMarkup: '<s>',
  closingMarkup: '</s>',
};

export const HIGHLIGHT_HTML_TAG: TagDefinition = {
  tagName: 'mark',
  domain: 'html',
  openingMarkup: '<mark>',
  closingMarkup: '</mark>',
};

// ============================================================
// Markdown to HTML Conversion Table
// ============================================================

// Entries are defined in order: longer delimiters before shorter ones
// (*** before ** before *) to avoid partial-match confusion.
export const MARKDOWN_TO_HTML_CONVERSION_TABLE: MarkdownToHtmlConversionEntry[] = [
  // *** = bold + italic (must precede ** and * entries)
  {
    markdownOpening: '***',
    markdownClosing: '***',
    htmlTags: [BOLD_HTML_TAG, ITALIC_HTML_TAG],
  },

  { markdownOpening: '**', markdownClosing: '**', htmlTags: [BOLD_HTML_TAG] },
  { markdownOpening: '__', markdownClosing: '__', htmlTags: [BOLD_HTML_TAG] },
  { markdownOpening: '*', markdownClosing: '*', htmlTags: [ITALIC_HTML_TAG] },
  { markdownOpening: '_', markdownClosing: '_', htmlTags: [ITALIC_HTML_TAG] },
  { markdownOpening: '~~', markdownClosing: '~~', htmlTags: [STRIKETHROUGH_HTML_TAG] },
  { markdownOpening: '==', markdownClosing: '==', htmlTags: [HIGHLIGHT_HTML_TAG] },
];

// ============================================================
// MD Tag Name to HTML Tag Mapping (for domain conversion lookups)
// ============================================================

export const MARKDOWN_TO_HTML_TAG_MAP: Map<string, TagDefinition> = new Map([
  ['bold', BOLD_HTML_TAG],
  ['italic', ITALIC_HTML_TAG],
  ['strikethrough', STRIKETHROUGH_HTML_TAG],
  ['highlight', HIGHLIGHT_HTML_TAG],
]);
/**
 * Known HTML tag name to TagDefinition mappings for standard tags.
 * Used by copyFormat to reconstruct TagDefinition from discovered tag ranges.
 */
export const HTML_TAG_NAME_DEFINITIONS: Map<string, TagDefinition> = new Map([
  ['u', UNDERLINE_TAG],
  ['sub', SUBSCRIPT_TAG],
  ['sup', SUPERSCRIPT_TAG],
  ['b', BOLD_HTML_TAG],
  ['i', ITALIC_HTML_TAG],
  ['s', STRIKETHROUGH_HTML_TAG],
  ['mark', HIGHLIGHT_HTML_TAG],
]);

/** Known Markdown tag name to TagDefinition mappings. */
export const MARKDOWN_TAG_NAME_DEFINITIONS: Map<string, TagDefinition> = new Map([
  ['bold', BOLD_MD_TAG],
  ['italic', ITALIC_MD_TAG],
  ['strikethrough', STRIKETHROUGH_MD_TAG],
  ['highlight', HIGHLIGHT_MD_TAG],
]);
