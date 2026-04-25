import type { MdTagDefinition, HtmlTagDefinition } from './interfaces';

// === MD Tag Definitions ===

export const BOLD_MD: MdTagDefinition = {
  kind: 'md-closing',
  openingDelimiter: '**',
  closingDelimiter: '**',
};

export const ITALIC_MD: MdTagDefinition = {
  kind: 'md-closing',
  openingDelimiter: '*',
  closingDelimiter: '*',
};

export const STRIKETHROUGH_MD: MdTagDefinition = {
  kind: 'md-closing',
  openingDelimiter: '~~',
  closingDelimiter: '~~',
};

export const HIGHLIGHT_MD: MdTagDefinition = {
  kind: 'md-closing',
  openingDelimiter: '==',
  closingDelimiter: '==',
};

export const CODE_MD: MdTagDefinition = {
  kind: 'md-closing',
  openingDelimiter: '`',
  closingDelimiter: '`',
};

// === HTML Tag Definitions ===

export const BOLD_HTML: HtmlTagDefinition = {
  kind: 'html-closing',
  tagName: 'b',
  openingMarkup: '<b>',
  closingMarkup: '</b>',
};

export const ITALIC_HTML: HtmlTagDefinition = {
  kind: 'html-closing',
  tagName: 'i',
  openingMarkup: '<i>',
  closingMarkup: '</i>',
};

export const STRIKETHROUGH_HTML: HtmlTagDefinition = {
  kind: 'html-closing',
  tagName: 's',
  openingMarkup: '<s>',
  closingMarkup: '</s>',
};

export const UNDERLINE_HTML: HtmlTagDefinition = {
  kind: 'html-closing',
  tagName: 'u',
  openingMarkup: '<u>',
  closingMarkup: '</u>',
};

export const SUBSCRIPT_HTML: HtmlTagDefinition = {
  kind: 'html-closing',
  tagName: 'sub',
  openingMarkup: '<sub>',
  closingMarkup: '</sub>',
};

export const SUPERSCRIPT_HTML: HtmlTagDefinition = {
  kind: 'html-closing',
  tagName: 'sup',
  openingMarkup: '<sup>',
  closingMarkup: '</sup>',
};

// === Domain Upgrade Map ===

/** Maps each MD opening delimiter to its HTML equivalent for domain upgrade (invariant I2). */
export const MD_TO_HTML_EQUIVALENT: Record<string, HtmlTagDefinition> = {
  '**': BOLD_HTML,
  '*': ITALIC_HTML,
  '~~': STRIKETHROUGH_HTML,
};

// === Mutual Exclusion ===

/** Maps tag name to the tag name it must swap with on toggle (sub↔sup). */
export const MUTUALLY_EXCLUSIVE_PAIRS: Record<string, string> = {
  sub: 'sup',
  sup: 'sub',
};

// === Indent ===

/** Pixel step per indent level (invariant I5). */
export const INDENT_STEP_PX = 24;
