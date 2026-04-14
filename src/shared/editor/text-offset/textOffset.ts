import { NEWLINE_DELIMITER } from './constants';
import { TextIndex, TextPosition } from './interfaces';

export type { TextIndex, TextPosition } from './interfaces';

/**
 * Clamps a number to an inclusive range to keep all offset math within bounds.
 */
export function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (value < minimum) return minimum;
  if (value > maximum) return maximum;
  return value;
}

/**
 * Builds line-start and line-length indexes so cursor positions can be converted
 * to string offsets in O(1) time during hot cursor-move queries.
 */
export function buildTextIndex(sourceText: string): TextIndex {
  const sourceLines = sourceText.split(NEWLINE_DELIMITER);
  const lineStartOffsets: number[] = [];
  const lineLengths: number[] = [];

  let runningOffset = 0;

  for (let lineIndex = 0; lineIndex < sourceLines.length; lineIndex += 1) {
    const sourceLine = sourceLines[lineIndex];
    lineStartOffsets.push(runningOffset);
    lineLengths.push(sourceLine.length);

    runningOffset += sourceLine.length;

    if (lineIndex < sourceLines.length - 1) {
      runningOffset += 1;
    }
  }

  return {
    lineStartOffsets,
    lineLengths,
    sourceLength: sourceText.length,
  };
}

/**
 * Converts a {line, ch} position to a flat source-text offset.
 *
 * Positions are clamped so malformed or stale cursor data cannot throw,
 * which is important when this runs repeatedly as editor state changes.
 */
export function positionToOffset(
  position: TextPosition,
  textIndex: TextIndex,
): number {
  if (textIndex.lineStartOffsets.length === 0) {
    return 0;
  }

  const safeLineIndex = clamp(
    position.line,
    0,
    textIndex.lineStartOffsets.length - 1,
  );
  const safeCharacterIndex = clamp(
    position.ch,
    0,
    textIndex.lineLengths[safeLineIndex],
  );

  const unsafeOffset =
    textIndex.lineStartOffsets[safeLineIndex] + safeCharacterIndex;

  return clamp(unsafeOffset, 0, textIndex.sourceLength);
}

/**
 * Converts a flat source-text offset back to a {line, ch} position.
 *
 * The offset is clamped to [0, sourceLength] so out-of-bounds values
 * resolve to the nearest valid position rather than throwing.
 * Uses a linear scan through lineStartOffsets to find the containing line.
 */
export function offsetToPosition(
  offset: number,
  textIndex: TextIndex,
): TextPosition {
  if (textIndex.lineStartOffsets.length === 0) {
    return { line: 0, ch: 0 };
  }

  const safeOffset = clamp(offset, 0, textIndex.sourceLength);

  // Walk forward through lines to find the one containing safeOffset.
  // The last line whose start offset is <= safeOffset is the target.
  let targetLineIndex = 0;

  for (
    let lineIndex = 1;
    lineIndex < textIndex.lineStartOffsets.length;
    lineIndex += 1
  ) {
    if (textIndex.lineStartOffsets[lineIndex] <= safeOffset) {
      targetLineIndex = lineIndex;
    } else {
      break;
    }
  }

  const characterOffset =
    safeOffset - textIndex.lineStartOffsets[targetLineIndex];

  return {
    line: targetLineIndex,
    ch: characterOffset,
  };
}
