/** Matches inline #todo tags (case-insensitive, word boundary). */
export const INLINE_TODO_TAG_PATTERN = /#todo\b/gi;

/** Matches a Markdown task list item regardless of check state, e.g. "- [ ] …" or "  - [x] …". */
export const TASK_LINE_PATTERN = /^\s*-\s+\[.\]\s*/;

/** Obsidian highlight markers spanning at least one character. */
export const HIGHLIGHT_PATTERN = /==.+?==/;

/**
 * Matches a callout header line and captures both the type and the optional title.
 * Group 1: callout type (e.g. "tip")
 * Group 2: title text after [!type] (e.g. "Book to read"), or undefined if absent
 */
export const CALLOUT_HEADER_PATTERN = /^>\s*\[!(\w+)\](?:\s+(.+))?/;

/**
 * Matches a task prefix — the text before a colon at the start of task content.
 * Used to identify specific task-type tags (e.g. "P2:" in "- [ ] P2: content").
 */
export const TASK_CONTENT_PREFIX_PATTERN = /^([^:\s][^:]*:)\s+(.*)/;

/** Matches a callout header line, e.g. "> [!tip]" or "> [!WARNING] Optional title". */
export const CALLOUT_HEADER_LINE_PATTERN = /^>\s*\[!.*?\]/;

/** Strips the blockquote prefix (">" with optional space) from a continuation line. */
export const BLOCKQUOTE_PREFIX_PATTERN = /^>\s?/;

/** Matches a task prefix marker including optional blockquote prefix and indentation. */
export const TASK_MARKER_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*/;

/**
 * Matches a task prefix — the text before a colon at the start of task content.
 * Group 1: the prefix including its trailing colon (e.g. "P2:").
 */
export const TASK_PREFIX_PATTERN = /^\s*-\s+\[.\]\s+([^:\s][^:]*:)/;

// applyTag.ts constants
export const CALLOUT_HEADER_WITH_TITLE_PATTERN = /^((?:>\s*)+\[!([^\]]+)\])(?:\s+(.+))?$/;
export const LEADING_BLOCKQUOTE_SEGMENTS_PATTERN = /^(?:>\s*)+/;
export const TASK_LINE_WITH_CONTENT_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*(.*)$/;
