import { ESpecialTagType } from '../../../../interfaces';

/**
 * Special tags.
 * - Delimited tokens (inline code, fenced code): separate `open` / `close` patterns.
 * - Atomic tokens (wikilinks, embeds, todos, etc.): `open` matches the whole token,
 *   `close` is undefined.
 * Embed must appear before wikilink so `![[` is consumed before `[[` is tried.
 */
export const SPECIAL_TAG_REGEX = [
  // Fenced code block: exactly 3 backticks at line start (4+ backticks also open a fence,
  // but the match is anchored to the first 3).
  // Matches only the backtick delimiter — language hint and body text are not captured.
  // Must NOT open inside inline code or a tab-indented code block.
  {
    type: ESpecialTagType.BLOCK_CODE,
    isHTML: false,
    open: /^`{3}/gm,
    // Lookbehind/lookahead capture only the backtick run — surrounding whitespace is excluded.
    // Exactly 3 backticks matched (same as open) — 4+ backtick fences still close on 3.
    close: /^`{3}(?=`*\s*$)/gm,
  },
  // Tab-indented / space-indented code block: atomic — fires only at valid block-entry anchors:
  //   - Document start (`^`)
  //   - After a blank line (`(?<=\n\n)`)
  //   - Directly after an opening `---` (`(?<=^---\n)`)
  //   - After a full frontmatter/meeting-details block (`(?<=^---\n[\s\S]*-{3,}\n)`)
  // The continuation branch `(?<=(?:^|\n)\t[^\n]*\n)` is intentionally omitted: it cannot
  // distinguish tab-indented lines inside a fenced code block from standalone code lines,
  // causing false LINE_CODE detections inside BLOCK_CODE spans.
  // Subsequent lines of a tab-indented block are identified by the block tracker, not here.
  // Matches only the leading tab/space prefix — body text is not captured.
  {
    type: ESpecialTagType.LINE_CODE,
    isHTML: false,
    open: /(?:^|(?<=\n\n)|(?<=^---\n)|(?<=^---\n[\s\S]*-{3,}\n))(?:\t+|(?:[ ]{4})+)/g,
    close: undefined,
  },
  // Inline code: opens with `` ` `` and closes with matching `` ` ``.
  // Unclosed-backtick fallback is handled by the tag parser, not by a global `$` regex.
  // Must NOT open inside a fenced code block or a tab-indented code block.
  {
    type: ESpecialTagType.INLINE_CODE,
    isHTML: false,
    open: /`/g,
    close: /`/g,
  },
  // Inline #todo token — single occurrence, no close delimiter.
  {
    type: ESpecialTagType.INLINE_TODO,
    isHTML: false,
    open: /(?:^|(?<=\s))#todo\b/g,
    close: undefined,
  },
  // Meeting details block: atomic — open matches the full block from opening `---` through closing `---`.
  // Body lines must be `\w+: value` pairs separated by newlines.
  // Requires `m` flag so `$` anchors to end-of-line (not end-of-string), allowing the block
  // to be detected inside a larger document that has content after the closing `---`.
  {
    type: ESpecialTagType.MEETING_DETAILS,
    isHTML: false,
    open: /^---\n(?:\w+:[^\n]*\n)+---$/gm,
    close: undefined,
  },
  // Embed `![[...]]` — atomic; open pattern captures full token.
  {
    type: ESpecialTagType.EMBED,
    isHTML: false,
    open: /!\[\[([^\]]+)\]\]/g,
    close: undefined,
  },
  // Wikilink `[[...]]` only — bare `[text]` is NOT matched (wikilinks require double brackets).
  // `(?<!^[ \t]*-[ \t]*)` blocks only when `[[` is preceded by a line-start list/checkbox
  // dash (e.g. `- [[link]]`, `\t- [[link]]`). Word-embedded hyphens (e.g. `not-[[link]]`)
  // are NOT excluded because `^[ \t]*` only matches spaces/tabs from line start, not word chars.
  // Requires `m` flag so `^` anchors to the start of each line in multi-line content.
  {
    type: ESpecialTagType.WIKILINK,
    isHTML: false,
    open: /(?<!^[ \t]*-[ \t]*)\[\[([^\]]+)\]\]/gm,
    close: undefined,
  },
  // External URL: markdown link `[text](url)`, protocol URLs (https?://), www., or bare domains with common TLDs.
  {
    type: ESpecialTagType.EXTERNAL_LINK,
    isHTML: false,
    open: /\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9][\w.-]+\.(?:com|org|net|io|dev|co|uk|gov|edu|info|biz|app|ai)(?:\/[^\s<>"]*)?/g,
    close: undefined,
  },
  // Footnote reference: `[^id]` inline reference or `[^id]: text` definition line — atomic, no close.
  {
    type: ESpecialTagType.FOOTNOTE_REF,
    isHTML: false,
    open: /\[\^([^\]]+)\]:?/g,
    close: undefined,
  },
];
