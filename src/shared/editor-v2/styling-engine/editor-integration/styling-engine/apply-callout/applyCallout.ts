import type { ObsidianEditor } from '../../interfaces';

import { TASK_LINE_PATTERN } from '../constants';
import { countBlockquoteDepth, stripLeadingBlockquoteSegments } from './helpers';

/**
 * Wraps the cursor line in an Obsidian callout block.
 * If the line is already inside a callout, nests the new callout one level deeper.
 * Strips a checkbox marker (`- [ ]`) from the wrapped line so callouts override tasks cleanly.
 *
 * Cursor parking: moves to the start of the body line so a follow-up call nests
 * inside this callout's body rather than wrapping the header line again.
 */
export function applyCallout(
  editor: ObsidianEditor,
  calloutType: string,
  calloutTitle?: string
): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);

  const currentDepth = countBlockquoteDepth(lineContent);
  const nestedDepth = currentDepth > 0 ? currentDepth + 1 : 1;
  const nestedPrefix = '>'.repeat(nestedDepth);

  // When already in a blockquote, drop existing prefix segments before re-wrapping.
  const rawBodyContent =
    currentDepth > 0 ? stripLeadingBlockquoteSegments(lineContent) : lineContent;

  // Strip the task list marker when converting a checkbox line into a callout body.
  const bodyContent = rawBodyContent.replace(TASK_LINE_PATTERN, '');

  const titleSegment = calloutTitle ? ` ${calloutTitle}` : '';

  editor.setLine(
    cursor.line,
    `${nestedPrefix} [!${calloutType}]${titleSegment}\n${nestedPrefix} ${bodyContent}`
  );

  editor.setCursor({ line: cursor.line + 1, ch: nestedPrefix.length + 1 });
}
