import { cursorToSelection } from '../cursorToSelection';

describe('cursorToSelection', () => {
  test('passes a range cursor through unchanged', () => {
    const selection = { start: { line: 0, ch: 3 }, end: { line: 1, ch: 5 } };
    expect(cursorToSelection(selection)).toBe(selection);
  });

  test('wraps a single EditorPosition into a zero-length selection', () => {
    const point = { line: 2, ch: 7 };
    expect(cursorToSelection(point)).toEqual({ start: point, end: point });
  });

  test('handles a single position at the origin', () => {
    const point = { line: 0, ch: 0 };
    expect(cursorToSelection(point)).toEqual({ start: { line: 0, ch: 0 }, end: { line: 0, ch: 0 } });
  });

  test('same start and end on a range cursor is passed through unchanged', () => {
    const zeroRange = { start: { line: 3, ch: 2 }, end: { line: 3, ch: 2 } };
    expect(cursorToSelection(zeroRange)).toBe(zeroRange);
  });
});
