import { EMdStyleTagType, ESpecialTagType } from '../../../interfaces';
import type { TMatchRecord } from '../interfaces';
import { calcLineEnd, filterTagsWithinRanges, invalidateTags, isSameTagPosition, mergeSortedRanges } from '../utils';

const makeRecord = (
  type: TMatchRecord['type'],
  isHTML: boolean,
  openLine: number,
  openCh: number,
  closeLine?: number,
  closeCh?: number
): TMatchRecord => ({
  type,
  isHTML,
  open: { start: { line: openLine, ch: openCh }, end: { line: openLine, ch: openCh + 2 } },
  ...(closeLine !== undefined && closeCh !== undefined
    ? { close: { start: { line: closeLine, ch: closeCh }, end: { line: closeLine, ch: closeCh + 2 } } }
    : {}),
});

const makeCloseOnly = (
  type: TMatchRecord['type'],
  isHTML: boolean,
  closeLine: number,
  closeCh: number
): TMatchRecord => ({
  type,
  isHTML,
  close: { start: { line: closeLine, ch: closeCh }, end: { line: closeLine, ch: closeCh + 2 } },
});

describe('calcLineEnd', () => {
  test('returns position at end of single-line content', () => {
    const result = calcLineEnd('hello', 0);
    expect(result).toEqual({ start: { line: 0, ch: 5 }, end: { line: 0, ch: 5 } });
  });

  test('returns position at end of first line in multi-line content', () => {
    const result = calcLineEnd('hello\nworld', 0);
    expect(result).toEqual({ start: { line: 0, ch: 5 }, end: { line: 0, ch: 5 } });
  });

  test('returns position at end of second line in multi-line content', () => {
    const result = calcLineEnd('hello\nworld', 1);
    expect(result).toEqual({ start: { line: 1, ch: 5 }, end: { line: 1, ch: 5 } });
  });

  test('returns position 0 for an empty line', () => {
    const result = calcLineEnd('hello\n\nworld', 1);
    expect(result).toEqual({ start: { line: 1, ch: 0 }, end: { line: 1, ch: 0 } });
  });
});

describe('isSameTagPosition', () => {
  test('returns true when start positions are identical', () => {
    const positionA = { start: { line: 2, ch: 5 }, end: { line: 2, ch: 10 } };
    const positionB = { start: { line: 2, ch: 5 }, end: { line: 2, ch: 99 } };
    expect(isSameTagPosition(positionA, positionB)).toBe(true);
  });

  test('returns false when lines differ', () => {
    const positionA = { start: { line: 2, ch: 5 }, end: { line: 2, ch: 10 } };
    const positionB = { start: { line: 3, ch: 5 }, end: { line: 3, ch: 10 } };
    expect(isSameTagPosition(positionA, positionB)).toBe(false);
  });

  test('returns false when characters differ', () => {
    const positionA = { start: { line: 2, ch: 5 }, end: { line: 2, ch: 10 } };
    const positionB = { start: { line: 2, ch: 6 }, end: { line: 2, ch: 10 } };
    expect(isSameTagPosition(positionA, positionB)).toBe(false);
  });
});

describe('filterTagsWithinRanges', () => {
  const boldRecord = makeRecord(EMdStyleTagType.BOLD, false, 0, 5);
  const hashtagRecord = makeRecord(ESpecialTagType.HASHTAG, false, 0, 5);
  const htmlBoldRecord = makeRecord(EMdStyleTagType.BOLD, true, 0, 5);

  const range = {
    start: { line: 0, ch: 0 },
    end: { line: 0, ch: 20 },
  };

  test('removes matching type within range', () => {
    const result = filterTagsWithinRanges([boldRecord], [range], [EMdStyleTagType.BOLD]);
    expect(result).toEqual([]);
  });

  test('keeps record outside range', () => {
    const outsideRecord = makeRecord(EMdStyleTagType.BOLD, false, 0, 30);
    const result = filterTagsWithinRanges([outsideRecord], [range], [EMdStyleTagType.BOLD]);
    expect(result).toEqual([outsideRecord]);
  });

  test('keeps record whose type is not in tagTypes', () => {
    const result = filterTagsWithinRanges([hashtagRecord], [range], [EMdStyleTagType.BOLD]);
    expect(result).toEqual([hashtagRecord]);
  });

  test('defaults tagTypes to EMdStyleTagType values when not provided', () => {
    const result = filterTagsWithinRanges([boldRecord], [range]);
    expect(result).toEqual([]);
  });

  test('filters by isHTML=false: keeps HTML records even when they match type and range', () => {
    const result = filterTagsWithinRanges([htmlBoldRecord], [range], [EMdStyleTagType.BOLD], false);
    expect(result).toEqual([htmlBoldRecord]);
  });

  test('filters by isHTML=true: removes HTML records that match type and range', () => {
    const result = filterTagsWithinRanges([htmlBoldRecord], [range], [EMdStyleTagType.BOLD], true);
    expect(result).toEqual([]);
  });

  test('filters by isHTML=true: keeps non-HTML records even when they match type and range', () => {
    const result = filterTagsWithinRanges([boldRecord], [range], [EMdStyleTagType.BOLD], true);
    expect(result).toEqual([boldRecord]);
  });

  test('handles record with only close position (no open)', () => {
    const closeOnlyRecord = makeCloseOnly(EMdStyleTagType.BOLD, false, 0, 5);
    const result = filterTagsWithinRanges([closeOnlyRecord], [range], [EMdStyleTagType.BOLD]);
    expect(result).toEqual([]);
  });

  test('returns all records when ranges is empty', () => {
    const result = filterTagsWithinRanges([boldRecord], [], [EMdStyleTagType.BOLD]);
    expect(result).toEqual([boldRecord]);
  });

  test('handles position at range boundary (inclusive)', () => {
    const atStart = makeRecord(EMdStyleTagType.BOLD, false, 0, 0);
    const atEnd = makeRecord(EMdStyleTagType.BOLD, false, 0, 20);
    const resultStart = filterTagsWithinRanges([atStart], [range], [EMdStyleTagType.BOLD]);
    const resultEnd = filterTagsWithinRanges([atEnd], [range], [EMdStyleTagType.BOLD]);
    expect(resultStart).toEqual([]);
    expect(resultEnd).toEqual([]);
  });
});

