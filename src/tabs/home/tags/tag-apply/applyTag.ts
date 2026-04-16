import type { Editor } from 'obsidian';

import type { TagAction } from '../interfaces';

const CALLOUT_HEADER_WITH_TITLE_PATTERN =
  /^((?:>\s*)+\[!([^\]]+)\])(?:\s+(.+))?$/;
const LEADING_BLOCKQUOTE_SEGMENTS_PATTERN = /^(?:>\s*)+/;
const TASK_LINE_WITH_CONTENT_PATTERN = /^((?:>\s*)*)(\s*)-\s+\[[ xX]\]\s*(.*)$/;
const TASK_CONTENT_PREFIX_PATTERN = /^([^:\s][^:]*:)\s+(.*)$/;

function getBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);

  if (!prefixMatch) {
    return 0;
  }

  return prefixMatch[0].split('>').length - 1;
}

function stripLeadingBlockquoteSegments(lineText: string): string {
  return lineText.replace(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN, '').trimStart();
}

function stripTaskPrefix(taskContent: string): string {
  const prefixMatch = taskContent.match(TASK_CONTENT_PREFIX_PATTERN);

  if (!prefixMatch) {
    return taskContent;
  }

  return prefixMatch[2];
}

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
    const currentDepth = getBlockquoteDepth(lineContent);
    const nestedDepth = currentDepth > 0 ? currentDepth + 1 : 1;
    const nestedPrefix = '>'.repeat(nestedDepth);

    const bodyContent =
      currentDepth > 0
        ? stripLeadingBlockquoteSegments(lineContent)
        : lineContent;

    // Include the callout title if provided: "> [!type] Title"
    const titleSegment = action.calloutTitle ? ` ${action.calloutTitle}` : '';
    editor.setLine(
      cursor.line,
      `${nestedPrefix} [!${action.calloutType}]${titleSegment}\n${nestedPrefix} ${bodyContent}`,
    );
    return;
  }

  if (action.type === 'task') {
    const prefixSegment = action.taskPrefix ? `${action.taskPrefix} ` : '';

    const calloutHeaderMatch = lineContent.match(
      CALLOUT_HEADER_WITH_TITLE_PATTERN,
    );

    if (calloutHeaderMatch) {
      const headerWithoutTitle = calloutHeaderMatch[1];
      const calloutTitle = calloutHeaderMatch[3]?.trim() ?? '';
      const titleStartIndex = lineContent.indexOf(calloutTitle);
      const cursorIsInCalloutTitle =
        calloutTitle.length > 0 &&
        titleStartIndex >= 0 &&
        cursor.ch >= titleStartIndex &&
        cursor.ch <= lineContent.length;

      if (cursorIsInCalloutTitle) {
        editor.setLine(
          cursor.line,
          `- [ ] ${prefixSegment}${calloutTitle}\n${headerWithoutTitle}`,
        );
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
        `${blockquotePrefix}${indentation}- [ ] ${prefixSegment}${contentWithoutTaskPrefix}`,
      );
      return;
    }

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
