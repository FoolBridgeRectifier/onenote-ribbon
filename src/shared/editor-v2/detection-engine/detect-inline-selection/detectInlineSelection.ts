import type { EditorPosition } from 'obsidian';
import { ESpecialTagType } from '../../interfaces';
import type { TCursor, TTag } from '../../interfaces';

export function detectCodeTag(lines: string[], cursor: TCursor): TTag | null {
  let isLineCodeBlockOpen: EditorPosition | null = null;
  let isMultiCodeBlockOpen: EditorPosition | null = null;
  let isTabCodeBlockOpen: EditorPosition | null = null;

  const isSinglePosition = 'line' in cursor && 'ch' in cursor;
  const startLine = isSinglePosition ? cursor.line : cursor.start.line;
  const endLine = isSinglePosition ? cursor.line : cursor.end.line;
  const startCh = isSinglePosition ? cursor.ch : cursor.start.ch;
  const endCh = isSinglePosition ? cursor.ch : cursor.end.ch;

  const tags = [];
  for (const [lineIndex, line] of lines.entries()) {
    // if empty line and next line has tab, isTabCodeBlockOpen = open.
    // if no tab in any line then isTabCodeBlockOpen = close.
    // if inside end line add to tags.
    // else if in start cursor line && !isMultiCodeBlockOpen && !isTabCodeBlockOpen
    // loop through line
    // if ``` or ` && !isLineCodeBlockOpen or !isCodeBlock. then set
    // if isLineCodeBlockOpen && ` close it to null, if block not contained, then add to tags
    // if isCodeBlock && ``` close it to null, if inside start already, then add to tags
    // if end selection char
    // if ` is first to open and not ```, and is still open. find closing of tag (could be eol)
    //
    // else check if ``` in line !isCodeBlock not open then isCodeBlock true
    // if entire line is ``` && isCodeBlock then isTabCodeBlockOpen = close.
    // if inside end line add to tags.
    // if end line
    // if tab block or multi code block open. find which was first find closing of tag (could be eof)
  }

  return null;
}
