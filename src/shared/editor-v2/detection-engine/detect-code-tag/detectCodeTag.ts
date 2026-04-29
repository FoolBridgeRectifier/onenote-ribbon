import type { TCursor, TTag } from '../../interfaces';
import { TagPosition } from '../interfaces';

export function detectCodeTag(lines: string[], cursor: TCursor): TTag | null {
  const TAB_MATCHER = /^\t+/;
  const TAB_SPACES_MATCHER = /^ {4,}/;
  const CODE_BLOCK_MATCHER = /^```/;
  const CODE_BLOCK_CLOSE_MATCHER = /^\s*```\s*$/;
  const LINE_MATCHER = /^`/;

  let isLineCodeBlockOpen: TagPosition | null = null;
  let isMultiCodeBlockOpen: TagPosition | null = null;
  let isTabCodeBlockOpen: TagPosition | null = null;

  const isSinglePosition = 'line' in cursor && 'ch' in cursor;
  const startLine = isSinglePosition ? cursor.line : cursor.start.line;
  const endLine = isSinglePosition ? cursor.line : cursor.end.line;
  const startCh = isSinglePosition ? cursor.ch : cursor.start.ch;
  const endCh = isSinglePosition ? cursor.ch : cursor.end.ch;

  const tags = [];
  for (const [lineIndex, line] of lines.entries()) {
    if (
      lineIndex <= startLine &&
      !lines[lineIndex - 1]?.trim() &&
      (TAB_MATCHER.test(line) || TAB_SPACES_MATCHER.test(line)) &&
      !isTabCodeBlockOpen &&
      !isMultiCodeBlockOpen
    ) {
      isTabCodeBlockOpen = {
        start: { line: lineIndex > 0 ? lineIndex - 1 : lineIndex, ch: 0 },
        end: { line: lineIndex, ch: TAB_MATCHER.test(line) ? 1 : 4 },
      };
    } else if (isTabCodeBlockOpen && !TAB_MATCHER.test(line)) {
      isTabCodeBlockOpen = null;
    }

    if (
      (lineIndex < startLine ||
        ((CODE_BLOCK_MATCHER.exec(line)?.index ?? 0) < startCh && startLine === lineIndex)) &&
      CODE_BLOCK_MATCHER.test(line) &&
      !isTabCodeBlockOpen &&
      !isMultiCodeBlockOpen &&
      !isLineCodeBlockOpen
    ) {
      const tagStart = CODE_BLOCK_MATCHER.exec(line)?.index ?? 0;
      isMultiCodeBlockOpen = {
        start: { line: lineIndex, ch: tagStart },
        end: { line: lineIndex, ch: tagStart + 3 },
      };
    } else if (
      isMultiCodeBlockOpen &&
      lineIndex !== endLine &&
      CODE_BLOCK_CLOSE_MATCHER.test(line)
    ) {
      isMultiCodeBlockOpen = null;
    }

    if (
      lineIndex === startLine &&
      startLine === endLine &&
      LINE_MATCHER.test(line) &&
      (LINE_MATCHER.exec(line)?.index ?? 0) < startCh &&
      !isMultiCodeBlockOpen &&
      !isTabCodeBlockOpen &&
      !isLineCodeBlockOpen
    ) {
      const lineMatch = LINE_MATCHER.exec(line);
      if (lineMatch && lineMatch.index < endCh) {
        const openPos = lineMatch.index;
        const closePos = line.indexOf('`', openPos + 1);
        if (closePos !== -1) {
          isLineCodeBlockOpen = {
            start: { line: lineIndex, ch: openPos },
            end: { line: lineIndex, ch: closePos + 1 },
          };
        } else {
          isLineCodeBlockOpen = {
            start: { line: lineIndex, ch: openPos },
            end: { line: lineIndex, ch: openPos + 1 },
          };
        }
      }
    } else if (isLineCodeBlockOpen && !LINE_MATCHER.test(line)) {
      isLineCodeBlockOpen = null;
    }
  }

  return null;
}
