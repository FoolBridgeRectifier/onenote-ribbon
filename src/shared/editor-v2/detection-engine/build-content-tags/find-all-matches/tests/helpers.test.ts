import { EMdStyleTagType } from '../../../../interfaces';
import type { TMatchRecord } from '../../interfaces';
import { compareByPosition, scanPattern } from '../helpers';

const makeOpen = (line: number, ch: number): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

const makeClose = (line: number, ch: number): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  close: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

describe('compareByPosition', () => {
  test('returns negative when a is on an earlier line than b', () => {
    const result = compareByPosition(makeOpen(0, 0), makeOpen(1, 0));
    expect(result).toBeLessThan(0);
  });

  test('returns positive when a is on a later line than b', () => {
    const result = compareByPosition(makeOpen(2, 0), makeOpen(1, 0));
    expect(result).toBeGreaterThan(0);
  });

  test('returns negative when same line, a ch is less than b ch', () => {
    const result = compareByPosition(makeOpen(1, 3), makeOpen(1, 10));
    expect(result).toBeLessThan(0);
  });

  test('returns positive when same line, a ch is greater than b ch', () => {
    const result = compareByPosition(makeOpen(1, 10), makeOpen(1, 3));
    expect(result).toBeGreaterThan(0);
  });

  test('returns 0 when a and b are at the same position', () => {
    const result = compareByPosition(makeOpen(2, 5), makeOpen(2, 5));
    expect(result).toBe(0);
  });

  test('uses close position when record has no open', () => {
    const closeRecord = makeClose(0, 5);
    const openRecord = makeOpen(1, 0);
    const result = compareByPosition(closeRecord, openRecord);
    expect(result).toBeLessThan(0);
  });
});

describe('scanPattern', () => {
  test('returns all non-empty matches with their index and length', () => {
    const result = scanPattern('**bold** end', /\*\*/g);
    expect(result).toEqual([
      { index: 0, length: 2 },
      { index: 6, length: 2 },
    ]);
  });

  test('returns empty array when pattern does not match', () => {
    const result = scanPattern('no match here', /\*\*/g);
    expect(result).toEqual([]);
  });

  test('filters out zero-length matches', () => {
    // Lookahead assertions can produce zero-length matches in some engines.
    // The filter ensures only non-empty matches are returned.
    const result = scanPattern('abc', /(?=b)/g);
    expect(result).toEqual([]);
  });

  test('handles empty content string', () => {
    const result = scanPattern('', /\*\*/g);
    expect(result).toEqual([]);
  });

  test('returns correct length for multi-character match', () => {
    // '```code```': ``` at 0, 'code' = 4 chars, ``` at 7.
    const result = scanPattern('```code```', /`{3}/g);
    expect(result).toEqual([
      { index: 0, length: 3 },
      { index: 7, length: 3 },
    ]);
  });
});
