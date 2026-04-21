/**
 * Matches a callout header line, capturing the full type bracket and optional title.
 * Group 1: the full "[!type]" bracket including blockquote prefix.
 * Group 2: the callout type string.
 * Group 3: the optional title text after the bracket.
 */
export const CALLOUT_HEADER_WITH_TITLE_PATTERN = /^((?:>\s*)+\[!([^\]]+)\])(?:\s+(.+))?$/;

/** Matches one or more blockquote prefix segments (">" with optional trailing space). */
export const LEADING_BLOCKQUOTE_SEGMENTS_PATTERN = /^(?:>\s*)+/;

/**
 * Matches a Markdown task list item with its full context.
 * Group 1: leading blockquote prefix (may be empty).
 * Group 2: leading indentation (may be empty).
 * Group 3: the remaining task content after the "- [ ] " marker.
 */
export const TASK_LINE_WITH_CONTENT_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*(.*)$/;

/**
 * Matches a task content prefix — text before a colon at the start of task content.
 * Group 1: the prefix including its colon (e.g. "Discuss:").
 * Group 2: the content following the prefix.
 */
export const TASK_CONTENT_PREFIX_PATTERN = /^([^:\s][^:]*:)\s+(.*)/;
