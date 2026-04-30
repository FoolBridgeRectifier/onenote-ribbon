import { ESpecialTagType } from '../../../interfaces';

/**
 * Special tags.
 * - Delimited tokens (inline code, fenced code): separate `open` / `close` patterns.
 * - Atomic tokens (wikilinks, embeds, todos, etc.): `open` matches the whole token,
 *   `close` is null.
 * Embed must appear before wikilink so `![[` is consumed before `[[` is tried.
 */
export const SPECIAL_TAG_REGEX = [
  // Fenced code block: 3+ backticks at line start (4+ backticks also treated as fence).
  // Matches only the backtick delimiter — language hint and body text are not captured.
  // Must NOT open inside inline code or a tab-indented code block.
  {
    type: ESpecialTagType.CODE,
    open: /^`{3,}/m,
    close: /^\s*`{3,}\s*$/m,
  },
  // Tab-indented code block: atomic — opens at document start (`^`), after a blank line (`(?<=\n\n)`),
  // or directly after a `---`-based frontmatter / meeting-details block at document start.
  //   - `(?<=^---\n)` covers `---\n\t...` (indent immediately after opening delimiter).
  //   - `(?<=^---\n[\s\S]*-{3,}\n)` covers full frontmatter/meeting-details closed by `-{3,}`.
  // These are the mirror of the INDENT lookbehind exclusions.
  // Must NOT open inside a fenced code block.
  // Matches only the leading tab/space prefix — body text is not captured.
  {
    type: ESpecialTagType.CODE,
    open: /(?:^|(?<=\n\n)|(?<=^---\n)|(?<=^---\n[\s\S]*-{3,}\n))(?:\t+|(?:[ ]{4})+)/,
    close: null,
  },
  // Inline code: opens with `` ` `` and closes with matching `` ` ``.
  // Unclosed-backtick fallback is handled by the tag parser, not by a global `$` regex.
  // Must NOT open inside a fenced code block or a tab-indented code block.
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
  // Wikilink `[[...]]` or bare `[text]` not followed by `(`.
  // Excludes footnote refs (`[^id]`), callout markers (`[!note]`), and list/checkbox brackets
  // preceded by a dash (e.g. `- [x]`, `- [[link]]`).
  {
    type: ESpecialTagType.WIKILINK,
    // `(?<!-[ \t]*)` — blocks when preceded by list/checkbox dash (e.g. `- [x]`, `- [[link]]`).
    // `(?<!\[)` — blocks matching the bare-link alternative at the inner `[` of a `[[...]]` wikilink
    //             that was itself blocked by the dash lookbehind (e.g. position 3 of `- [[Page Name]]`).
    open: /(?<!-[ \t]*)(?<!\[)(?:\[\[([^\]]+)\]\]|\[(?![\^!])([^\]]+)\](?!\())/,
    close: null,
  },
  // External URL: markdown link `[text](url)`, protocol URLs (https?://), www., or bare domains with common TLDs.
  {
    type: ESpecialTagType.EXTERNAL_LINK,
    open: /\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9][\w.-]+\.(?:com|org|net|io|dev|co|uk|gov|edu|info|biz|app|ai)(?:\/[^\s<>"]*)?/,
    close: null,
  },
  // Footnote reference: `[^id]` inline reference or `[^id]: text` definition line — atomic, no close.
  {
    type: ESpecialTagType.FOOTNOTE_REF,
    open: /\[\^([^\]]+)\]:?/,
    close: null,
  },
];
