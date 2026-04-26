import type { ObsidianEditor } from '../../interfaces';

import {
  CALLOUT_HEADER_LINE_PATTERN,
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  BLOCKQUOTE_PREFIX_PATTERN,
} from '../constants';
import { countBlockquoteDepth } from '../apply-callout/helpers';

/**
 * Removes the specific callout block whose title or type matches `calloutKey`.
 * Unlike `removeActiveCallout`, this targets a named callout regardless of nesting depth.
 * Body lines are unwrapped one level (one `>` stripped) so nested content is preserved.
 *
 * Matching: title takes precedence (case-sensitive). Falls back to lowercased type match.
 */
export function removeCalloutByKey(editor: ObsidianEditor, calloutKey: string): void {
  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  if (!currentLine.startsWith('>')) return;

  // Walk upward from cursor for the nearest header whose title or type matches calloutKey.
  let headerLineIndex = -1;
  let headerDepth = 0;

  for (let lineIndex = cursor.line; lineIndex >= 0; lineIndex -= 1) {
    const lineText = editor.getLine(lineIndex);
    if (!lineText.startsWith('>')) break;

    const headerMatch = lineText.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
    if (!headerMatch) continue;

    const calloutType = headerMatch[2].toLowerCase();
    const calloutTitle = headerMatch[3]?.trim();

    const titleOrType = calloutTitle ?? calloutType;
    const matchesKey = titleOrType === calloutKey || calloutType === calloutKey.toLowerCase();

    if (matchesKey) {
      headerLineIndex = lineIndex;
      headerDepth = countBlockquoteDepth(lineText);
      break;
    }
  }

  if (headerLineIndex === -1) return;

  // Walk forward from the matched header to the end of this callout block.
  let endLine = headerLineIndex;
  while (endLine < editor.lastLine()) {
    const nextLine = editor.getLine(endLine + 1);
    if (!nextLine.startsWith('>')) break;

    const nextDepth = countBlockquoteDepth(nextLine);
    if (nextDepth < headerDepth) break;
    if (CALLOUT_HEADER_LINE_PATTERN.test(nextLine) && nextDepth === headerDepth) break;

    endLine += 1;
  }

  // Build replacement: drop the matched callout header, strip one ">" from body lines.
  const strippedLines: string[] = [];

  for (let lineIndex = headerLineIndex; lineIndex <= endLine; lineIndex += 1) {
    const lineText = editor.getLine(lineIndex);
    if (lineIndex === headerLineIndex && CALLOUT_HEADER_LINE_PATTERN.test(lineText)) continue;
    strippedLines.push(lineText.replace(BLOCKQUOTE_PREFIX_PATTERN, ''));
  }

  editor.replaceRange(
    strippedLines.join('\n'),
    { line: headerLineIndex, ch: 0 },
    { line: endLine, ch: editor.getLine(endLine).length }
  );
}
