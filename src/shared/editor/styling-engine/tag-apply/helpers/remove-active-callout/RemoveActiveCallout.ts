import type { Editor } from 'obsidian';

import { CALLOUT_HEADER_LINE_PATTERN, BLOCKQUOTE_PREFIX_PATTERN } from '../../constants';

/**
 * Removes the Obsidian callout block surrounding the cursor.
 * Scans up to find block start, confirms callout header, scans down for end,
 * then removes the header line and strips "> " prefixes from body lines.
 */
export function removeActiveCallout(editor: Editor): void {
  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  // Callout blocks always start lines with ">"
  if (!currentLine.startsWith('>')) return;

  // Walk backward to find the first line of the block
  let startLine = cursor.line;
  while (startLine > 0) {
    const prevLine = editor.getLine(startLine - 1);
    if (!prevLine.startsWith('>')) break;
    startLine -= 1;
  }

  // Confirm the block begins with a valid callout header
  const headerLine = editor.getLine(startLine);
  if (!CALLOUT_HEADER_LINE_PATTERN.test(headerLine)) return;

  // Walk forward to find the last line of the block
  let endLine = cursor.line;
  while (endLine < editor.lastLine()) {
    const nextLine = editor.getLine(endLine + 1);
    if (!nextLine.startsWith('>')) break;
    endLine += 1;
  }

  // Build replacement content — drop the header, strip "> " from body lines
  const strippedLines: string[] = [];

  for (let lineIndex = startLine; lineIndex <= endLine; lineIndex += 1) {
    const lineText = editor.getLine(lineIndex);

    if (CALLOUT_HEADER_LINE_PATTERN.test(lineText)) {
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
