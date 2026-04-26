// ── Shared regex patterns used across the v2 styling-engine apply/remove paths.

/**
 * Captures a callout header with its full type bracket and optional title.
 * Group 1: full "(>{1,n}\s)+\[!type]" segment. Group 2: callout type. Group 3: optional title.
 */
export const CALLOUT_HEADER_WITH_TITLE_PATTERN = /^((?:>\s*)+\[!([^\]]+)\])(?:\s+(.+))?$/;

/** Matches a callout header line at any nesting depth. */
export const CALLOUT_HEADER_LINE_PATTERN = /^(?:>\s*)+\[!.*?\]/;

/** Matches one or more leading blockquote prefix segments (">" with optional space). */
export const LEADING_BLOCKQUOTE_SEGMENTS_PATTERN = /^(?:>\s*)+/;

/** Strips a single leading blockquote prefix (">") with optional trailing space. */
export const BLOCKQUOTE_PREFIX_PATTERN = /^>\s?/;

/** Matches a Markdown task list line regardless of check state, e.g. "- [ ] …". */
export const TASK_LINE_PATTERN = /^\s*-\s+\[.\]\s*/;

/**
 * Matches a Markdown task list item with full context.
 * Group 1: leading blockquote prefix. Group 2: indentation. Group 3: task content.
 */
export const TASK_LINE_WITH_CONTENT_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*(.*)$/;

/**
 * Matches a task content prefix — text before a colon at the start of task content.
 * Group 1: prefix including its colon (e.g. "Discuss:"). Group 2: content after the prefix.
 */
export const TASK_CONTENT_PREFIX_PATTERN = /^([^:\s][^:]*:)\s+(.*)/;

/** Matches inline `#todo` tags (case-insensitive, word boundary). */
export const INLINE_TODO_TAG_PATTERN = /#todo\b/gi;

/**
 * Matches a task marker for removal — captures the leading blockquote prefix and
 * indentation so they can be preserved when the marker itself is stripped.
 * Group 1: blockquote prefix. Group 2: indentation.
 */
export const TASK_MARKER_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*/;
