import type { EditorPosition } from 'obsidian';
import type { TagPosition } from '../../../interfaces';
import type { TMatchRecord } from './interfaces';

/** Builds an array where index i holds the character offset of line i's first character. */
export const buildLineOffsets = (content: string) => [
  0,
  ...Array.from(content).flatMap((char, index) => (char === '\n' ? [index + 1] : [])),
];

/** Converts a character offset to a 0-based EditorPosition. */
export const toEditorPosition = (offset: number, lineOffsets: number[]): EditorPosition => {
  const line = lineOffsets.findLastIndex((lineStart) => lineStart <= offset);

  return {
    line: lineOffsets.findLastIndex((lineStart) => lineStart <= offset),
    ch: offset - lineOffsets[line],
  };
};

/** Wraps a character offset and match length into a TagPosition. */
export const toTagPosition = (
  offset: number,
  length: number,
  lineOffsets: number[]
): TagPosition => ({
  start: toEditorPosition(offset, lineOffsets),
  end: toEditorPosition(offset + length, lineOffsets),
});

/** Sorts two TMatchRecords ascending by document position. */
export const compareByPosition = (recordA: TMatchRecord, recordB: TMatchRecord) => {
  const positionA = recordA.open ?? recordA.close!;
  const positionB = recordB.open ?? recordB.close!;

  const lineDifference = positionA.start.line - positionB.start.line;
  if (lineDifference !== 0) {
    return lineDifference;
  }
  return positionA.start.ch - positionB.start.ch;
};

/** Runs a regex globally against content and returns all non-empty match positions. */
export const scanPattern = (content: string, pattern: RegExp) =>
  Array.from(content.matchAll(pattern))
    .filter((match) => match[0].length > 0)
    .map((match) => ({ index: match.index!, length: match[0].length }));
