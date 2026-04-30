import { ELineTagType } from '../../../interfaces';

/**
 * Line prefix tags ordered by detection priority (highest first).
 * A callout `> [!type]` must be tested before a plain quote `> `.
 * A checkbox `- [ ] ` must be tested before a plain list `- `.
 */
export const LINE_TAG_REGEX = [
  // Callout: matches the `>+` depth prefix and `[!type]` marker only. Body text and continuation lines are not captured.
  { type: ELineTagType.CALLOUT, open: /^(>+)\s*\[!([^\]]+)\]/ },
  // Checkbox: `- [x] ` or `- [ ] ` — exactly one character inside brackets, trailing space.
  // Does NOT match `- []` (empty brackets) or `-[]` (no space before bracket).
  { type: ELineTagType.CHECKBOX, open: /^-\s+\[.\]\s/ },
  // Plain list item — must not look like a checkbox (any single-char bracket pattern).
  { type: ELineTagType.LIST, open: /^-\s+(?!\[.\])/ },
  // Heading: 1–6 `#` chars followed by a space.
  { type: ELineTagType.HEADING, open: /^#{1,6}\s/ },
  // Blockquote: matches the `>+` depth prefix only. Body text is not captured.
  // Disambiguation from callout relies on CALLOUT being ordered first in this array.
  { type: ELineTagType.QUOTE, open: /^(>+)[ \t]?(?!\[!)/ },
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
    open: /(?<=[^\n]\n)(?<!^---\n)(?<!^---\n[\s\S]*-{3,}\n)(?:\t+(?:<span\s+style="[^"]*margin-left:[^"]*">)?|(?:[ ]{4})+(?:<span\s+style="[^"]*margin-left:[^"]*">)?)/,
  },
];
