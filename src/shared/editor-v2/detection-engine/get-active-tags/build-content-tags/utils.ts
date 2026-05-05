import type { TagPosition } from '../../../interfaces';
import type { TagType } from '../../interfaces';
import type { TMatchRecord } from '../find-all-matches/interfaces';

/** Returns true if two TagPositions refer to the exact same character. */
const isSamePosition = (positionA: TagPosition, positionB: TagPosition): boolean =>
  positionA.start.line === positionB.start.line && positionA.start.ch === positionB.start.ch;

/**
 * Pairs open and close records of each type into `TPairedMatch` objects.
 * Processes one type at a time in document order using a stack.
 * - Open and close records at the same position are invalid and both discarded.
 * - Orphaned closes (no preceding open) are discarded.
 * Only types that have both open and close records produce pairs.
 */
export const matchOpenClosePairs = (
  allMatches: TMatchRecord[],
  tagType: TagType,
  isHTML?: boolean
) => {
  let openTag = null;
  const filteredMatches = [];
  for (let i = 0; i < allMatches.length; i++) {
    if (
      allMatches[i].type !== tagType ||
      (isHTML !== undefined && allMatches[i].isHTML !== isHTML)
    ) {
      filteredMatches.push(allMatches[i]);
      continue;
    }

    if (allMatches[i].close && (!openTag || isSamePosition(openTag.open!, allMatches[i].close!))) {
      continue;
    }

    if (allMatches[i].open && openTag !== null) {
      continue;
    }

    if (!openTag && allMatches[i].open) {
      openTag = allMatches[i];
      filteredMatches.push(allMatches[i]);
      continue;
    }

    if (openTag && allMatches[i].close) {
      openTag.close = allMatches[i].close;
      openTag = null;
    }
  }

  return filteredMatches;
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
