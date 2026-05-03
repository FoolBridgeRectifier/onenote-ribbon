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
    type: ESpecialTagType.CODE,
    open: /^`{3}/gm,
    // Lookbehind/lookahead capture only the backtick run — surrounding whitespace is excluded.
    // Exactly 3 backticks matched (same as open) — 4+ backtick fences still close on 3.
    close: /^`{3}(?=`*\s*$)/gm,
  },
  // Tab-indented code block: atomic — opens at document start (`^`), after a blank line (`(?<=\n\n)`),
  // directly after a `---`-based frontmatter/meeting-details block at document start,
  // OR anywhere within a line that has already started (`(?<=[^\n])`).
  //   - `(?<=^---\n)` covers `---\n\t...` (indent immediately after opening delimiter).
  //   - `(?<=^---\n[\s\S]*-{3,}\n)` covers full frontmatter/meeting-details closed by `-{3,}`.
  // `(?<=[^\n])` allows mid-line tabs to also be detected within an already-open code context.
  // Matches only the leading tab/space prefix — body text is not captured.
  {
    type: ESpecialTagType.CODE,
    open: /(?:^|(?<=\n\n)|(?<=^---\n)|(?<=^---\n[\s\S]*-{3,}\n)|(?<=(?:^|\n)\t[^\n]*\n))(?:\t+|(?:[ ]{4})+)/g,
    close: undefined,
  },
  // Inline code: opens with `` ` `` and closes with matching `` ` ``.
  // Unclosed-backtick fallback is handled by the tag parser, not by a global `$` regex.
  // Must NOT open inside a fenced code block or a tab-indented code block.
  {
    type: ESpecialTagType.CODE,
    open: /`/g,
    close: /`/g,
  },
  // Inline #todo token — single occurrence, no close delimiter.
  {
    type: ESpecialTagType.INLINE_TODO,
    open: /(?:^|(?<=\s))#todo\b/g,
    close: undefined,
  },
  // Meeting details block: atomic — open matches the full block from opening `---` through closing `---`.
  // Body lines must be `\w+: value` pairs separated by newlines.
  // Requires `m` flag so `$` anchors to end-of-line (not end-of-string), allowing the block
  // to be detected inside a larger document that has content after the closing `---`.
  {
    type: ESpecialTagType.MEETING_DETAILS,
    open: /^---\n(?:\w+:[^\n]*\n)+---$/gm,
    close: undefined,
  },
  // Embed `![[...]]` — atomic; open pattern captures full token.
  {
    type: ESpecialTagType.EMBED,
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
    open: /(?<!^[ \t]*-[ \t]*)\[\[([^\]]+)\]\]/gm,
    close: undefined,
  },
  // External URL: markdown link `[text](url)`, protocol URLs (https?://), www., or bare domains with common TLDs.
  {
    type: ESpecialTagType.EXTERNAL_LINK,
    open: /\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9][\w.-]+\.(?:com|org|net|io|dev|co|uk|gov|edu|info|biz|app|ai)(?:\/[^\s<>"]*)?/g,
    close: undefined,
  },
  // Footnote reference: `[^id]` inline reference or `[^id]: text` definition line — atomic, no close.
  {
    type: ESpecialTagType.FOOTNOTE_REF,
    open: /\[\^([^\]]+)\]:?/g,
    close: undefined,
  },
];
