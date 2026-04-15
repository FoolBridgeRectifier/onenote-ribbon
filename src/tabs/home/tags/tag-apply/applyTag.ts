import type { Editor } from 'obsidian';

import type { TagAction } from '../interfaces';

/**
 * Applies a tag action to the active editor.
 *
 * - `command`: delegates to the provided `executeCommand` callback and returns
 *   immediately (no editor required).
 * - `callout`: wraps the cursor line with an Obsidian callout block.
 * - `task`:    converts the cursor line into a Markdown task list item.
 * - `highlight`: wraps the current selection (or full line) with `==…==`.
 */
export function applyTag(
  editor: Editor | null,
  action: TagAction,
  executeCommand: (commandId: string) => void,
): void {
  if (action.type === 'command') {
    executeCommand(action.commandId);
    return;
  }

  if (!editor) return;

  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);

  if (action.type === 'callout') {
    editor.setLine(cursor.line, `> [!${action.calloutType}]\n> ${lineContent}`);
    return;
  }

  if (action.type === 'task') {
    const prefixSegment = action.taskPrefix ? `${action.taskPrefix} ` : '';
    editor.setLine(cursor.line, `- [ ] ${prefixSegment}${lineContent}`);
    return;
  }

  // highlight: wrap selection or full line
  if (action.type === 'highlight') {
    const selection = editor.getSelection();

    if (selection) {
      editor.replaceSelection(`==${selection}==`);
    } else {
      editor.setLine(cursor.line, `==${lineContent}==`);
    }
  }
}
