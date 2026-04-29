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
  /**
   * Matches `</span>` only when an open span containing `cssProperty` appears
   * somewhere earlier in the same string (verified via lookbehind).
   */
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
    close: /(?<=<span\s+style="[^"]*text-align:[^"]*">[\s\S]*)<\/span>/,
  },
  {
    type: ESpanStyleTagType.COLOR,
    cssProperty: 'color',
    open: /<span\s+style="([^"]*color:[^"]*)">/,
    close: /(?<=<span\s+style="[^"]*color:[^"]*">[\s\S]*)<\/span>/,
  },
  {
    type: ESpanStyleTagType.FONT_SIZE,
    cssProperty: 'font-size',
    open: /<span\s+style="([^"]*font-size:[^"]*)">/,
    close: /(?<=<span\s+style="[^"]*font-size:[^"]*">[\s\S]*)<\/span>/,
  },
  {
    type: ESpanStyleTagType.FONT_FAMILY,
    cssProperty: 'font-family',
    open: /<span\s+style="([^"]*font-family:[^"]*)">/,
    close: /(?<=<span\s+style="[^"]*font-family:[^"]*">[\s\S]*)<\/span>/,
  },
  {
    type: ESpanStyleTagType.HIGHLIGHT,
    cssProperty: 'background',
    open: /<span\s+style="([^"]*background:[^"]*)">/,
    close: /(?<=<span\s+style="[^"]*background:[^"]*">[\s\S]*)<\/span>/,
  },
];

// ── Line-level prefix tags ───────────────────────────────────────────────────

/**
 * Line prefix tags ordered by detection priority (highest first).
 * A callout `> [!type]` must be tested before a plain quote `> `.
 * A checkbox `- [ ] ` must be tested before a plain list `- `.
 */
export const LINE_TAG_REGEX: ReadonlyArray<LineTagRegexEntry> = [
  // Callout: `>+` chars then `[!type]` and optional title, then any same-level `>` continuation lines.
  // Backreference `\1` ties continuation lines to the exact `>` depth of the opening.
  // A callout with `>>+` is engine-enforced as nested inside the callout at depth - 1.
  { type: ELineTagType.CALLOUT, open: /^(>+)\s*\[!([^\]]+)\][^\n]*(?:\n\1[^\n]*)*/ },
  // Checkbox: `- [ ] ` (dash, spaces, brackets, trailing space).
  { type: ELineTagType.CHECKBOX, open: /^-\s+\[\s\]\s/ },
  // Plain list item — must not look like a checkbox.
  { type: ELineTagType.LIST, open: /^-\s+(?!\[\s\])/ },
  // Heading: 1–6 `#` chars followed by a space.
  { type: ELineTagType.HEADING, open: /^#{1,6}\s/ },
  // Blockquote: any `>` depth without `[!type]`, or where the callout chain is broken.
  // Backreference `\1` ties continuation lines to the same `>` depth; each line must not open a callout.
  { type: ELineTagType.QUOTE, open: /^(>+)[ \t]?(?!\[!)[^\n]*(?:\n\1[ \t]?(?!\[!)[^\n]*)*/ },
  // Indent: must be preceded by a non-empty content line (`[^\n]\n`).
  // Never matches at document start or after a blank line — those cases are tab-code.
  // HTML indentation uses `\t` + `<span style="margin-left:...">` because tabs alone don't render in HTML.
  // The open delimiter ends at `>` when the span is present.
  { type: ELineTagType.INDENT, open: /(?<=[^\n]\n)(?:\t+(?:<span\s+style="[^"]*margin-left:[^"]*">)?|(?:[ ]{4})+(?:<span\s+style="[^"]*margin-left:[^"]*">)?)[^\n]*(?:\n(?:\t+(?:<span\s+style="[^"]*margin-left:[^"]*">)?|(?:[ ]{4})+(?:<span\s+style="[^"]*margin-left:[^"]*">)?)[^\n]*)*/ },
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
  // Fenced code block: 3+ backticks at line start (4+ backticks also treated as fence).
  // Must NOT open inside inline code or a tab-indented code block.
  {
    type: ESpecialTagType.CODE,
    open: /^`{3,}([^`]*)$/m,
    close: /^\s*`{3,}\s*$/m,
  },
  // Tab-indented code block: atomic — opens at document start (`^`) or after a blank line (`\n\n`).
  // Must NOT open inside a fenced code block.
  // Greedily consumes contiguous lines starting with `\t+` or 4+ spaces.
  {
    type: ESpecialTagType.CODE,
    open: /(?:^|\n\n)(?:\t+|(?:[ ]{4})+)[^\n]*(?:\n(?:\t+|(?:[ ]{4})+)[^\n]*)*/,
    close: null,
  },
  // Inline code: opens with `` ` ``; closes with matching `` ` `` or at line end (`$`) if unclosed.
  // Must NOT open inside a fenced code block or a tab-indented code block.
  {
    type: ESpecialTagType.CODE,
    open: /`/,
    close: /`|$/m,
  },
  // Inline #todo token — single occurrence, no close delimiter.
  {
    type: ESpecialTagType.INLINE_TODO,
    open: /(?:^|(?<=\s))#todo\b/,
    close: null,
  },
  // Meeting details block: atomic — open matches the full block from opening `---` through closing `---`.
  // Body lines must be `\w+: value` pairs separated by newlines.
  {
    type: ESpecialTagType.MEETING_DETAILS,
    open: /^---\n(?:\w+:[^\n]*\n)+---$/,
    close: null,
  },
  // Embed `![[...]]` — atomic; open pattern captures full token.
  {
    type: ESpecialTagType.EMBED,
    open: /!\[\[([^\]]+)\]\]/,
    close: null,
  },
  // Wikilink `[[...]]` or bare `[text]` not followed by `(` (not a footnote ref `[^`, not an external link `[s](s)`).
  {
    type: ESpecialTagType.WIKILINK,
    open: /\[\[([^\]]+)\]\]|\[(?!\^)([^\]]+)\](?!\()/,
    close: null,
  },
  // External URL: markdown link `[text](url)`, protocol URLs (https?://), www., or bare domains with common TLDs.
  {
    type: ESpecialTagType.EXTERNAL_LINK,
    open: /\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9][\w.-]+\.(?:com|org|net|io|dev|co|uk|gov|edu|info|biz|app|ai)(?:\/[^\s<>"]*)?/,
    close: null,
  },
  // Footnote reference: `[^id]` inline reference (open); `[^id]: text` definition line (close).
  {
    type: ESpecialTagType.FOOTNOTE_REF,
    open: /\[\^([^\]]+)\]/,
    close: /\[\^([^\]]+)\]:\s+[^\n]*/,
  },
];
