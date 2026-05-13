import { EMdStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { filterTagsInCodeBlocks } from '../filterTagsInCodeBlocks';

const makeOpen = (type: TMatchRecord['type'], line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 3 } },
});

const makeClose = (type: TMatchRecord['type'], line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  close: { start: { line, ch }, end: { line, ch: ch + 3 } },
});

const makeBold = (line: number, ch: number): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

describe('filterTagsInCodeBlocks', () => {
  test('non-code records pass through when no block is open', () => {
    const bold = makeBold(0, 0);
    const result = filterTagsInCodeBlocks('**hello**', [bold]);
    expect(result).toEqual([bold]);
  });

  test('code-type close-only record outside a block is dropped (not pushed)', () => {
    const orphanClose = makeClose(ESpecialTagType.BLOCK_CODE, 0, 0);
    const result = filterTagsInCodeBlocks('```', [orphanClose]);
    expect(result).toEqual([]);
  });

  describe('BLOCK_CODE', () => {
    test('open record is included; close is set on the open record', () => {
      const content = '```\nbody\n```';
      const blockOpen = makeOpen(ESpecialTagType.BLOCK_CODE, 0, 0);
      const blockClose = makeClose(ESpecialTagType.BLOCK_CODE, 2, 0);

      const result = filterTagsInCodeBlocks(content, [blockOpen, blockClose]);

      expect(result).toEqual([blockOpen]);
      expect(result[0].close).toEqual(blockClose.close);
    });

    test('non-code tags inside a block are filtered out', () => {
      const content = '```\nbody\n```';
      const blockOpen = makeOpen(ESpecialTagType.BLOCK_CODE, 0, 0);
      const boldInside = makeBold(1, 0);
      const blockClose = makeClose(ESpecialTagType.BLOCK_CODE, 2, 0);

      const result = filterTagsInCodeBlocks(content, [blockOpen, boldInside, blockClose]);

      expect(result).toEqual([blockOpen]);
      expect(result[0].close).toEqual(blockClose.close);
    });

    test('close at same position as open is not used (isSameTagPosition guard)', () => {
      const content = '```';
      const blockOpen = makeOpen(ESpecialTagType.BLOCK_CODE, 0, 0);
      // Close at the same start position as open → isSameTagPosition = true → not matched.
      const blockCloseAtSamePos = makeClose(ESpecialTagType.BLOCK_CODE, 0, 0);

      const result = filterTagsInCodeBlocks(content, [blockOpen, blockCloseAtSamePos]);

      // Block stays unclosed → EOF sets close to end of last line.
      expect(result).toEqual([blockOpen]);
      expect(result[0].close).toEqual({ start: { line: 0, ch: 3 }, end: { line: 0, ch: 3 } });
    });

    test('unclosed BLOCK_CODE at EOF gets close set to end of last line', () => {
      const content = '```\ncode here';
      const blockOpen = makeOpen(ESpecialTagType.BLOCK_CODE, 0, 0);

      const result = filterTagsInCodeBlocks(content, [blockOpen]);

      expect(result).toEqual([blockOpen]);
      // Last line is line 1: 'code here' = 9 chars.
      expect(result[0].close).toEqual({ start: { line: 1, ch: 9 }, end: { line: 1, ch: 9 } });
    });

    test('records after a closed block are included normally', () => {
      const content = '```\nbody\n```\n**after**';
      const blockOpen = makeOpen(ESpecialTagType.BLOCK_CODE, 0, 0);
      const blockClose = makeClose(ESpecialTagType.BLOCK_CODE, 2, 0);
      const boldAfter = makeBold(3, 0);

      const result = filterTagsInCodeBlocks(content, [blockOpen, blockClose, boldAfter]);

      expect(result).toEqual([blockOpen, boldAfter]);
    });
  });

  describe('INLINE_CODE', () => {
    test('open and close on same line are matched; close is set on open record', () => {
      const inlineOpen = makeOpen(ESpecialTagType.INLINE_CODE, 0, 0);
      const inlineClose = makeClose(ESpecialTagType.INLINE_CODE, 0, 5);

      const result = filterTagsInCodeBlocks('`code`', [inlineOpen, inlineClose]);

      expect(result).toEqual([inlineOpen]);
      expect(result[0].close).toEqual(inlineClose.close);
    });

    test('non-code tags inside inline code on same line are filtered out', () => {
      const inlineOpen = makeOpen(ESpecialTagType.INLINE_CODE, 0, 0);
      const boldInside = makeBold(0, 2);
      const inlineClose = makeClose(ESpecialTagType.INLINE_CODE, 0, 8);

      const result = filterTagsInCodeBlocks('`**bold**`', [inlineOpen, boldInside, inlineClose]);

      expect(result).toEqual([inlineOpen]);
      expect(result[0].close).toEqual(inlineClose.close);
    });

    test('close at same position as open is not used (isSameTagPosition guard)', () => {
      const content = '`x`';
      const inlineOpen = makeOpen(ESpecialTagType.INLINE_CODE, 0, 0);
      // Close at same start position → isSameTagPosition = true → not matched.
      const inlineCloseAtSamePos = makeClose(ESpecialTagType.INLINE_CODE, 0, 0);
      const inlineCloseReal = makeClose(ESpecialTagType.INLINE_CODE, 0, 2);

      const result = filterTagsInCodeBlocks(content, [inlineOpen, inlineCloseAtSamePos, inlineCloseReal]);

      expect(result).toEqual([inlineOpen]);
      expect(result[0].close).toEqual(inlineCloseReal.close);
    });

    test('inline code open with no close on same line gets close set to line end', () => {
      const content = 'line0\nline1';
      const inlineOpen = makeOpen(ESpecialTagType.INLINE_CODE, 0, 0);
      const boldOnLine1 = makeBold(1, 0);

      const result = filterTagsInCodeBlocks(content, [inlineOpen, boldOnLine1]);

      // Inline code closed at end of line 0: 'line0' = 5 chars.
      expect(result[0].close).toEqual({ start: { line: 0, ch: 5 }, end: { line: 0, ch: 5 } });
      // Bold on line 1 is included after inline code closes.
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(boldOnLine1);
    });
  });

  describe('LINE_CODE', () => {
    test('line code open is included; records on the same line are filtered (default else)', () => {
      const lineCodeOpen = makeOpen(ESpecialTagType.LINE_CODE, 0, 0);
      const boldSameLine = makeBold(0, 5);

      const result = filterTagsInCodeBlocks('  code\n', [lineCodeOpen, boldSameLine]);

      expect(result).toEqual([lineCodeOpen]);
    });

    test('records on a later line are included after line code expires', () => {
      const content = '\tcode\nnormal';
      const lineCodeOpen = makeOpen(ESpecialTagType.LINE_CODE, 0, 0);
      const boldNextLine = makeBold(1, 0);

      const result = filterTagsInCodeBlocks(content, [lineCodeOpen, boldNextLine]);

      expect(result).toEqual([lineCodeOpen, boldNextLine]);
    });
  });

  test('returns empty array for empty input', () => {
    const result = filterTagsInCodeBlocks('', []);
    expect(result).toEqual([]);
  });
});
