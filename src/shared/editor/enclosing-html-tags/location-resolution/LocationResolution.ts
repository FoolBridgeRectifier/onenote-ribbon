import type { CursorOrSelectionLocation, OffsetRange, TextIndex } from '../interfaces';
import { positionToOffset } from '../../text-offset/TextOffset';

/**
 * Normalizes any two offsets into left-to-right order.
 */
function normalizeOffsets(firstOffset: number, secondOffset: number): OffsetRange {
  if (firstOffset <= secondOffset) {
    return {
      leftOffset: firstOffset,
      rightOffset: secondOffset,
    };
  }

  return {
    leftOffset: secondOffset,
    rightOffset: firstOffset,
  };
}

/**
 * Resolves cursor or selection inputs to a normalized offset range.
 *
 * Cursor queries become a zero-width range (leftOffset === rightOffset), while
 * selections are normalized so backward selections are handled consistently.
 */
export function resolveLocationOffsets(
  location: CursorOrSelectionLocation,
  textIndex: TextIndex
): OffsetRange {
  if ('cursorPosition' in location) {
    const cursorOffset = positionToOffset(location.cursorPosition, textIndex);

    return {
      leftOffset: cursorOffset,
      rightOffset: cursorOffset,
    };
  }

  const leftOffset = positionToOffset(location.leftPosition, textIndex);
  const rightOffset = positionToOffset(location.rightPosition, textIndex);

  return normalizeOffsets(leftOffset, rightOffset);
}
