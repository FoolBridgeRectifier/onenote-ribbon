import type { ObsidianEditor } from '../../interfaces';

import { TASK_MARKER_PATTERN } from '../constants';

/**
 * Removes the Markdown checkbox marker from the cursor line, preserving
 * the leading blockquote prefix (group 1) and indentation (group 2).
 *
 * Examples: "- [ ] task" → "task"; "  - [x] task" → "  task"; "> - [ ] x" → "> x".
 * No-op when the line has no checkbox marker.
 */
export function removeActiveCheckbox(editor: ObsidianEditor): void {
  const cursor = editor.getCursor();
  const lineText = editor.getLine(cursor.line);

  const updatedLine = lineText.replace(TASK_MARKER_PATTERN, '$1$2');
  if (updatedLine === lineText) return;

  editor.setLine(cursor.line, updatedLine);
}
