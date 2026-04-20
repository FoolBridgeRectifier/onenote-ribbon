import type { Editor } from 'obsidian';
import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from '../../../constants';
import {
  TASK_LINE_PATTERN,
  HIGHLIGHT_PATTERN,
  CALLOUT_HEADER_PATTERN,
  TASK_PREFIX_PATTERN,
} from '../../constants';

/**
 * Detects which OneNote-style tag types are currently active at the editor cursor.
 * Returns a Set of active tag keys (task, highlight, callout type/title strings).
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
