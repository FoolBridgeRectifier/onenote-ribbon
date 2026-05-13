import { EMdStyleTagType, EHtmlStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { matchHtmlTags } from '../matchHtmlTags';

const makeHtmlOpen = (type: EHtmlStyleTagType | EMdStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: true,
  open: { start: { line, ch }, end: { line, ch: ch + 3 } },
});

const makeHtmlClose = (type: EHtmlStyleTagType | EMdStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: true,
  close: { start: { line, ch }, end: { line, ch: ch + 4 } },
});

const makeNonHtml = (type: TMatchRecord['type'], line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

describe('matchHtmlTags', () => {
  test('non-HTML records pass through unchanged', () => {
    const bold = makeNonHtml(EMdStyleTagType.BOLD, 0, 0);
    const result = matchHtmlTags('', [bold]);
    expect(result).toEqual([bold]);
  });

  test('non-tracked HTML type (HASHTAG with isHTML=false) passes through', () => {
    const hashtag = makeNonHtml(ESpecialTagType.HASHTAG, 0, 0);
    const result = matchHtmlTags('', [hashtag]);
    expect(result).toEqual([hashtag]);
  });

  test('HTML open with no matching close remains in result with no close set', () => {
    const htmlOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0);
    const result = matchHtmlTags('', [htmlOpen]);
    // invalidateTags removes records strictly AFTER the unmatched open's position.
    // The open itself is at position {0,0} so nothing is strictly after it — it stays.
    expect(result).toEqual([htmlOpen]);
    expect(result[0].close).toBeUndefined();
  });

  test('HTML open paired with close: close is merged into open and both are represented by open', () => {
    const htmlOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0);
    const htmlClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 10);

    const result = matchHtmlTags('', [htmlOpen, htmlClose]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(htmlOpen);
    expect(result[0].close).toEqual(htmlClose.close);
  });

  test('orphan HTML close with no matching open is dropped', () => {
    const orphanClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 10);
    const result = matchHtmlTags('', [orphanClose]);
    expect(result).toEqual([]);
  });

  test('unmatched HTML open triggers invalidateTags: records after open are removed', () => {
    const htmlOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0);
    const boldAfter = makeNonHtml(EMdStyleTagType.BOLD, 0, 10);

    const result = matchHtmlTags('', [htmlOpen, boldAfter]);

    // invalidateTags removes everything after htmlOpen's position.
    expect(result).toEqual([htmlOpen]);
  });

  test('multiple HTML opens paired with closes in LIFO order', () => {
    const underlineOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0);
    const subscriptOpen = makeHtmlOpen(EHtmlStyleTagType.SUBSCRIPT, 0, 5);
    const subscriptClose = makeHtmlClose(EHtmlStyleTagType.SUBSCRIPT, 0, 15);
    const underlineClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 20);

    const result = matchHtmlTags('', [underlineOpen, subscriptOpen, subscriptClose, underlineClose]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(underlineOpen);
    expect(result[1]).toBe(subscriptOpen);
    // subscriptClose pairs with subscriptOpen (top of stack).
    expect(subscriptOpen.close).toEqual(subscriptClose.close);
    // underlineClose pairs with underlineOpen (now top of stack).
    expect(underlineOpen.close).toEqual(underlineClose.close);
  });

  test('EMdStyleTagType.BOLD with isHTML=true is treated as HTML style tag', () => {
    const htmlBoldOpen = makeHtmlOpen(EMdStyleTagType.BOLD, 0, 0);
    const htmlBoldClose = makeHtmlClose(EMdStyleTagType.BOLD, 0, 10);

    const result = matchHtmlTags('', [htmlBoldOpen, htmlBoldClose]);

    expect(result).toHaveLength(1);
    expect(result[0].close).toEqual(htmlBoldClose.close);
  });

  test('returns empty array for empty input', () => {
    expect(matchHtmlTags('', [])).toEqual([]);
  });
});
