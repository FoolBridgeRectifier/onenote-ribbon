import type { EditorPosition } from 'obsidian';
import { EMdStyleTagType } from '../../../interfaces';
import type { TagPosition } from '../../../interfaces';
import type { TagType } from '../../interfaces';
import type { TMatchRecord } from '../find-all-matches/interfaces';

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
    // True if this record belongs to the target type (and optional isHTML filter).
    const isSameTag = !(
      allMatches[i].type !== tagType ||
      (isHTML !== undefined && allMatches[i].isHTML !== isHTML)
    );

    // A close is a duplicate if there is no open to pair with (orphaned),
    // or if the close sits at the exact same position as the current open (invalid pair).
    const isDuplicateClose =
      allMatches[i].close && (!openTag || isSameTagPosition(openTag.open!, allMatches[i].close!));

    // A second open while one is already tracked — same-type nesting is not supported.
    const isDuplicateOpen = allMatches[i].open && openTag;

    if (!isSameTag) {
      // Not the target type — pass through unchanged.
      filteredMatches.push(allMatches[i]);
    } else if (isDuplicateClose || isDuplicateOpen) {
      // Discard invalid or redundant records.
      continue;
    } else if (!openTag && allMatches[i].open) {
      // Valid open with no existing open — start tracking the pair.
      openTag = allMatches[i];
      filteredMatches.push(allMatches[i]);
    } else {
      // Valid close with an open already tracked — openTag is non-null here
      // (isDuplicateOpen=false + !openTag&&open=false together guarantee it).
      openTag!.close = allMatches[i].close;
      openTag = null;
    }
  }

  return filteredMatches;
};

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
