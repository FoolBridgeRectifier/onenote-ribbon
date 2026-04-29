/* eslint-disable strict-structure/types-only-in-interfaces-file */
/* eslint-disable max-lines */
import {
  EMdStyleTagType,
  EHtmlStyleTagType,
  ESpanStyleTagType,
  ELineTagType,
  ESpecialTagType,
} from '../../interfaces';

// ── Entry interfaces ─────────────────────────────────────────────────────────

/** MD style tag — open and close use the same symmetric delimiter. */
export interface MdTagRegexEntry {
  type: EMdStyleTagType;
  /** Test with `delimiter.test(line.slice(cursor))` at both open and close positions. */
  delimiter: RegExp;
}

/**
 * HTML equivalent of an MD tag (`<b>`, `<i>`, `<s>`).
 * Produces an IMdStyleTag with isHTML: true.
 */
export interface HtmlEquivMdTagRegexEntry {
  type: EMdStyleTagType;
  open: RegExp;
  close: RegExp;
}

/** HTML-only style tag — no MD equivalent. Produces an IHtmlStyleTag. */
export interface HtmlTagRegexEntry {
  type: EHtmlStyleTagType;
  open: RegExp;
  close: RegExp;
}

/**
 * Span style tag — produces an ISpanStyleTag.
 * `open` captures group 1 = full style attribute value for downstream CSS parsing.
 */
export interface SpanTagRegexEntry {
  type: ESpanStyleTagType;
  /** Lowercase CSS property name that identifies this span (e.g. `'color'`, `'font-size'`). */
  cssProperty: string;
  /** Matches `<span style="...">` where style contains the relevant CSS property. Capture group 1 = style value. */
  open: RegExp;
  close: RegExp;
}

/** Line-level prefix tag — produces an ILineStyleTag. No closing delimiter. */
export interface LineTagRegexEntry {
  type: ELineTagType;
  /** Anchored to start of line (`^`). */
  open: RegExp;
}

/**
 * Special / protected-range tag — produces an ISpecialTag.
 * Atomic tokens (wikilinks, todo, footnote refs) use a full-token `open` pattern with `close: null`.
 * Delimited tokens (code fences, inline code) have separate `open` and `close` patterns.
 */
export interface SpecialTagRegexEntry {
  type: ESpecialTagType;
  open: RegExp;
  close: RegExp | null;
}

// ── MD style tags ────────────────────────────────────────────────────────────

/**
 * MD delimiter pairs. `**` and `~~` and `==` must appear before `*` so the
 * longer delimiter is tried first at each cursor position.
 */
export const MD_TAG_REGEX: ReadonlyArray<MdTagRegexEntry> = [
  { type: EMdStyleTagType.BOLD, delimiter: /\*\*/ },
  { type: EMdStyleTagType.STRIKETHROUGH, delimiter: /~~/ },
  { type: EMdStyleTagType.HIGHLIGHT, delimiter: /==/ },
  // `*` must come last — disambiguated at scan time by checking for adjacent `*`.
  { type: EMdStyleTagType.ITALIC, delimiter: /\*/ },
];

// ── HTML equivalents of MD tags ──────────────────────────────────────────────

/**
 * HTML forms of bold/italic/strikethrough. Same TTagType as their MD counterpart;
 * the matched tag gets isHTML: true.
 */
export const HTML_EQUIV_MD_TAG_REGEX: ReadonlyArray<HtmlEquivMdTagRegexEntry> = [
  { type: EMdStyleTagType.BOLD, open: /<b>/, close: /<\/b>/ },
  { type: EMdStyleTagType.ITALIC, open: /<i>/, close: /<\/i>/ },
  { type: EMdStyleTagType.STRIKETHROUGH, open: /<s>/, close: /<\/s>/ },
];

// ── HTML-only style tags ─────────────────────────────────────────────────────

/** Tags with no MD equivalent — always HTML. */
export const HTML_TAG_REGEX: ReadonlyArray<HtmlTagRegexEntry> = [
  { type: EHtmlStyleTagType.UNDERLINE, open: /<u>/, close: /<\/u>/ },
  { type: EHtmlStyleTagType.SUBSCRIPT, open: /<sub>/, close: /<\/sub>/ },
  { type: EHtmlStyleTagType.SUPERSCRIPT, open: /<sup>/, close: /<\/sup>/ },
];

// ── Span style tags ──────────────────────────────────────────────────────────

/**
 * Span style tags ordered so more-specific style properties (multi-property
 * `text-align`) appear before single-property ones to avoid false matches.
 * Each `open` pattern captures the full style attribute value in group 1.
 */
