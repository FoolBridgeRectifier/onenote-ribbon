import type { EditorPosition } from 'obsidian';
import { EMdStyleTagType } from '../../interfaces';
import type { TagPosition } from '../../interfaces';
import type { TagType } from '../interfaces';
import type { TMatchRecord } from './interfaces';

/** Returns a TagPosition representing the end of the given line in content. */
export const calcLineEnd = (content: string, openTagLine: number) => {
  const lineEndCh = content.split('\n')[openTagLine].length;

  return {
    start: { line: openTagLine, ch: lineEndCh },
    end: { line: openTagLine, ch: lineEndCh },
  };
};

/** Returns true if two TagPositions refer to the exact same character. */
export const isSameTagPosition = (positionA: TagPosition, positionB: TagPosition): boolean =>
  positionA.start.line === positionB.start.line && positionA.start.ch === positionB.start.ch;

/** Returns true if position `a` comes strictly after position `b` in document order. */
const isAfterPosition = (a: EditorPosition, b: EditorPosition): boolean =>
  a.line > b.line || (a.line === b.line && a.ch > b.ch);

/** Returns true if `position` falls within `range` (inclusive on both ends). */
const isWithinRange = (position: EditorPosition, range: TagPosition): boolean =>
  !isAfterPosition(range.start, position) && !isAfterPosition(position, range.end);

/**
 * Removes records whose start position falls within any of the given ranges.
 * Only records whose type is in `tagTypes` are considered for removal.
 * Defaults to all EMdStyleTagType values.
 */
export const filterTagsWithinRanges = (
  allMatches: TMatchRecord[],
  ranges: TagPosition[],
  tagTypes: TagType[] = Object.values(EMdStyleTagType),
  isHTML?: boolean
): TMatchRecord[] =>
  allMatches.filter((match) => {
    if (isHTML !== undefined && match.isHTML !== isHTML) return true;
    if (!tagTypes.includes(match.type)) return true;
    const position = (match.open ?? match.close)!.start;
    return !ranges.some((range) => isWithinRange(position, range));
  });

/** Removes all matches whose position comes after the given tag's position. */
export const invalidateTags = (allMatches: TMatchRecord[], tag: TMatchRecord): TMatchRecord[] => {
  const tagPosition = (tag.open ?? tag.close)!.start;

  return allMatches.filter((match) => {
    const openIsAfter = match.open && isAfterPosition(match.open.start, tagPosition);
    const closeIsAfter = match.close && isAfterPosition(match.close.start, tagPosition);

    return !openIsAfter && !closeIsAfter;
  });
};

// O(n) merge of two offset-sorted range arrays into one sorted array.
export const mergeSortedRanges = (
  leftRanges: Array<{ offset: number; length: number }>,
  rightRanges: Array<{ offset: number; length: number }>
) => {
  const merged: Array<{ offset: number; length: number }> = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftRanges.length && rightIndex < rightRanges.length) {
    if (leftRanges[leftIndex].offset <= rightRanges[rightIndex].offset) {
      merged.push(leftRanges[leftIndex++]);
    } else {
      merged.push(rightRanges[rightIndex++]);
    }
  }

  return [...merged, ...leftRanges.slice(leftIndex), ...rightRanges.slice(rightIndex)];
};
