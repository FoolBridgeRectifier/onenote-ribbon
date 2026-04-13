import { TagDefinition, LinePrefixType } from './interfaces';

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

// Entries that expand to multiple HTML tags (e.g. *** → <b><i>)
// use `htmlTags` array. Single-tag entries use a one-element array.
// Order matters: longer delimiters must come before shorter ones
// (*** before ** before *) to avoid partial-match confusion.
export interface MarkdownToHtmlConversionEntry {
  markdownOpening: string;
  markdownClosing: string;
  htmlTags: TagDefinition[];  // multiple entries for combined formats like bold+italic
}

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

// ============================================================
// Line Prefix Patterns
// ============================================================

// Priority order: todo -> bullet -> numbered -> heading -> footnoteDefinition -> indent
// Each pattern captures the full prefix (including whitespace) in group 1.
export const LINE_PREFIX_PATTERNS: Array<{ type: LinePrefixType; pattern: RegExp }> = [
  { type: 'todo', pattern: /^(\s*-\s\[[x ]\]\s)/i },
  { type: 'bullet', pattern: /^(\s*[-*+]\s)/ },
  { type: 'numbered', pattern: /^(\s*\d+\.\s)/ },
  { type: 'heading', pattern: /^(#{1,6}\s)/ },
  { type: 'footnoteDefinition', pattern: /^(\[\^[^\]]+\]:\s)/ },
  { type: 'indent', pattern: /^(\s{2,})/ },  // only matches if no list marker follows
];

// Callout prefix — checked separately for composite prefix detection
// (e.g. "> - [ ] " is callout + todo)
export const CALLOUT_PREFIX_PATTERN = /^(>\s)/;

// ============================================================
// Atomic Token Patterns (Protected Ranges)
// ============================================================

// Scanned within selection text. Order matters for overlap deduplication:
// embed must come before wikilink because embed starts with !,
// and the wikilink regex would otherwise match the inner [[ ]] of an embed.
export const ATOMIC_TOKEN_PATTERNS: Array<{ tokenType: string; pattern: RegExp }> = [
  { tokenType: 'embed', pattern: /!\[\[[^\]]+\]\]/g },
  { tokenType: 'wikilink', pattern: /\[\[[^\]]+\]\]/g },
  { tokenType: 'mdLink', pattern: /\[[^\]]+\]\([^)]+\)/g },
  { tokenType: 'footnoteRef', pattern: /\[\^[^\]]+\]/g },
  { tokenType: 'hashtag', pattern: /#[a-zA-Z0-9_/-]+/g },
];

// ============================================================
// Inert Zone Detection Patterns
// ============================================================

// Fenced code blocks (``` delimiters)
export const CODE_FENCE_PATTERN = /^```/gm;

// Math blocks ($$ delimiters)
export const MATH_FENCE_PATTERN = /^\$\$/gm;

// Table lines (pipe-delimited rows)
export const TABLE_LINE_PATTERN = /^\|.+\|$/gm;

// Horizontal rules (three or more dashes, underscores, or asterisks)
export const HORIZONTAL_RULE_PATTERN = /^(---+|___+|\*\*\*+)$/gm;

// Inline math (single $ delimiters, no nesting or newlines)
export const INLINE_MATH_PATTERN = /\$[^$\n]+\$/g;

// Inline code (backtick delimiters, no nesting or newlines)
export const INLINE_CODE_PATTERN = /`[^`\n]+`/g;
