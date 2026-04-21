import type { Editor } from 'obsidian';

import {
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  LEADING_BLOCKQUOTE_SEGMENTS_PATTERN,
  TASK_LINE_WITH_CONTENT_PATTERN,
  TASK_CONTENT_PREFIX_PATTERN,
} from './constants';
import { countBlockquoteDepth } from './helpers/countBlockquoteDepth';

function stripLeadingBlockquoteSegments(lineText: string): string {
  return lineText.replace(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN, '').trimStart();
}

function stripTaskPrefix(taskContent: string): string {
  const prefixMatch = taskContent.match(TASK_CONTENT_PREFIX_PATTERN);
  if (!prefixMatch) return taskContent;
  // group 2 is the content following the prefix and its colon
  return prefixMatch[2];
}

/**
 * Wraps the cursor line in an Obsidian callout block.
 * If the line is already inside a callout, nests the new callout one level deeper.
 */
export function applyCallout(editor: Editor, calloutType: string, calloutTitle?: string): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);

  const currentDepth = countBlockquoteDepth(lineContent);
  const nestedDepth = currentDepth > 0 ? currentDepth + 1 : 1;
  const nestedPrefix = '>'.repeat(nestedDepth);

  const bodyContent =
    currentDepth > 0 ? stripLeadingBlockquoteSegments(lineContent) : lineContent;

  const titleSegment = calloutTitle ? ` ${calloutTitle}` : '';
  editor.setLine(
    cursor.line,
    `${nestedPrefix} [!${calloutType}]${titleSegment}\n${nestedPrefix} ${bodyContent}`
  );

  // Move cursor to the body line so that a subsequent applyCallout nests inside this
  // callout's body rather than wrapping the header line with an extra '>'.
  editor.setCursor({ line: cursor.line + 1, ch: nestedPrefix.length + 1 });
}

/**
 * Converts the cursor line into a Markdown task list item with the given prefix.
 * Handles cursor-in-callout-title extraction and re-stamping of existing task lines.
 */
export function applyTask(editor: Editor, taskPrefix: string): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);
  const prefixSegment = taskPrefix ? `${taskPrefix} ` : '';

  const calloutHeaderMatch = lineContent.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
  if (calloutHeaderMatch) {
    const headerWithoutTitle = calloutHeaderMatch[1];
    const calloutTitle = calloutHeaderMatch[3]?.trim() ?? '';
    const titleStartIndex = lineContent.indexOf(calloutTitle);
    // title always ends the callout header line, so line end is the safe upper bound
    const cursorIsInCalloutTitle =
      calloutTitle.length > 0 &&
      titleStartIndex >= 0 &&
      cursor.ch >= titleStartIndex &&
      cursor.ch <= lineContent.length;

    if (cursorIsInCalloutTitle) {
      // Extract the blockquote prefix from the header (e.g. "> " from "> [!note]")
      // so the new task body line sits correctly inside the same callout nesting level.
      const headerBlockquoteMatch = headerWithoutTitle.match(/^((?:>\s*)+)/);
      const headerBlockquotePrefix = headerBlockquoteMatch ? headerBlockquoteMatch[1] : '> ';

      // Insert a blank task body line below the header, leaving the title intact.
      editor.setLine(cursor.line, `${lineContent}\n${headerBlockquotePrefix}- [ ] ${prefixSegment}`);

      // Park cursor at the end of the new task body line, ready for typing.
      const taskBodyColumn = headerBlockquotePrefix.length + '- [ ] '.length + prefixSegment.length;
      editor.setCursor({ line: cursor.line + 1, ch: taskBodyColumn });
      return;
    }
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

  // Strip any leading blockquote segments (e.g. "> " or ">> ") so that
  // the task marker is inserted after the quote prefix, not before it.
  const leadingBlockquoteMatch = lineContent.match(/^((?:>\s*)+)/);
  const blockquotePrefix = leadingBlockquoteMatch ? leadingBlockquoteMatch[1] : '';
  const plainContent = blockquotePrefix
    ? lineContent.slice(blockquotePrefix.length)
    : lineContent;

  editor.setLine(cursor.line, `${blockquotePrefix}- [ ] ${prefixSegment}${plainContent}`);
}
