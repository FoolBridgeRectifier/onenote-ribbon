import type { ObsidianEditor } from '../../interfaces';

import {
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  TASK_LINE_WITH_CONTENT_PATTERN,
  TASK_CONTENT_PREFIX_PATTERN,
} from '../constants';

/** Strips a "Word:" content prefix from existing task content, if present. */
function stripTaskPrefix(taskContent: string): string {
  const prefixMatch = taskContent.match(TASK_CONTENT_PREFIX_PATTERN);
  if (!prefixMatch) return taskContent;
  // Group 2 is the content following the prefix and its colon.
  return prefixMatch[2];
}

/**
 * Converts the cursor line into a Markdown task list item with the given prefix.
 *
 * Three cases are handled:
 *   1. Cursor on a callout header line — append a blank task body line below the header.
 *   2. Cursor on an existing task line — re-stamp the prefix in place.
 *   3. Cursor on a plain (or blockquote-prefixed) line — convert it to a task list item.
 */
export function applyTask(editor: ObsidianEditor, taskPrefix: string): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);
  const prefixSegment = taskPrefix ? `${taskPrefix} ` : '';

  const calloutHeaderMatch = lineContent.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
  if (calloutHeaderMatch) {
    // Extract the blockquote prefix from the header so the new task line sits inside the same callout.
    const headerWithoutTitle = calloutHeaderMatch[1];
    const headerBlockquoteMatch = headerWithoutTitle.match(/^((?:>\s*)+)/);
    const headerBlockquotePrefix = headerBlockquoteMatch ? headerBlockquoteMatch[1] : '> ';

    editor.setLine(
      cursor.line,
      `${lineContent}\n${headerBlockquotePrefix}- [ ] ${prefixSegment}`
    );

    // Park cursor at the end of the new task body line, ready for typing.
    const taskBodyColumn = headerBlockquotePrefix.length + '- [ ] '.length + prefixSegment.length;
    editor.setCursor({ line: cursor.line + 1, ch: taskBodyColumn });
    return;
  }

  const existingTaskMatch = lineContent.match(TASK_LINE_WITH_CONTENT_PATTERN);
  if (existingTaskMatch) {
    const blockquotePrefix = existingTaskMatch[1];
    const indentation = existingTaskMatch[2];
    const existingTaskContent = existingTaskMatch[3];
    const contentWithoutTaskPrefix = stripTaskPrefix(existingTaskContent);

    editor.setLine(
      cursor.line,
      `${blockquotePrefix}${indentation}- [ ] ${prefixSegment}${contentWithoutTaskPrefix}`
    );
    return;
  }

  // Strip any leading blockquote segments so the task marker is inserted after the quote prefix.
  const leadingBlockquoteMatch = lineContent.match(/^((?:>\s*)+)/);
  const blockquotePrefix = leadingBlockquoteMatch ? leadingBlockquoteMatch[1] : '';
  const plainContent = blockquotePrefix ? lineContent.slice(blockquotePrefix.length) : lineContent;

  editor.setLine(cursor.line, `${blockquotePrefix}- [ ] ${prefixSegment}${plainContent}`);
}
