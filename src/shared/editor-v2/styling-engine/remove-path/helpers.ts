import type { EditorPosition } from 'obsidian';
import type { DetectedTag } from '../../detection-engine/interfaces';
import type { TagOffsetRange } from './interfaces';

/** Converts an absolute character offset into an EditorPosition (line, ch). */
export function offsetToEditorPosition(sourceText: string, offset: number): EditorPosition {
  let line = 0;
  let lineStart = 0;
  for (let scan = 0; scan < offset; scan++) {
    if (sourceText[scan] === '\n') { line++; lineStart = scan + 1; }
  }
  return { line, ch: offset - lineStart };
}

/** Returns the absolute offset where the given line index begins. */
export function lineStartOffset(sourceText: string, lineIndex: number): number {
  if (lineIndex === 0) return 0;
  let lineCount = 0;
  for (let scan = 0; scan < sourceText.length; scan++) {
    if (sourceText[scan] === '\n') {
      lineCount++;
      if (lineCount === lineIndex) return scan + 1;
    }
  }
  return sourceText.length;
}

/** Converts a DetectedTag's open/close to absolute offsets. Returns null when the tag has no close. */
export function detectedTagToOffsets(sourceText: string, tag: DetectedTag): TagOffsetRange | null {
  if (!tag.open || !tag.close) return null;

  const openLineStart = lineStartOffset(sourceText, tag.open.start.line);
  const closeLineStart = lineStartOffset(sourceText, tag.close.start.line);

  return {
    openStart: openLineStart + tag.open.start.ch,
    openEnd: openLineStart + tag.open.end.ch,
    closeStart: closeLineStart + tag.close.start.ch,
    closeEnd: closeLineStart + tag.close.end.ch,
  };
}
