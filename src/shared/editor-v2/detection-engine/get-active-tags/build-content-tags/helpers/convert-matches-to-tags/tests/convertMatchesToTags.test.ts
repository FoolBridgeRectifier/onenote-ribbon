import {
  EMdStyleTagType,
  EHtmlStyleTagType,
  ESpanStyleTagType,
  ELineTagType,
  ESpecialTagType,
} from '../../../../../../interfaces';
import type { TMatchRecord } from '../../../../find-all-matches/interfaces';
import { convertMatchesToTags } from '../convertMatchesToTags';

const range = (line: number, startCh: number, endCh: number) => ({
  start: { line, ch: startCh },
  end: { line, ch: endCh },
});

describe('convertMatchesToTags', () => {
  test('orphan close (no open) is skipped', () => {
    const orphan: TMatchRecord = { type: EMdStyleTagType.BOLD, isHTML: false, close: range(0, 10, 12) };
    expect(convertMatchesToTags('', [orphan])).toEqual([]);
  });

  describe('EMdStyleTagType', () => {
    test('unpaired open is skipped', () => {
      const match: TMatchRecord = { type: EMdStyleTagType.BOLD, isHTML: false, open: range(0, 0, 2) };
      expect(convertMatchesToTags('', [match])).toEqual([]);
    });

    test('paired non-HTML MD tag produces IMdStyleTag without isHTML', () => {
      const match: TMatchRecord = {
        type: EMdStyleTagType.BOLD,
        isHTML: false,
        open: range(0, 0, 2),
        close: range(0, 10, 12),
      };
      expect(convertMatchesToTags('', [match])).toEqual([{
        type: EMdStyleTagType.BOLD,
        open: range(0, 0, 2),
        close: range(0, 10, 12),
        isProtected: false,
      }]);
    });

    test('paired HTML-equivalent MD tag produces IMdStyleTag with isHTML:true', () => {
      const match: TMatchRecord = {
        type: EMdStyleTagType.BOLD,
        isHTML: true,
        open: range(0, 0, 3),
        close: range(0, 10, 14),
      };
      const result = convertMatchesToTags('', [match]);
      expect(result[0]).toMatchObject({ type: EMdStyleTagType.BOLD, isHTML: true, isProtected: false });
    });
  });

  describe('EHtmlStyleTagType', () => {
    test('unpaired HTML open is skipped', () => {
      const match: TMatchRecord = { type: EHtmlStyleTagType.UNDERLINE, isHTML: true, open: range(0, 0, 3) };
      expect(convertMatchesToTags('', [match])).toEqual([]);
    });

    test('paired HTML tag produces IHtmlStyleTag', () => {
      const match: TMatchRecord = {
        type: EHtmlStyleTagType.UNDERLINE,
        isHTML: true,
        open: range(0, 0, 3),
        close: range(0, 10, 14),
      };
      expect(convertMatchesToTags('', [match])).toEqual([{
        type: EHtmlStyleTagType.UNDERLINE,
        open: range(0, 0, 3),
        close: range(0, 10, 14),
        isHTML: true,
        isProtected: false,
      }]);
    });
  });

  describe('ESpanStyleTagType', () => {
    test('GENERIC span is always skipped', () => {
      const match: TMatchRecord = {
        type: ESpanStyleTagType.GENERIC,
        isHTML: true,
        open: range(0, 0, 20),
        close: range(0, 30, 37),
      };
      expect(convertMatchesToTags('', [match])).toEqual([]);
    });

    test('unpaired span open is skipped', () => {
      const match: TMatchRecord = { type: ESpanStyleTagType.COLOR, isHTML: true, open: range(0, 0, 25) };
      expect(convertMatchesToTags('', [match])).toEqual([]);
    });

    test('paired span produces ISpanStyleTag', () => {
      const match: TMatchRecord = {
        type: ESpanStyleTagType.COLOR,
        isHTML: true,
        open: range(0, 0, 25),
        close: range(0, 30, 37),
      };
      expect(convertMatchesToTags('', [match])).toEqual([{
        type: ESpanStyleTagType.COLOR,
        open: range(0, 0, 25),
        close: range(0, 30, 37),
        isHTML: true,
        isProtected: false,
      }]);
    });
  });

  describe('ELineTagType', () => {
    test('non-CALLOUT line tag produces ILineStyleTag without title', () => {
      const match: TMatchRecord = { type: ELineTagType.HEADING, isHTML: false, open: range(0, 0, 2) };
      expect(convertMatchesToTags('## My Heading', [match])).toEqual([{
        type: ELineTagType.HEADING,
        open: range(0, 0, 2),
        isHTML: false,
        isProtected: true,
      }]);
    });

    test('CALLOUT with title text extracts title', () => {
      const match: TMatchRecord = { type: ELineTagType.CALLOUT, isHTML: false, open: range(0, 0, 18) };
      const result = convertMatchesToTags('> [!note] My Title\n', [match]);
      expect(result[0]).toMatchObject({ title: ['My Title'] });
    });

    test('CALLOUT without custom title falls back to callout type', () => {
      const match: TMatchRecord = { type: ELineTagType.CALLOUT, isHTML: false, open: range(0, 0, 12) };
      const result = convertMatchesToTags('> [!warning]', [match]);
      expect(result[0]).toMatchObject({ title: ['warning'] });
    });

    test('nested callout (>>) extracts title correctly', () => {
      const match: TMatchRecord = { type: ELineTagType.CALLOUT, isHTML: false, open: range(0, 0, 22) };
      const result = convertMatchesToTags('>> [!tip] Nested Title', [match]);
      expect(result[0]).toMatchObject({ title: ['Nested Title'] });
    });
  });

  describe('ESpecialTagType', () => {
    test('non-FOOTNOTE_REF special tag has no title', () => {
      const match: TMatchRecord = { type: ESpecialTagType.HASHTAG, isHTML: false, open: range(0, 0, 5) };
      const result = convertMatchesToTags('#todo text', [match]);
      expect(result[0]).not.toHaveProperty('title');
    });

    test('FOOTNOTE_REF extracts label as title', () => {
      const match: TMatchRecord = {
        type: ESpecialTagType.FOOTNOTE_REF,
        isHTML: false,
        open: range(0, 0, 11),
      };
      const result = convertMatchesToTags('[^footnote] some text', [match]);
      expect(result[0]).toMatchObject({ type: ESpecialTagType.FOOTNOTE_REF, title: 'footnote' });
    });

    test('FOOTNOTE_REF with multi-word label extracts full label', () => {
      const match: TMatchRecord = {
        type: ESpecialTagType.FOOTNOTE_REF,
        isHTML: false,
        open: range(0, 0, 13),
      };
      const result = convertMatchesToTags('[^multi-word] some text', [match]);
      expect(result[0]).toMatchObject({ title: 'multi-word' });
    });
  });
});
