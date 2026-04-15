import type { Editor } from 'obsidian';

import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from '../constants';

/** Matches a Markdown task list item regardless of check state, e.g. "- [ ] …" or "  - [x] …". */
const TASK_LINE_PATTERN = /^\s*-\s+\[.\]\s*/;

/** Matches Obsidian highlight markers spanning at least one character. */
const HIGHLIGHT_PATTERN = /==.+?==/;

/** Captures the callout type from a callout header line, e.g. "> [!tip] My Title". */
const CALLOUT_HEADER_PATTERN = /^>\s*\[!(\w+)\]/;

/**
 * Detects which OneNote-style tag types are currently active at the editor cursor.
 *
 * Returns a Set containing:
 * - `"__task__"`        when the cursor is on a task-list line
 * - `"__highlight__"`   when the cursor line contains ==…== markers
 * - A callout type key  when the cursor is inside an Obsidian callout block
 *                       (e.g. "important", "tip", "question")
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

    // Also emit a prefix-specific key so that named task tags (e.g. "P1:", "P2:")
    // can be matched individually without every task tag lighting up at once.
    const taskBody = lineContent.replace(TASK_LINE_PATTERN, '');
    const colonIndex = taskBody.indexOf(':');
    if (colonIndex > 0) {
      const prefix = taskBody.slice(0, colonIndex).trim();
      if (prefix) {
        activeKeys.add(`${ACTIVE_TAG_KEY_TASK}:${prefix}`);
      }
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
      activeKeys.add(calloutHeaderMatch[1].toLowerCase());
      break;
    }

    // If we hit a line that doesn't start with ">", we've left the block
    if (!lineText.startsWith('>')) break;
  }

  return activeKeys;
}
