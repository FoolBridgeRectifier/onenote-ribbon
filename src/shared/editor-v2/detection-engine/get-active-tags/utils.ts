import type { EditorPosition } from 'obsidian';
import type { TagPosition } from '../../interfaces';

/** Builds an array where index i holds the character offset of line i's first character. */
const buildLineOffsets = (content: string) => [
  0,
  ...Array.from(content).flatMap((char, index) => (char === '\n' ? [index + 1] : [])),
];

/** Converts a character offset to a 0-based EditorPosition. */
const toEditorPosition = (offset: number, content: string): EditorPosition => {
  const lineOffsets = buildLineOffsets(content);
  const line = lineOffsets.findLastIndex((lineStart) => lineStart <= offset);

  return {
    line: lineOffsets.findLastIndex((lineStart) => lineStart <= offset),
    ch: offset - lineOffsets[line],
  };
};

/** Wraps a character offset and match length into a TagPosition. */
export const rangeToTagPosition = (
  offset: number,
  length: number,
  content: string
): TagPosition => ({
  start: toEditorPosition(offset, content),
  end: toEditorPosition(offset + length, content),
});

// Converts a TagPosition to a flat { offset, length } character range.
export const tagPositionToRange = (position: TagPosition, content: string) => {
  const lineOffsets = buildLineOffsets(content);
  const startOffset = lineOffsets[position.start.line] + position.start.ch;
  const endOffset = lineOffsets[position.end.line] + position.end.ch;

  return { offset: startOffset, length: endOffset - startOffset };
};
