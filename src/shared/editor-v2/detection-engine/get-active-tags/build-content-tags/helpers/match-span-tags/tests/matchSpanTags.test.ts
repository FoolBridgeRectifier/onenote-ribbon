import { ESpanStyleTagType } from '../../../../../../interfaces';
import type { TMatchRecord } from '../../../../find-all-matches/interfaces';
import { matchSpanTags } from '../matchSpanTags';

const makeOpen = (type: ESpanStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: true,
  open: { start: { line, ch }, end: { line, ch: ch + 10 } },
});

const makeClose = (type: ESpanStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: true,
  close: { start: { line, ch }, end: { line, ch: ch + 7 } },
});

const makeGenericOpen = (line: number, ch: number): TMatchRecord => ({
  type: ESpanStyleTagType.GENERIC,
  isHTML: true,
  open: { start: { line, ch }, end: { line, ch: ch + 20 } },
});

const makeGenericClose = (line: number, ch: number): TMatchRecord => ({
  type: ESpanStyleTagType.GENERIC,
  isHTML: true,
  close: { start: { line, ch }, end: { line, ch: ch + 7 } },
});

const nonSpan: TMatchRecord = {
  type: 'BOLD' as never,
  isHTML: false,
  open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } },
};

describe('matchSpanTags', () => {
  test('passes non-span records through unchanged', () => {
    const result = matchSpanTags('', [nonSpan]);
    expect(result).toEqual([nonSpan]);
  });

  test('single style: merges close into open and drops close record', () => {
    const open = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
    const close = makeClose(ESpanStyleTagType.COLOR, 0, 20);
    const result = matchSpanTags('', [open, close]);

    expect(result).toEqual([open]);
    expect(result[0].close).toEqual(close.close);
  });

  test('orphaned close is discarded', () => {
    const close = makeClose(ESpanStyleTagType.COLOR, 0, 20);
    const result = matchSpanTags('', [close]);
    expect(result).toEqual([]);
  });

  test('unmatched open has no close set', () => {
    const open = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
    const result = matchSpanTags('', [open]);
    expect(result[0].close).toBeUndefined();
  });

  test('multiple styles on one span: all opens receive the same close', () => {
    const colorOpen = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
    const sizeOpen = makeOpen(ESpanStyleTagType.FONT_SIZE, 0, 0); // same position = same element
    const colorClose = makeClose(ESpanStyleTagType.COLOR, 0, 30);
    const sizeClose = makeClose(ESpanStyleTagType.FONT_SIZE, 0, 30); // duplicate position

    const result = matchSpanTags('', [colorOpen, sizeOpen, colorClose, sizeClose]);

    expect(result).toEqual([colorOpen, sizeOpen]);
    expect(result[0].close).toEqual(colorClose.close);
    expect(result[1].close).toEqual(colorClose.close);
  });

  test('nested spans of different types: inner close pairs with inner open', () => {
    const colorOpen = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
    const sizeOpen = makeOpen(ESpanStyleTagType.FONT_SIZE, 0, 15);
    const firstColorClose = makeClose(ESpanStyleTagType.COLOR, 0, 30);
    const firstSizeClose = makeClose(ESpanStyleTagType.FONT_SIZE, 0, 30);
    const secondColorClose = makeClose(ESpanStyleTagType.COLOR, 0, 45);
    const secondSizeClose = makeClose(ESpanStyleTagType.FONT_SIZE, 0, 45);

    const result = matchSpanTags('', [
      colorOpen,
      sizeOpen,
      firstColorClose,
      firstSizeClose,
      secondColorClose,
      secondSizeClose,
    ]);

    expect(result).toEqual([colorOpen, sizeOpen]);
    // Inner span (FONT_SIZE) closes at position 30.
    expect(result[1].close).toEqual(firstColorClose.close);
    // Outer span (COLOR) closes at position 45.
    expect(result[0].close).toEqual(secondColorClose.close);
  });

  test('non-span records between spans are preserved in order', () => {
    const open = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
    const close = makeClose(ESpanStyleTagType.COLOR, 0, 20);
    const result = matchSpanTags('', [open, nonSpan, close]);

    expect(result).toEqual([open, nonSpan]);
  });

  describe('GENERIC untracked-span detection', () => {
    test('GENERIC records are not included in output', () => {
      const genericOpen = makeGenericOpen(0, 0);
      const genericClose = makeGenericClose(0, 20);
      const result = matchSpanTags('', [genericOpen, genericClose]);

      expect(result).toEqual([]);
    });

    test('close records for untracked spans (GENERIC open, no specific open) are dropped', () => {
      // Simulates <span style="margin-left: 1em">hello</span> — no specific CSS match.
      const genericOpen = makeGenericOpen(0, 0);
      const colorClose = makeClose(ESpanStyleTagType.COLOR, 0, 20);
      const sizeClose = makeClose(ESpanStyleTagType.FONT_SIZE, 0, 20);
      const genericClose = makeGenericClose(0, 20);
      const result = matchSpanTags('', [genericOpen, colorClose, sizeClose, genericClose]);

      expect(result).toEqual([]);
    });

    test('close records for tracked spans (GENERIC open + specific open) are kept and paired', () => {
      // Simulates <span style="color: red">hello</span> — COLOR open matches.
      const colorOpen = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
      const genericOpen = makeGenericOpen(0, 0);
      const colorClose = makeClose(ESpanStyleTagType.COLOR, 0, 20);
      const genericClose = makeGenericClose(0, 20);
      const result = matchSpanTags('', [colorOpen, genericOpen, colorClose, genericClose]);

      expect(result).toEqual([colorOpen]);
      expect(result[0].close).toEqual(colorClose.close);
    });

    test('untracked span closes do not interfere with adjacent tracked span closes', () => {
      // Tracked span at position 0, untracked at position 15.
      const colorOpen = makeOpen(ESpanStyleTagType.COLOR, 0, 0);
      const colorGenericOpen = makeGenericOpen(0, 0);
      const untrackedGenericOpen = makeGenericOpen(0, 15);
      const untrackedColorClose = makeClose(ESpanStyleTagType.COLOR, 0, 25);
      const untrackedGenericClose = makeGenericClose(0, 25);
      const trackedColorClose = makeClose(ESpanStyleTagType.COLOR, 0, 40);
      const trackedGenericClose = makeGenericClose(0, 40);
      const result = matchSpanTags('', [
        colorOpen,
        colorGenericOpen,
        untrackedGenericOpen,
        untrackedColorClose,
        untrackedGenericClose,
        trackedColorClose,
        trackedGenericClose,
      ]);

      // Only colorOpen should be in output; untracked close (position 25) is dropped.
      expect(result).toEqual([colorOpen]);
      expect(result[0].close).toEqual(trackedColorClose.close);
    });
  });
});
