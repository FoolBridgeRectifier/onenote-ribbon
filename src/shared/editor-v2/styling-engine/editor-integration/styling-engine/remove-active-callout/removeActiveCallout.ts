import type { ObsidianEditor } from '../../interfaces';

import {
  CALLOUT_HEADER_LINE_PATTERN,
  BLOCKQUOTE_PREFIX_PATTERN,
} from '../constants';
import { countBlockquoteDepth } from '../apply-callout/helpers';

/**
 * Removes the Obsidian callout block surrounding the cursor.
 *
 * For nested callouts, removes only the innermost block touching the cursor.
 * For sibling callouts stacked without a blank separator, removes only the block
 * whose header is directly above the cursor line.
 * Child callouts inside the removed block are preserved but de-nested by one level.
 */
export function removeActiveCallout(editor: ObsidianEditor): void {
  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  if (!currentLine.startsWith('>')) return;

  // Walk backward to the nearest callout header at or above the cursor line.
  let startLine = cursor.line;
  while (!CALLOUT_HEADER_LINE_PATTERN.test(editor.getLine(startLine)) && startLine > 0) {
    const previousLine = editor.getLine(startLine - 1);
    if (!previousLine.startsWith('>')) break;
    startLine -= 1;
  }

  const headerLine = editor.getLine(startLine);
  if (!CALLOUT_HEADER_LINE_PATTERN.test(headerLine)) return;

  const headerDepth = countBlockquoteDepth(headerLine);

  // Walk forward — stop at shallower depth or at a sibling callout header at the same depth.
  let endLine = cursor.line;
  while (endLine < editor.lastLine()) {
    const nextLine = editor.getLine(endLine + 1);
    if (!nextLine.startsWith('>')) break;

    const nextDepth = countBlockquoteDepth(nextLine);
    if (nextDepth < headerDepth) break;
    if (CALLOUT_HEADER_LINE_PATTERN.test(nextLine) && nextDepth === headerDepth) break;

    endLine += 1;
  }

  // Build replacement: drop only the target header (depth === headerDepth callout header);
  // keep child callout headers (deeper) and body lines, each with one ">" stripped.
  const strippedLines: string[] = [];

  for (let lineIndex = startLine; lineIndex <= endLine; lineIndex += 1) {
    const lineText = editor.getLine(lineIndex);

    const isTargetHeader =
      CALLOUT_HEADER_LINE_PATTERN.test(lineText) &&
      countBlockquoteDepth(lineText) === headerDepth;

    if (isTargetHeader) continue;

    strippedLines.push(lineText.replace(BLOCKQUOTE_PREFIX_PATTERN, ''));
  }

  editor.replaceRange(
    strippedLines.join('\n'),
    { line: startLine, ch: 0 },
    { line: endLine, ch: editor.getLine(endLine).length }
  );
}
