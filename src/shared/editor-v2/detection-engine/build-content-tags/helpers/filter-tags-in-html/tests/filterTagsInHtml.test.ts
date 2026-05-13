import { EMdStyleTagType, EHtmlStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { filterTagsInHtml } from '../filterTagsInHtml';

const makeHtmlOpen = (type: TMatchRecord['type'], line: number, ch: number, endCh: number): TMatchRecord => ({
  type,
  isHTML: true,
  open: { start: { line, ch }, end: { line, ch: endCh } },
});

const makeHtmlClose = (type: TMatchRecord['type'], line: number, ch: number, endCh: number): TMatchRecord => ({
  type,
  isHTML: true,
  close: { start: { line, ch }, end: { line, ch: endCh } },
});

const makeMd = (type: TMatchRecord['type'], line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

const makeHashtag = (line: number, ch: number): TMatchRecord => ({
  type: ESpecialTagType.HASHTAG,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 5 } },
});

describe('filterTagsInHtml', () => {
  test('non-HTML and non-filtered records outside any HTML range pass through', () => {
    const bold = makeMd(EMdStyleTagType.BOLD, 0, 0);
    const result = filterTagsInHtml('', [bold]);
    expect(result).toEqual([bold]);
  });

  test('MD style tag inside an HTML block is removed', () => {
    // HTML open at ch 0, MD bold inside at ch 10, HTML close at ch 20.
    const htmlOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0, 3);
    const boldInside = makeMd(EMdStyleTagType.BOLD, 0, 10);
    const htmlClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 20, 24);

    const result = filterTagsInHtml('', [htmlOpen, boldInside, htmlClose]);

    expect(result).toEqual([htmlOpen, htmlClose]);
  });

  test('HASHTAG inside an HTML block is removed', () => {
    const htmlOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0, 3);
    const hashtagInside = makeHashtag(0, 10);
    const htmlClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 20, 24);

    const result = filterTagsInHtml('', [htmlOpen, hashtagInside, htmlClose]);

    expect(result).toEqual([htmlOpen, htmlClose]);
  });

  test('MD tag outside HTML range is kept', () => {
    const htmlOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0, 3);
    const htmlClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 5, 9);
    const boldOutside = makeMd(EMdStyleTagType.BOLD, 0, 15);

    const result = filterTagsInHtml('', [htmlOpen, htmlClose, boldOutside]);

    expect(result).toEqual([htmlOpen, htmlClose, boldOutside]);
  });

  test('nested HTML tags: depth tracking prevents premature range close', () => {
    // Outer HTML open at ch 0, inner HTML open at ch 5, inner close at ch 15, outer close at ch 25.
    // MD tag at ch 10 falls between inner open and close — inside HTML range.
    const outerOpen = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0, 3);
    const innerOpen = makeHtmlOpen(EHtmlStyleTagType.SUBSCRIPT, 0, 5, 10);
    const boldInside = makeMd(EMdStyleTagType.BOLD, 0, 10);
    const innerClose = makeHtmlClose(EHtmlStyleTagType.SUBSCRIPT, 0, 15, 21);
    const outerClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 25, 29);

    const result = filterTagsInHtml('', [outerOpen, innerOpen, boldInside, innerClose, outerClose]);

    // Bold is inside the outer HTML block, so removed.
    expect(result).toEqual([outerOpen, innerOpen, innerClose, outerClose]);
  });

  test('multiple separate HTML blocks: each creates its own range', () => {
    const htmlOpen1 = makeHtmlOpen(EHtmlStyleTagType.UNDERLINE, 0, 0, 3);
    const boldInside1 = makeMd(EMdStyleTagType.BOLD, 0, 5);
    const htmlClose1 = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 10, 14);
    const boldBetween = makeMd(EMdStyleTagType.BOLD, 0, 20);
    const htmlOpen2 = makeHtmlOpen(EHtmlStyleTagType.SUBSCRIPT, 0, 30, 35);
    const boldInside2 = makeMd(EMdStyleTagType.BOLD, 0, 40);
    const htmlClose2 = makeHtmlClose(EHtmlStyleTagType.SUBSCRIPT, 0, 50, 56);

    const result = filterTagsInHtml('', [
      htmlOpen1, boldInside1, htmlClose1,
      boldBetween,
      htmlOpen2, boldInside2, htmlClose2,
    ]);

    // Only the bold between the two HTML blocks passes through.
    expect(result).toEqual([htmlOpen1, htmlClose1, boldBetween, htmlOpen2, htmlClose2]);
  });

  test('htmlDepth never goes below zero (extra closes are benign)', () => {
    // Extra HTML close with no matching open: depth clamped at 0, no range created.
    const extraClose = makeHtmlClose(EHtmlStyleTagType.UNDERLINE, 0, 0, 4);
    const bold = makeMd(EMdStyleTagType.BOLD, 0, 10);

    const result = filterTagsInHtml('', [extraClose, bold]);

    // Bold is outside any HTML range (no valid range was ever started).
    expect(result).toEqual([extraClose, bold]);
  });

  test('returns all records unchanged when there are no HTML records', () => {
    const bold = makeMd(EMdStyleTagType.BOLD, 0, 0);
    const hashtag = makeHashtag(0, 10);

    const result = filterTagsInHtml('', [bold, hashtag]);

    expect(result).toEqual([bold, hashtag]);
  });

  test('returns empty array for empty input', () => {
    expect(filterTagsInHtml('', [])).toEqual([]);
  });
});
