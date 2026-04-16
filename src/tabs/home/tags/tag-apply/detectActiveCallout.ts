import type { Editor } from 'obsidian';

import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from '../constants';

/** Matches a Markdown task list item regardless of check state, e.g. "- [ ] …" or "  - [x] …". */
const TASK_LINE_PATTERN = /^\s*-\s+\[.\]\s*/;

/** Obsidian highlight markers spanning at least one character. */
const HIGHLIGHT_PATTERN = /==.+?==/;

/**
 * Matches a callout header line and captures both the type and the optional title.
 * Group 1: callout type (e.g. "tip")
 * Group 2: title text after [!type] (e.g. "Book to read"), or undefined if absent
 */
const CALLOUT_HEADER_PATTERN = /^>\s*\[!(\w+)\](?:\s+(.+))?/;

/**
 * Matches a task prefix — the text before a colon at the start of task content.
 * Used to identify specific task-type tags (e.g. "P2:" in "- [ ] P2: content").
 * Group 1: the prefix including its trailing colon (e.g. "P2:").
 */
const TASK_PREFIX_PATTERN = /^\s*-\s+\[.\]\s+([^:\s][^:]*:)/;

/**
 * Detects which OneNote-style tag types are currently active at the editor cursor.
 *
 * Returns a Set containing:
 * - `"__task__"`                when the cursor is on a task-list line
 * - `"task-prefix:P2:"`         when the task line has a recognised prefix (e.g. P2:)
 * - `"__highlight__"`           when the cursor line contains ==…== markers
 * - A callout title string      when the cursor is inside a callout with a title
 *                               (e.g. "Important", "Book to read")
 * - A callout type string       when the callout has no title (fallback, e.g. "tip")
 *
 * Returns an empty Set when `editor` is null.
 */
export function detectActiveTagKeys(editor: Editor | null): Set<string> {
  const activeKeys = new Set<string>();

  if (!editor) return activeKeys;

  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  // Strip a leading "> " prefix so task and highlight patterns work inside callout blocks
  const lineContent = currentLine.replace(/^>\s?/, '');

  if (TASK_LINE_PATTERN.test(lineContent)) {
    activeKeys.add(ACTIVE_TAG_KEY_TASK);

    // Add a prefix-specific key so individual task tags can be identified
    const prefixMatch = lineContent.match(TASK_PREFIX_PATTERN);
    if (prefixMatch) {
      activeKeys.add(`task-prefix:${prefixMatch[1].trim()}`);
    }
  }

  if (HIGHLIGHT_PATTERN.test(lineContent)) {
    activeKeys.add(ACTIVE_TAG_KEY_HIGHLIGHT);
  }

  // Only callout blocks start lines with ">"; no need to scan otherwise
  if (!currentLine.startsWith('>')) return activeKeys;

  // Scan upward from the cursor line to find the callout header
  for (let lineIndex = cursor.line; lineIndex >= 0; lineIndex -= 1) {
    const lineText = editor.getLine(lineIndex);

    const calloutHeaderMatch = lineText.match(CALLOUT_HEADER_PATTERN);
    if (calloutHeaderMatch) {
      const calloutType = calloutHeaderMatch[1].toLowerCase();
      const calloutTitle = calloutHeaderMatch[2]?.trim();

      // Prefer title-based detection for specificity; fall back to type
      activeKeys.add(calloutTitle ?? calloutType);
      break;
    }

    // If we hit a line that doesn't start with ">", we've left the block
    if (!lineText.startsWith('>')) break;
  }

  return activeKeys;
}
