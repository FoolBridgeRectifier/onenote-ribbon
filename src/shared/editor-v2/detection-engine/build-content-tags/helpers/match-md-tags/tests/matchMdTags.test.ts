import { EMdStyleTagType, EHtmlStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { matchMdTags } from '../matchMdTags';

const makeMdOpen = (type: EMdStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

const makeMdClose = (type: EMdStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  close: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

const makeNonMd = (type: TMatchRecord['type'], line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 3 } },
});

const makeHtmlMd = (type: EMdStyleTagType, line: number, ch: number): TMatchRecord => ({
  type,
  isHTML: true,
  open: { start: { line, ch }, end: { line, ch: ch + 3 } },
});

describe('matchMdTags', () => {
  test('non-MD records pass through unchanged', () => {
    const hashtag = makeNonMd(ESpecialTagType.HASHTAG, 0, 0);
    const result = matchMdTags('', [hashtag]);
    expect(result).toEqual([hashtag]);
  });

  test('MD records with isHTML=true pass through unchanged (treated as non-MD)', () => {
    const htmlBold = makeHtmlMd(EMdStyleTagType.BOLD, 0, 0);
    const result = matchMdTags('', [htmlBold]);
    expect(result).toEqual([htmlBold]);
  });

  test('matched open-close pair: close is merged into open, open is in result', () => {
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);
    const boldClose = makeMdClose(EMdStyleTagType.BOLD, 0, 7);

    const result = matchMdTags('**hello**', [boldOpen, boldClose]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(boldOpen);
    expect(result[0].close).toEqual(boldClose.close);
  });

  test('MD close when stack is empty is ignored (orphan close)', () => {
    const boldClose = makeMdClose(EMdStyleTagType.BOLD, 0, 5);
    const result = matchMdTags('', [boldClose]);
    expect(result).toEqual([]);
  });

  test('MD close at same position as open is not merged (isSameTagPosition guard)', () => {
    const content = '**hello**';
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);
    // Close at same start position as open → isSameTagPosition = true → ignored.
    const boldCloseAtSamePos = makeMdClose(EMdStyleTagType.BOLD, 0, 0);

    const result = matchMdTags(content, [boldOpen, boldCloseAtSamePos]);

    // Open remains unmatched; flushed at EOF with calcLineEnd.
    expect(result).toHaveLength(1);
    // Line 0 of '**hello**' = 9 chars.
    expect(result[0].close).toEqual({ start: { line: 0, ch: 9 }, end: { line: 0, ch: 9 } });
  });

  test('unmatched open at EOF: close is set to end of the open line', () => {
    const content = '**hello';
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);

    const result = matchMdTags(content, [boldOpen]);

    expect(result).toHaveLength(1);
    // Line 0 of '**hello' = 7 chars.
    expect(result[0].close).toEqual({ start: { line: 0, ch: 7 }, end: { line: 0, ch: 7 } });
  });

  test('unmatched open followed by non-MD on same line: close is set to non-MD start', () => {
    const content = '**hello #tag';
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);
    const hashtag = makeNonMd(ESpecialTagType.HASHTAG, 0, 7);

    const result = matchMdTags(content, [boldOpen, hashtag]);

    // Bold gets close at hashtag's start position (same line).
    expect(result[0].close).toEqual({ start: { line: 0, ch: 7 }, end: { line: 0, ch: 7 } });
    // Hashtag passes through.
    expect(result[1]).toBe(hashtag);
  });

  test('unmatched open followed by non-MD on different line: close is set to line end', () => {
    const content = '**hello\n#tag';
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);
    // Non-MD record on line 1.
    const hashtag = makeNonMd(ESpecialTagType.HASHTAG, 1, 0);

    const result = matchMdTags(content, [boldOpen, hashtag]);

    // Bold close is set to end of line 0: '**hello' = 7 chars.
    expect(result[0].close).toEqual({ start: { line: 0, ch: 7 }, end: { line: 0, ch: 7 } });
    expect(result[1]).toBe(hashtag);
  });

  test('matched MD open between unmatched open and non-MD does not trigger close', () => {
    // Bold (unmatched), Italic (matched), HTML Underline (non-MD-style).
    const content = '**hello *world* end';
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);
    const italicOpen = makeMdOpen(EMdStyleTagType.ITALIC, 0, 7);
    const italicClose = makeMdClose(EMdStyleTagType.ITALIC, 0, 13);
    const underline = {
      type: EHtmlStyleTagType.UNDERLINE,
      isHTML: true,
      open: { start: { line: 0, ch: 16 }, end: { line: 0, ch: 19 } },
    };

    const result = matchMdTags(content, [boldOpen, italicOpen, italicClose, underline]);

    // italicOpen is matched (close merged). boldOpen is unmatched.
    // italicOpen (matched, not in unmatchedSet) is processed but doesn't flush pendingCloses.
    // underline (non-MD/HTML) → flushes boldOpen's close.
    expect(result[0]).toBe(boldOpen);
    expect(result[0].close).toEqual({ start: { line: 0, ch: 16 }, end: { line: 0, ch: 16 } });
    expect(result[1]).toBe(italicOpen);
    expect(result[1].close).toEqual(italicClose.close);
  });

  test('multiple unmatched opens: all get close set when non-MD is encountered', () => {
    const content = '**hello *world #tag';
    const boldOpen = makeMdOpen(EMdStyleTagType.BOLD, 0, 0);
    const italicOpen = makeMdOpen(EMdStyleTagType.ITALIC, 0, 7);
    const hashtag = makeNonMd(ESpecialTagType.HASHTAG, 0, 14);

    const result = matchMdTags(content, [boldOpen, italicOpen, hashtag]);

    // Both bold and italic get close at hashtag's position (same line).
    expect(result[0].close).toEqual({ start: { line: 0, ch: 14 }, end: { line: 0, ch: 14 } });
    expect(result[1].close).toEqual({ start: { line: 0, ch: 14 }, end: { line: 0, ch: 14 } });
  });

  test('returns empty array for empty input', () => {
    expect(matchMdTags('', [])).toEqual([]);
  });
});
