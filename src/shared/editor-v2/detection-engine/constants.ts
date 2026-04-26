import type { TagType, ProtectedRange } from './interfaces';

/** Milliseconds to wait after a content change before rebuilding the tag context. */
export const DETECTION_DEBOUNCE_MS = 300;

/** Regex that matches the start of a fenced code block line. */
export const FENCED_CODE_BLOCK_OPENING_PATTERN = /^```/;

/** Regex that matches a tab-indented line (inert zone). */
export const TAB_INDENTED_LINE_PATTERN = /^\t/;

/** Regex that matches a math block delimiter line. */
export const MATH_BLOCK_DELIMITER_PATTERN = /^\$\$\s*$/;

/** Regex that matches a callout header line, capturing the callout type. */
export const CALLOUT_HEADER_PATTERN = /^(>+)\s*\[!([^\]]+)\](.*)/;

/** Regex that matches a meeting-details opening line. */
export const MEETING_DETAILS_OPENING_PATTERN = /^>\s*---\s*$/;

/** Regex that matches a checkbox list item. */
export const CHECKBOX_ITEM_PATTERN = /^-\s+\[\s\]\s/;

/** Regex that matches a plain list item (not checkbox). */
export const LIST_ITEM_PATTERN = /^-\s+(?!\[\s\])/;

/** Regex that matches a heading line, capturing the `#` level prefix. */
export const HEADING_LINE_PATTERN = /^(#{1,6})\s/;

/** Regex that matches a blockquote prefix (not a callout). */
export const QUOTE_LINE_PATTERN = /^>\s(?!\[!)/;

/** Regex that matches a margin-left indent span, capturing the pixel value. */
export const INDENT_SPAN_PATTERN = /<span\s+style="margin-left:(\d+)px"\s*\/>/;

/** CSS property name (lowercase) → TagType for span style parsing. */
export const CSS_PROPERTY_TO_TAG_TYPE: Record<string, TagType> = {
  'color':       'color',
  'font-size':   'fontSize',
  'font-family': 'fontFamily',
  'background':  'highlight',
  'margin-left': 'indent',
};

/** Pattern → token-type table used by the protected-token scanner. Order matters. */
export const PROTECTED_TOKEN_RECOGNISERS: ReadonlyArray<{ pattern: RegExp; tokenType: ProtectedRange['tokenType'] }> = [
  { pattern: /!\[\[[^\]]+\]\]/g,      tokenType: 'embed' },
  { pattern: /\[\[[^\]]+\]\]/g,       tokenType: 'wikilink' },
  { pattern: /\[\^[^\]]+\]/g,          tokenType: 'footnoteRef' },
  // mdLink: `[text](url)` — text/url cannot contain unescaped brackets/parens.
  { pattern: /\[[^\]]+\]\([^)]+\)/g,  tokenType: 'mdLink' },
  { pattern: /`[^`]+`/g,                  tokenType: 'code' },
  // Inline `#todo` token — bounded by start-of-line or whitespace on the left.
  { pattern: /(?:^|(?<=\s))#todo\b/g,    tokenType: 'todo' },
];

/** HTML element name → TagType. Order matters: longer names tried first. */
export const HTML_TAG_RECOGNISERS: ReadonlyArray<{ name: string; type: TagType }> = [
  { name: 'span', type: 'color' },        // type re-derived from style attribute
  { name: 'sub',  type: 'subscript' },
  { name: 'sup',  type: 'superscript' },
  { name: 'b',    type: 'bold' },
  { name: 'i',    type: 'italic' },
  { name: 's',    type: 'strikethrough' },
  { name: 'u',    type: 'underline' },
];

/** MD delimiter → TagType. Order matters: longer delimiters tried first. */
export const MD_DELIMITER_RECOGNISERS: ReadonlyArray<{ delimiter: string; type: TagType }> = [
  { delimiter: '**', type: 'bold' },
  { delimiter: '~~', type: 'strikethrough' },
  { delimiter: '==', type: 'highlight' },
  { delimiter: '*',  type: 'italic' },
  { delimiter: '`',  type: 'code' },
];
