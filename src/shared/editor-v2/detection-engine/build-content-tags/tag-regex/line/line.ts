import { ELineTagType } from '../../../../interfaces';

/**
 * Line prefix tags ordered by detection priority (highest first).
 * A callout `> [!type]` must be tested before a plain quote `> `.
 * A checkbox `- [ ] ` must be tested before a plain list `- `.
 */
export const LINE_TAG_REGEX = [
  // Callout open pattern — three alternatives:
  //   1. Single-depth opener (`>` not `>>`): captures `[!type]`, requires space/EOL after `]`.
  //      Match ends after the `]` — title text is NOT included in the match (extracted via titleRegex).
  //   2. Depth-1 continuation `>(?!>)`: preceded by a line that contains `[!`.
  //      Prevents plain blockquote lines from firing as callout continuations.
  //   3. Depth-2+ nested opener `>{2,}[!type]`: preceded by any `>` line (callout opener OR
  //      continuation). Allows `>> [!type]` after `> body` — the `[!type]` itself signals the
  //      intent so the lookbehind only needs to confirm we are inside a blockquote context.
  //      `>> plain text` is NOT matched here (no `[!type]`).
  {
    type: ELineTagType.CALLOUT,
    isHTML: false,
    // Match covers only the delimiter (`> [!note]` or `>>`), never the title text.
    // Title text is a separate property extracted via titleRegex.
    open: /^(?:>(?!>)[ \t]*\[!([^\]]+)\](?=[ \t]|$)|(?<=[^\n]*\[![^\n]*\n)>(?!>)|(?<=(?:^|\n)>[^\n]*\n)>{2,}[ \t]*\[!([^\]]+)\](?=[ \t]|$))/gm,
    // Captures the text after the LAST `[!type]` marker in the content (handles multi-line callout blocks).
    // `[\s\S]*` greedily skips over earlier lines so the match anchors to the last `[!type]` occurrence.
    // Strips any leading/trailing HTML tags and MD markers (`**`, `*`, `__`, `_`, `~~`, `==`) from the title.
    titleRegex: /[\s\S]*\[!(?:[^\]]+)\](?:[ \t]+(?:<[^>\n]+>|\*\*|\*|__|_|~~|==)*(.+?)(?:==|~~|\*\*|\*|__|_|<[^\n>]*>)*(?:\n|$))?/,
  },
  // Checkbox: `- [x] ` or `- [ ] ` — exactly one non-`^`/non-`!` character inside brackets.
  // `[^!^]` excludes footnote-like `[^]` and callout-like `[!]`.
  // Does NOT match `- []` (empty brackets) or `-[]` (no space before bracket).
  {
    type: ELineTagType.CHECKBOX,
    isHTML: false,
    open: /^-\s+\[[^!^]\]\s/gm,
    // Captures the task text after the marker; strips leading/trailing HTML tags and MD markers,
    // and strips a trailing `:` (task prefix pattern).
    titleRegex: /^-\s+\[.\]\s+(?:<[^>\n]+>|\*\*|\*|__|_|~~|==)*(.+?)(?:==|~~|\*\*|\*|__|_|<[^\n>]*>)*(?::)?$/,
  },
  // Plain list item — excludes valid checkbox bracket patterns; allows `- [^]` and `- [!]` as lists.
  // Leading tabs/spaces are allowed for nested list items: lookbehind `(?<=\n[ \t]*)` skips over them
  // so that `match[0]` captures only the `- ` marker, not the indentation.
  { type: ELineTagType.LIST, isHTML: false, open: /(?:^|(?<=\n[ \t]*))-[ \t]+(?!\[[^!^]\])/gm },
  // Heading: 1–6 `#` chars followed by a space.
  {
    type: ELineTagType.HEADING,
    isHTML: false,
    open: /^#{1,6}\s/gm,
    // Captures the heading text after the `#` prefix; strips leading/trailing HTML tags and MD markers.
    titleRegex: /^#{1,6}\s+(?:<[^>\n]+>|\*\*|\*|__|_|~~|==)*(.+?)(?:==|~~|\*\*|\*|__|_|<[^\n>]*>)*$/,
  },
  // Blockquote: matches only the `>+` depth markers — trailing space is NOT captured.
  // Four arms (tried in order for each line-start position):
  //   1. `(?<!callout-line)>{2,}(?![ \t]*\[!)` — depth-2+ not after a callout line and not a
  //      nested callout opener: always QUOTE. The `(?![ \t]*\[!)` lookahead prevents consuming
  //      `>> [!type]` lines that CALLOUT ARM 3 should own.
  //   1b. `(?<!any->-line)>{2,}(?=[ \t]*\[!)` — depth-2+ NOT preceded by any `>` line but IS
  //      followed by `[!type]`: QUOTE (isolated `>> [!type]` outside any blockquote context).
  //      CALLOUT ARM 3 requires a preceding `>` line, so this arm safely handles the gap.
  //   2. `(?<=(^|\n)>(?!>)...\\n)>{2,}(?![ \t]*\[!)` — depth-2+ after a DEPTH-1 callout line
  //      and NOT followed by `[!type]`: QUOTE (plain nested blockquote inside a depth-1 callout).
  //   3. `(?<!callout-line)>(?!>)(?![ \t]*\[!)` — depth-1 not after a callout line, not the
  //      first `>` of a `>>` sequence, and not a callout opener: QUOTE.
  //      `(?!>)` prevents ARM 3 from firing on `>> [!type]` when ARM 1 is blocked by its
  //      `(?![ \t]*\[!)` lookahead — without it, ARM 3 would consume the first `>` of `>>`.
  //      (depth-1 after a callout line is a CALLOUT continuation.)
  // `gm` flags: `g` iterates all matches, `m` allows `^` to match each line start.
  { type: ELineTagType.QUOTE, isHTML: false, open: /^(?:(?<!>[^\n]*\[![^\n]*\n)>{2,}(?![ \t]*\[!)|(?<!>[^\n]*\n)>{2,}(?=[ \t]*\[!)|(?<=(?:^|\n)>(?!>)[^\n]*\[![^\n]*\n)>{2,}(?![ \t]*\[!)|(?<!>[^\n]*\[![^\n]*\n)>(?!>)(?![ \t]*\[!))/gm },
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
    isHTML: false,
    open: /(?<=[^\n]\n)(?<!^---\n)(?<!^---\n[\s\S]*-{3,}\n)(?:\t+(?:<span\s+style="[^"]*margin-left:[^"]*">)?|(?:[ ]{4})+(?:<span\s+style="[^"]*margin-left:[^"]*">)?)/g,
  },
  // Horizontal rule: three or more dashes on their own line, surrounded by newlines.
  // The negative lookbehind `(?<!^---\n(?:\w+:[^\n]*\n)+)` prevents matching the closing `---`
  // of a meeting-details / front-matter block, which is always preceded by `---\n` + YAML lines.
  { type: ELineTagType.DIVIDER, isHTML: false, open: /(?<!^---\n(?:\w+:[^\n]*\n)*\w+:[^\n]*)\n---+\n/gm },
];
