// ── Active tag detection sentinel keys ──────────────────────────────────────

/** Sentinel key indicating the cursor is on a task list line. */
export const ACTIVE_TAG_KEY_TASK = '__task__' as const;

/** Sentinel key indicating the cursor line contains ==highlight== markers. */
export const ACTIVE_TAG_KEY_HIGHLIGHT = '__highlight__' as const;

// ── Detection patterns (used by detectActiveTagKeys) ─────────────────────────

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
export const TASK_PREFIX_PATTERN = /^\s*-\s+\[.\]\s+([^:\s][^:]*:)/;

// ── Callout-removal patterns (used by removeActiveCallout) ───────────────────

/**
 * Matches a callout header line at any nesting depth.
 * Uses `(?:>\s*)+` so it handles both single-level (`> [!tip]`) and nested
 * callouts produced by the plugin (`>> [!important]`, `>>> [!note]`).
 */
export const CALLOUT_HEADER_LINE_PATTERN = /^(?:>\s*)+\[!.*?\]/;

/** Strips the blockquote prefix (">") with optional space from a continuation line. */
export const BLOCKQUOTE_PREFIX_PATTERN = /^>\s?/;

// ── Checkbox-removal pattern (used by removeActiveCheckbox) ──────────────────

/** Matches a task prefix marker including optional blockquote prefix and indentation. */
export const TASK_MARKER_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*/;

// ── applyTag patterns ────────────────────────────────────────────────────────

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
