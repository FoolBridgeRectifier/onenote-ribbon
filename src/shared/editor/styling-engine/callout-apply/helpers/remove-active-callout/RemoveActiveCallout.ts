import type { ObsidianEditor } from '../../../interfaces';

import { CALLOUT_HEADER_LINE_PATTERN, BLOCKQUOTE_PREFIX_PATTERN } from '../../constants';
import { countPrefixBlockquotes } from './helpers';

/**
 * Removes the Obsidian callout block surrounding the cursor.
 *
 * For nested callouts (e.g. `>> [!type]` inside an outer `> [!type]`), only
 * the innermost block touching the cursor is removed; outer blocks are left intact.
 * For sibling callouts stacked without a blank separator, only the callout block
 * whose header is directly above the cursor line is affected.
 */
export function removeActiveCallout(editor: ObsidianEditor): void {
  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  // Callout blocks always start lines with ">"
  if (!currentLine.startsWith('>')) return;

  // Walk backward to the nearest callout header line (innermost block around cursor).
  // Stop when the current line IS a callout header, or when the block boundary is crossed.
  let startLine = cursor.line;
  while (!CALLOUT_HEADER_LINE_PATTERN.test(editor.getLine(startLine)) && startLine > 0) {
    const prevLine = editor.getLine(startLine - 1);
    if (!prevLine.startsWith('>')) break;
    startLine -= 1;
  }

  // Confirm the resolved start line is a valid callout header
  const headerLine = editor.getLine(startLine);
  if (!CALLOUT_HEADER_LINE_PATTERN.test(headerLine)) return;

  // Track the nesting depth of the header so the forward walk stays within the same block
  const headerDepth = countPrefixBlockquotes(headerLine);

  // Walk forward — stop when the next line is shallower than the header (we have left the
  // nested block) or when another callout header at the exact same depth is encountered
  // (sibling block starts).
  let endLine = cursor.line;
  while (endLine < editor.lastLine()) {
    const nextLine = editor.getLine(endLine + 1);
    if (!nextLine.startsWith('>')) break;
    const nextDepth = countPrefixBlockquotes(nextLine);
    if (nextDepth < headerDepth) break;
    if (CALLOUT_HEADER_LINE_PATTERN.test(nextLine) && nextDepth === headerDepth) break;
    endLine += 1;
  }

  // Build replacement content — drop only the target header, strip "> " from all other lines.
  // Child callout headers (depth > headerDepth) must NOT be skipped; they are preserved
  // but de-nested by one level, just like regular body lines.
  const strippedLines: string[] = [];

  for (let lineIndex = startLine; lineIndex <= endLine; lineIndex += 1) {
    const lineText = editor.getLine(lineIndex);

    // Skip only the target callout header (the one being removed), identified by being
    // a callout header at exactly the same depth as the block. Child callout headers at
    // deeper depths are regular content that should be kept and de-nested by one level.
    const isTargetHeader =
      CALLOUT_HEADER_LINE_PATTERN.test(lineText) &&
      countPrefixBlockquotes(lineText) === headerDepth;

    if (isTargetHeader) {
      continue;
    }

    strippedLines.push(lineText.replace(BLOCKQUOTE_PREFIX_PATTERN, ''));
  }

  editor.replaceRange(
    strippedLines.join('\n'),
    { line: startLine, ch: 0 },
    { line: endLine, ch: editor.getLine(endLine).length }
  );
}
