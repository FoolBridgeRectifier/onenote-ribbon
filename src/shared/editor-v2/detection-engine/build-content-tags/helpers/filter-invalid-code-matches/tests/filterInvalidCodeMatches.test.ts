import { EMdStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { filterInvalidCodeMatches } from '../filterInvalidCodeMatches';

// All records on line 0 of single-line content so ch === flat offset.
const makeInlineCodeOpen = (ch: number): TMatchRecord => ({
  type: ESpecialTagType.INLINE_CODE,
  isHTML: false,
  open: { start: { line: 0, ch }, end: { line: 0, ch: ch + 1 } },
});

const makeInlineCodeClose = (ch: number): TMatchRecord => ({
  type: ESpecialTagType.INLINE_CODE,
  isHTML: false,
  close: { start: { line: 0, ch }, end: { line: 0, ch: ch + 1 } },
});

const makeBold = (ch: number): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  open: { start: { line: 0, ch }, end: { line: 0, ch: ch + 2 } },
});

const makeTagAt = (type: TMatchRecord['type'], startCh: number, endCh: number): TMatchRecord => ({
  type,
  isHTML: false,
  open: { start: { line: 0, ch: startCh }, end: { line: 0, ch: endCh } },
});

describe('filterInvalidCodeMatches', () => {
  test('non-INLINE_CODE records always pass through unchanged', () => {
    const bold = makeBold(0);
    const result = filterInvalidCodeMatches('**hello**', [bold]);
    expect(result).toEqual([bold]);
  });

  test('INLINE_CODE outside all invalid ranges passes through', () => {
    // Content has no brackets, style attrs, or special tag ranges.
    const inlineCode = makeInlineCodeOpen(0);
    const result = filterInvalidCodeMatches('`x`', [inlineCode]);
    expect(result).toEqual([inlineCode]);
  });

  test('INLINE_CODE inside square brackets is excluded', () => {
    // Content: [`x`] — bracket at 0..5, inline code at 1.
    const inlineCode = makeInlineCodeOpen(1);
    const result = filterInvalidCodeMatches('[`x`]', [inlineCode]);
    expect(result).toEqual([]);
  });

  test('INLINE_CODE inside style attribute quotes is excluded', () => {
    // Content: style="`x`" — style attr match covers "`x`" starting at offset 6.
    const content = 'style="`x`"';
    const inlineCode = makeInlineCodeOpen(7);
    const result = filterInvalidCodeMatches(content, [inlineCode]);
    expect(result).toEqual([]);
  });

  test('INLINE_CODE inside a WIKILINK tag range is excluded', () => {
    // Wikilink open covers ch 0–10; inline code at ch 3 falls inside.
    const content = '[[Page Name]]`x`';
    const wikilink = makeTagAt(ESpecialTagType.WIKILINK, 0, 13);
    const inlineCode = makeInlineCodeOpen(3);
    const result = filterInvalidCodeMatches(content, [wikilink, inlineCode]);
    expect(result).toEqual([wikilink]);
  });

  test('INLINE_CODE inside an EXTERNAL_LINK tag range is excluded', () => {
    const content = 'https://example.com`x`';
    const externalLink = makeTagAt(ESpecialTagType.EXTERNAL_LINK, 0, 19);
    const inlineCode = makeInlineCodeOpen(5);
    const result = filterInvalidCodeMatches(content, [externalLink, inlineCode]);
    expect(result).toEqual([externalLink]);
  });

  test('INLINE_CODE inside a MEETING_DETAILS tag range is excluded', () => {
    // Single-line content so ch === flat offset. Meeting range covers ch 0..20.
    const content = 'meeting block content and more';
    const meetingDetails: TMatchRecord = {
      type: ESpecialTagType.MEETING_DETAILS,
      isHTML: false,
      open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 20 } },
    };
    // INLINE_CODE at ch 5 — inside the meeting range [0, 20).
    const inlineCode = makeInlineCodeOpen(5);
    const result = filterInvalidCodeMatches(content, [meetingDetails, inlineCode]);
    expect(result).toEqual([meetingDetails]);
  });

  test('INLINE_CODE after an expired range passes through (tests rangeIndex advancement)', () => {
    // Content: [x] `y` — bracket at 0..3, inline code at 5 (outside bracket).
    const inlineCode = makeInlineCodeOpen(5);
    const result = filterInvalidCodeMatches('[x] `y`', [inlineCode]);
    expect(result).toEqual([inlineCode]);
  });

  test('INLINE_CODE close-only record uses close position for range check', () => {
    // No invalid ranges — a close-only inline code passes through.
    const inlineCodeClose = makeInlineCodeClose(5);
    const result = filterInvalidCodeMatches('hello`x`', [inlineCodeClose]);
    expect(result).toEqual([inlineCodeClose]);
  });

  test('INLINE_CODE close-only inside square bracket is excluded', () => {
    // Bracket covers [x`] — close-only inline code at ch 2 falls inside.
    const inlineCodeClose = makeInlineCodeClose(2);
    const result = filterInvalidCodeMatches('[x`]', [inlineCodeClose]);
    expect(result).toEqual([]);
  });

  test('returns empty array for empty input', () => {
    const result = filterInvalidCodeMatches('', []);
    expect(result).toEqual([]);
  });

  test('preserves order of non-code records mixed with code records', () => {
    const bold = makeBold(0);
    const inlineCode = makeInlineCodeOpen(10);
    const result = filterInvalidCodeMatches('**hello** `x`', [bold, inlineCode]);
    expect(result).toEqual([bold, inlineCode]);
  });
});
