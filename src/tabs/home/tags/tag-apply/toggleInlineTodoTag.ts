import type { Editor } from 'obsidian';

const INLINE_TODO_TAG_PATTERN = /#todo\b/gi;

interface TodoTagMatch {
  startIndex: number;
  endIndex: number;
}

function findTodoTagAtCursor(
  lineText: string,
  cursorCh: number,
): TodoTagMatch | null {
  for (const tagMatch of lineText.matchAll(INLINE_TODO_TAG_PATTERN)) {
    const startIndex = tagMatch.index ?? -1;
    const matchedText = tagMatch[0];

    if (startIndex < 0) {
      continue;
    }

    const endIndex = startIndex + matchedText.length;
    if (cursorCh >= startIndex && cursorCh <= endIndex) {
      return { startIndex, endIndex };
    }
  }

  return null;
}

function removeTodoTagFromLine(
  lineText: string,
  todoTagMatch: TodoTagMatch,
): string {
  const beforeTag = lineText.slice(0, todoTagMatch.startIndex);
  let afterTag = lineText.slice(todoTagMatch.endIndex);

  if (beforeTag.endsWith(' ') && afterTag.startsWith(' ')) {
    afterTag = afterTag.slice(1);
  }

  return `${beforeTag}${afterTag}`;
}

/**
 * Toggles the inline #todo tag at cursor/selection.
 *
 * - If selection is exactly "#todo", remove it
 * - If cursor is inside an existing "#todo" token, remove that token
 * - Otherwise insert/replace with "#todo"
 */
export function toggleInlineTodoTag(editor: Editor): void {
  const selection = editor.getSelection();

  if (selection.length > 0) {
    if (selection === '#todo') {
      editor.replaceSelection('');
      return;
    }

    editor.replaceSelection('#todo');
    return;
  }

  const cursor = editor.getCursor();
  const lineText = editor.getLine(cursor.line);
  const todoTagMatch = findTodoTagAtCursor(lineText, cursor.ch);

  if (!todoTagMatch) {
    editor.replaceSelection('#todo');
    return;
  }

  const updatedLine = removeTodoTagFromLine(lineText, todoTagMatch);
  editor.setLine(cursor.line, updatedLine);
}
