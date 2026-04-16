import type { Editor } from 'obsidian';

const TASK_MARKER_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*/;

/**
 * Removes the markdown checkbox marker from the current line.
 *
 * Examples:
 * - "- [ ] task" -> "task"
 * - "  - [x] task" -> "  task"
 * - "> - [ ] task" -> "> task"
 */
export function removeActiveCheckbox(editor: Editor): void {
  const cursor = editor.getCursor();
  const lineText = editor.getLine(cursor.line);

  const updatedLine = lineText.replace(TASK_MARKER_PATTERN, '$1$2');

  if (updatedLine === lineText) {
    return;
  }

  editor.setLine(cursor.line, updatedLine);
}
