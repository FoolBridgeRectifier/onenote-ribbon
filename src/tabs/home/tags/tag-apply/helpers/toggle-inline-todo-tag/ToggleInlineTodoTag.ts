import type { Editor } from 'obsidian';
import { INLINE_TODO_TAG_PATTERN } from '../../constants';
import type { TodoTagMatch } from '../../interfaces';

function findTodoTagAtCursor(lineText: string, cursorCh: number): TodoTagMatch | null {
  for (const tagMatch of lineText.matchAll(INLINE_TODO_TAG_PATTERN)) {
    const startIndex = tagMatch.index ?? -1;
    const matchedText = tagMatch[0];

    if (startIndex < 0) continue;

    const endIndex = startIndex + matchedText.length;
    if (cursorCh >= startIndex && cursorCh <= endIndex) {
      return { startIndex, endIndex };
    }
  }

  return null;
}

function removeTodoTagFromLine(lineText: string, todoTagMatch: TodoTagMatch): string {
  const beforeTag = lineText.slice(0, todoTagMatch.startIndex);
  let afterTag = lineText.slice(todoTagMatch.endIndex);

  if (beforeTag.endsWith(' ') && afterTag.startsWith(' ')) {
    afterTag = afterTag.slice(1);
  }

  return `${beforeTag}${afterTag}`;
}

/**
 * Toggles the inline #todo tag at cursor/selection.
 * If selection is "#todo", removes it. If cursor is inside "#todo", removes it.
 * Otherwise inserts "#todo" at cursor.
 */
export function toggleInlineTodoTag(editor: Editor): void {
  const selection = editor.getSelection();

  if (selection.length > 0) {
    editor.replaceSelection(selection === '#todo' ? '' : '#todo');
    return;
  }

  const cursor = editor.getCursor();
  const lineText = editor.getLine(cursor.line);
  const todoTagMatch = findTodoTagAtCursor(lineText, cursor.ch);

  if (!todoTagMatch) {
    editor.replaceSelection('#todo');
    return;
  }

  editor.setLine(cursor.line, removeTodoTagFromLine(lineText, todoTagMatch));
}
