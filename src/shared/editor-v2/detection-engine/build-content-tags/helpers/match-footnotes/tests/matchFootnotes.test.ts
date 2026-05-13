import { EMdStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { matchFootnotes } from '../matchFootnotes';

// Content used in most tests: line 0 = '[^note1]...', line 1 = '[^foot]:'
const CONTENT = '[^note1] inline text\n[^foot]:';

const makeFootnoteOpen = (line: number, startCh: number, endCh: number): TMatchRecord => ({
  type: ESpecialTagType.FOOTNOTE_REF,
  isHTML: false,
  open: { start: { line, ch: startCh }, end: { line, ch: endCh } },
});

const makeFootnoteClose = (line: number, startCh: number, endCh: number): TMatchRecord => ({
  type: ESpecialTagType.FOOTNOTE_REF,
  isHTML: false,
  close: { start: { line, ch: startCh }, end: { line, ch: endCh } },
});

const makeBold = (): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } },
});

describe('matchFootnotes', () => {
  test('non-FOOTNOTE_REF records pass through unchanged', () => {
    const bold = makeBold();
    const result = matchFootnotes('', [bold]);
    expect(result).toEqual([bold]);
  });

  test('FOOTNOTE_REF with no open or close is skipped (extractLabel returns null)', () => {
    const noPositionMatch: TMatchRecord = {
      type: ESpecialTagType.FOOTNOTE_REF,
      isHTML: false,
    };
    const result = matchFootnotes('', [noPositionMatch]);
    expect(result).toEqual([]);
  });

  test('open record extracts label from content and is included in result', () => {
    // '[^note1]' at ch 0..8 on line 0 of CONTENT.
    const footnoteOpen = makeFootnoteOpen(0, 0, 8);
    const result = matchFootnotes(CONTENT, [footnoteOpen]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(footnoteOpen);
    expect(result[0].title).toEqual(['note1']);
  });

  test('close with matching open merges close into open record and drops the close from result', () => {
    // Open '[^note1]' at line 0; close '[^note1]:' at some virtual position.
    // We use a multi-line content where line 1 has '[^note1]:'.
    const content = '[^note1] text\n[^note1]:';
    const footnoteOpen = makeFootnoteOpen(0, 0, 8);
    // Close at line 1 ch 0..9 ('[^note1]:' = 9 chars).
    const footnoteClose = makeFootnoteClose(1, 0, 9);

    const result = matchFootnotes(content, [footnoteOpen, footnoteClose]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(footnoteOpen);
    expect(result[0].close).toEqual(footnoteClose.close);
  });

  test('orphan close (no matching open) is kept in result', () => {
    const content = '[^foot]:';
    // Close '[^foot]:' at line 0 ch 0..8 (8 chars).
    const orphanClose = makeFootnoteClose(0, 0, 8);

    const result = matchFootnotes(content, [orphanClose]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(orphanClose);
    expect(result[0].title).toEqual(['foot']);
  });

  test('duplicate open with same label: both are in result but only first is tracked', () => {
    const content = '[^note1] first [^note1] second\n[^note1]:';
    // First open at ch 0..8, second open at ch 15..23.
    const firstOpen = makeFootnoteOpen(0, 0, 8);
    const secondOpen = makeFootnoteOpen(0, 15, 23);
    // Close at line 1 ch 0..9.
    const footnoteClose = makeFootnoteClose(1, 0, 9);

    const result = matchFootnotes(content, [firstOpen, secondOpen, footnoteClose]);

    // Both opens are in result; close is merged into first open only.
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(firstOpen);
    expect(result[1]).toBe(secondOpen);
    expect(firstOpen.close).toEqual(footnoteClose.close);
    expect(secondOpen.close).toBeUndefined();
  });

  test('uses close position when record has no open (for extractLabel)', () => {
    const content = '[^abc]:';
    // Close-only at line 0 ch 0..7.
    const closeRecord = makeFootnoteClose(0, 0, 7);

    const result = matchFootnotes(content, [closeRecord]);

    expect(result[0].title).toEqual(['abc']);
  });

  test('returns empty array for empty input', () => {
    expect(matchFootnotes('', [])).toEqual([]);
  });
});
