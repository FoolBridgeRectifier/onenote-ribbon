/** Active-tag key sentinel for the "task line at cursor" indicator. */
export const ACTIVE_TAG_KEY_TASK = '__task__' as const;

/** Active-tag key sentinel for the "highlight on cursor line" indicator. */
export const ACTIVE_TAG_KEY_HIGHLIGHT = '__highlight__' as const;

/** Matches a markdown task list line: `- [ ] body` or `- [x] body`. */
export const TASK_LINE_PATTERN = /^\s*-\s+\[.\]\s*/;

/** Matches `==highlight==` markdown highlight syntax. */
export const HIGHLIGHT_PATTERN = /==.+?==/;

/** Captures the optional `Prefix:` segment that follows a task checkbox. */
export const TASK_PREFIX_PATTERN = /^\s*-\s+\[.\]\s+([^:\s][^:]*:)/;

/**
 * Captures a callout header line. Group 1 = the `> ... [!type]` opening segment,
 * group 2 = the callout type (lowercased by caller), group 3 = optional title.
 */
// Trailing `\s*` before `$` allows lines with no title but trailing whitespace (e.g. `> [!warning]\t`).
export const CALLOUT_HEADER_WITH_TITLE_PATTERN = /^((?:>\s*)+\[!([^\]]+)\])(?:\s+(.+))?\s*$/;

/** Matches the leading `> > >` blockquote segments at the start of a line. */
export const LEADING_BLOCKQUOTE_SEGMENTS_PATTERN = /^(?:>\s*)+/;