describe('invalidateTags', () => {
  const anchorRecord = makeRecord(EMdStyleTagType.BOLD, false, 1, 10);

  test('removes records whose open position is after the anchor', () => {
    const afterRecord = makeRecord(EMdStyleTagType.BOLD, false, 2, 0);
    const result = invalidateTags([afterRecord], anchorRecord);
    expect(result).toEqual([]);
  });

  test('keeps records whose open position is before the anchor', () => {
    const beforeRecord = makeRecord(EMdStyleTagType.BOLD, false, 0, 0);
    const result = invalidateTags([beforeRecord], anchorRecord);
    expect(result).toEqual([beforeRecord]);
  });

  test('keeps records at the same position as the anchor', () => {
    const sameRecord = makeRecord(EMdStyleTagType.BOLD, false, 1, 10);
    const result = invalidateTags([sameRecord], anchorRecord);
    expect(result).toEqual([sameRecord]);
  });

  test('removes records whose close position is after the anchor (open before)', () => {
    const record = makeRecord(EMdStyleTagType.BOLD, false, 0, 5, 2, 0);
    const result = invalidateTags([record], anchorRecord);
    expect(result).toEqual([]);
  });

  test('uses close position when record has no open', () => {
    const closeAfter = makeCloseOnly(EMdStyleTagType.BOLD, false, 2, 0);
    const closeBefore = makeCloseOnly(EMdStyleTagType.BOLD, false, 0, 0);
    expect(invalidateTags([closeAfter], anchorRecord)).toEqual([]);
    expect(invalidateTags([closeBefore], anchorRecord)).toEqual([closeBefore]);
  });
});

describe('mergeSortedRanges', () => {
  test('merges two non-overlapping sorted arrays', () => {
    const left = [{ offset: 0, length: 5 }, { offset: 10, length: 3 }];
    const right = [{ offset: 3, length: 2 }, { offset: 15, length: 4 }];
    const result = mergeSortedRanges(left, right);
    expect(result).toEqual([
      { offset: 0, length: 5 },
      { offset: 3, length: 2 },
      { offset: 10, length: 3 },
      { offset: 15, length: 4 },
    ]);
  });

  test('merges when left is exhausted first', () => {
    const left = [{ offset: 1, length: 1 }];
    const right = [{ offset: 2, length: 1 }, { offset: 5, length: 1 }];
    const result = mergeSortedRanges(left, right);
    expect(result).toEqual([
      { offset: 1, length: 1 },
      { offset: 2, length: 1 },
      { offset: 5, length: 1 },
    ]);
  });

  test('merges when right is exhausted first', () => {
    const left = [{ offset: 2, length: 1 }, { offset: 5, length: 1 }];
    const right = [{ offset: 1, length: 1 }];
    const result = mergeSortedRanges(left, right);
    expect(result).toEqual([
      { offset: 1, length: 1 },
      { offset: 2, length: 1 },
      { offset: 5, length: 1 },
    ]);
  });

  test('returns left array when right is empty', () => {
    const left = [{ offset: 1, length: 2 }];
    const result = mergeSortedRanges(left, []);
    expect(result).toEqual([{ offset: 1, length: 2 }]);
  });

  test('returns right array when left is empty', () => {
    const right = [{ offset: 1, length: 2 }];
    const result = mergeSortedRanges([], right);
    expect(result).toEqual([{ offset: 1, length: 2 }]);
  });

  test('returns empty array when both are empty', () => {
    const result = mergeSortedRanges([], []);
    expect(result).toEqual([]);
  });

  test('keeps equal offsets in left-first order', () => {
    const left = [{ offset: 5, length: 2 }];
    const right = [{ offset: 5, length: 3 }];
    const result = mergeSortedRanges(left, right);
    expect(result).toEqual([{ offset: 5, length: 2 }, { offset: 5, length: 3 }]);
  });
});