export const SPAN_TAG_REGEX: ReadonlyArray<SpanTagRegexEntry> = [
  // Align — multi-property span; check for `text-align:` before single-prop spans.
  {
    type: ESpanStyleTagType.ALIGN,
    cssProperty: 'text-align',
    open: /<span\s+style="([^"]*text-align:[^"]*)">/,
    close: /<\/span>/,
  },
  {
    type: ESpanStyleTagType.COLOR,
    cssProperty: 'color',
    open: /<span\s+style="([^"]*color:[^"]*)">/,
    close: /<\/span>/,
  },
  {
    type: ESpanStyleTagType.FONT_SIZE,
    cssProperty: 'font-size',
    open: /<span\s+style="([^"]*font-size:[^"]*)">/,
    close: /<\/span>/,
  },
  {
    type: ESpanStyleTagType.FONT_FAMILY,
    cssProperty: 'font-family',
    open: /<span\s+style="([^"]*font-family:[^"]*)">/,
    close: /<\/span>/,
  },
  {
    type: ESpanStyleTagType.HIGHLIGHT,
    cssProperty: 'background',
    open: /<span\s+style="([^"]*background:[^"]*)">/,
    close: /<\/span>/,
  },
];

// ── Line-level prefix tags ───────────────────────────────────────────────────

/**
 * Line prefix tags ordered by detection priority (highest first).
 * A callout `> [!type]` must be tested before a plain quote `> `.
 * A checkbox `- [ ] ` must be tested before a plain list `- `.
 */
export const LINE_TAG_REGEX: ReadonlyArray<LineTagRegexEntry> = [
  // Callout: one or more `>` chars followed by optional space then `[!type]`.
  { type: ELineTagType.CALLOUT, open: /^(>+)\s*\[!([^\]]+)\]/ },
  // Checkbox: `- [ ] ` (dash, spaces, brackets, trailing space).
  { type: ELineTagType.CHECKBOX, open: /^-\s+\[\s\]\s/ },
  // Plain list item — must not look like a checkbox.
  { type: ELineTagType.LIST, open: /^-\s+(?!\[\s\])/ },
  // Heading: 1–6 `#` chars followed by a space.
  { type: ELineTagType.HEADING, open: /^#{1,6}\s/ },
  // Blockquote — must not be a callout.
  { type: ELineTagType.QUOTE, open: /^>\s(?!\[!)/ },
  // Indent: line starts with a tab or 4+ spaces (no empty-line / document-start context).
  { type: ELineTagType.INDENT, open: /^(\t+|[ ]{4,})/ },
];

// ── Special / protected-range tags ──────────────────────────────────────────

/**
 * Special tags.
 * - Delimited tokens (inline code, fenced code): separate `open` / `close` patterns.
 * - Atomic tokens (wikilinks, embeds, todos, etc.): `open` matches the whole token,
 *   `close` is null.
 * Embed must appear before wikilink so `![[` is consumed before `[[` is tried.
 */
export const SPECIAL_TAG_REGEX: ReadonlyArray<SpecialTagRegexEntry> = [
  // Fenced code block: ``` at line start. close = closing fence on its own line.
  {
    type: ESpecialTagType.CODE,
    open: /^```([^`]*)$/,
    close: /^\s*```\s*$/,
  },
  // Tab-indented code block: `\t` or 4+ spaces at line start.
  // open applies only when TAB_CODE_CONTEXT_REGEX matches the preceding line (empty line) or at document start.
  {
    type: ESpecialTagType.CODE,
    open: /^(\t+|[ ]{4,})/,
    close: /^(?!\t|[ ]{4})/,
  },
  // Inline code: single backtick pair.
  {
    type: ESpecialTagType.CODE,
    open: /`/,
    close: /`/,
  },
  // Inline #todo token — single occurrence, no close delimiter.
  {
    type: ESpecialTagType.INLINE_TODO,
    open: /(?:^|(?<=\s))#todo\b/,
    close: null,
  },
  // Meeting details block: `---` delimiter. Body lines must match MEETING_FIELD_LINE_REGEX.
  {
    type: ESpecialTagType.MEETING_DETAILS,
    open: /^---$/,
    close: /^---$/,
  },
  // Embed `![[...]]` — atomic; open pattern captures full token.
  {
    type: ESpecialTagType.EMBED,
    open: /!\[\[([^\]]+)\]\]/,
    close: null,
  },
  // Wikilink `[[...]]` — atomic.
  {
    type: ESpecialTagType.WIKILINK,
    open: /\[\[([^\]]+)\]\]/,
    close: null,
  },
  // Markdown link `[text](url)` — atomic.
  {
    type: ESpecialTagType.MD_LINK,
    open: /\[([^\]]+)\]\(([^)]+)\)/,
    close: null,
  },
  // Footnote reference `[^id]` — atomic.
  {
    type: ESpecialTagType.FOOTNOTE_REF,
    open: /\[\^([^\]]+)\]/,
    close: null,
  },
];

// ── Standalone regex constants ────────────────────────────────────────────────

/** Validates a single meeting field line: `word: word`. */
export const MEETING_FIELD_LINE_REGEX = /^\w+: \w+$/;

/** Matches the empty line that must precede a tab-indented code block. */
export const TAB_CODE_CONTEXT_REGEX = /^$/;
