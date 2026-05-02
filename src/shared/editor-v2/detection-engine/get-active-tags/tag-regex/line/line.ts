import { ELineTagType } from '../../../../interfaces';

/**
 * Line prefix tags ordered by detection priority (highest first).
 * A callout `> [!type]` must be tested before a plain quote `> `.
 * A checkbox `- [ ] ` must be tested before a plain list `- `.
 */
export const LINE_TAG_REGEX = [
  // Callout open pattern — two alternatives:
  //   1. Single-depth opener (`>` not `>>`): captures `[!type]`, requires space/EOL after `]`
  //      to reject attached text like `[!note]Title`, then captures optional title to end of line.
  //   2. Continuation / nested line (`>+` preceded by a non-empty line via lookbehind): matches
  //      any subsequent `>+` line, optionally followed by a nested `[!type]` marker + title.
  // Standalone `>> [!type]` (no preceding line) does NOT match — only single-depth starts a callout.
  {
    type: ELineTagType.CALLOUT,
    // `[ \t]` (not `\s`) for the title separator — prevents `\n` from being consumed into the match.
    open: /^(?:>(?!>)\s*\[!([^\]]+)\](?=[ \t]|$)(?:[ \t][^\n]*)?|(?<=[^\n]+\n)>+(?:\s*\[!([^\]]+)\](?=[ \t]|$)(?:[ \t][^\n]*)?)?)/gm,
  },
  // Checkbox: `- [x] ` or `- [ ] ` — exactly one non-`^`/non-`!` character inside brackets.
  // `[^!^]` excludes footnote-like `[^]` and callout-like `[!]`.
  // Does NOT match `- []` (empty brackets) or `-[]` (no space before bracket).
  { type: ELineTagType.CHECKBOX, open: /^-\s+\[[^!^]\]\s/g },
  // Plain list item — excludes valid checkbox bracket patterns; allows `- [^]` and `- [!]` as lists.
  // Leading tabs/spaces are allowed for nested list items: lookbehind `(?<=\n[ \t]*)` skips over them
  // so that `match[0]` captures only the `- ` marker, not the indentation.
  { type: ELineTagType.LIST, open: /(?:^|(?<=\n[ \t]*))-[ \t]+(?!\[[^!^]\])/gm },
  // Heading: 1–6 `#` chars followed by a space.
  { type: ELineTagType.HEADING, open: /^#{1,6}\s/g },
  // Blockquote: matches only the `>+` depth markers — trailing space is NOT captured.
  // `(?![ \t]?\[!)` excludes callout lines (`> [!type]`) even when there is a space before `[!`.
  // A depth-1 `>` that immediately follows a callout opener line is a callout continuation — excluded
  // via `(?<!>[^\n]*\[![^\n]*\n)`. Depth-2+ `>>` is treated as a nested quote even inside a callout.
  // `gm` flags: `g` iterates all matches, `m` allows `^` to match each line start.
  { type: ELineTagType.QUOTE, open: /^(?:>{2,}|(?<!>[^\n]*\[![^\n]*\n)>)(?![ \t]?\[!)/gm },
  // Indent: must be preceded by a non-empty content line (`[^\n]\n`).
  // Never matches at document start or after a blank line (those cases are tab-code).
  // Also never matches when the document starts with `---\n` (frontmatter / meeting-details):
  //   - `(?<!^---\n)` blocks when `\t` appears directly after the opening `---` delimiter.
  //   - `(?<!^---\n[\s\S]*-{3,}\n)` blocks when a `---`-started block closes with any `-{3,}` line.
  // Mid-document `---` (horizontal rule) does NOT block indent — the `^` anchor is key.
  // HTML indentation uses `\t` + `<span style="margin-left:...">` because tabs alone don't render in HTML.
  // The open delimiter ends at `>` when the span is present. Body text is not captured.
  {
    type: ELineTagType.INDENT,
    open: /(?<=[^\n]\n)(?<!^---\n)(?<!^---\n[\s\S]*-{3,}\n)(?:\t+(?:<span\s+style="[^"]*margin-left:[^"]*">)?|(?:[ ]{4})+(?:<span\s+style="[^"]*margin-left:[^"]*">)?)/g,
  },
];
