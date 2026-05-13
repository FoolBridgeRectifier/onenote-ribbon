import {
  EMdStyleTagType,
  EHtmlStyleTagType,
  ESpanStyleTagType,
  ELineTagType,
  ESpecialTagType,
} from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { convertMatchesToTags } from '../convertMatchesToTags';

const makeMatch = (type: TMatchRecord['type'], isHTML: boolean): TMatchRecord => ({
  type,
  isHTML,
  open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } },
});

describe('convertMatchesToTags', () => {
  test('returns empty array for empty input', () => {
    expect(convertMatchesToTags([])).toEqual([]);
  });

  describe('isProtected = false for style types', () => {
    test.each([
      [EMdStyleTagType.BOLD, false],
      [EMdStyleTagType.ITALIC, false],
      [EMdStyleTagType.STRIKETHROUGH, false],
      [EMdStyleTagType.HIGHLIGHT, false],
      [EHtmlStyleTagType.UNDERLINE, true],
      [EHtmlStyleTagType.SUBSCRIPT, true],
      [EHtmlStyleTagType.SUPERSCRIPT, true],
      [ESpanStyleTagType.COLOR, true],
      [ESpanStyleTagType.FONT_SIZE, true],
    ] as const)(
      'type %s is not protected',
      (type, isHTML) => {
        const [result] = convertMatchesToTags([makeMatch(type, isHTML)]);
        expect(result.isProtected).toBe(false);
      }
    );
  });

  describe('isProtected = true for line and special types', () => {
    test.each([
      ELineTagType.LIST,
      ELineTagType.HEADING,
      ELineTagType.QUOTE,
      ELineTagType.INDENT,
      ELineTagType.CHECKBOX,
      ELineTagType.CALLOUT,
      ELineTagType.DIVIDER,
      ESpecialTagType.BLOCK_CODE,
      ESpecialTagType.INLINE_CODE,
      ESpecialTagType.LINE_CODE,
      ESpecialTagType.HASHTAG,
      ESpecialTagType.MEETING_DETAILS,
      ESpecialTagType.WIKILINK,
      ESpecialTagType.EMBED,
      ESpecialTagType.EXTERNAL_LINK,
      ESpecialTagType.FOOTNOTE_REF,
    ])('type %s is protected', (type) => {
      const [result] = convertMatchesToTags([makeMatch(type, false)]);
      expect(result.isProtected).toBe(true);
    });
  });

  test('preserves all fields from the original match record', () => {
    const match: TMatchRecord = {
      type: EMdStyleTagType.BOLD,
      isHTML: false,
      title: ['My Title'],
      open: { start: { line: 1, ch: 5 }, end: { line: 1, ch: 7 } },
      close: { start: { line: 1, ch: 15 }, end: { line: 1, ch: 17 } },
    };
    // Cast to access spread properties not declared on every TTag union member.
    const result = convertMatchesToTags([match])[0] as unknown as TMatchRecord & { isProtected: boolean };

    expect(result.type).toBe(EMdStyleTagType.BOLD);
    expect(result.isHTML).toBe(false);
    expect(result.title).toEqual(['My Title']);
    expect(result.open).toEqual(match.open);
    expect(result.close).toEqual(match.close);
  });

  test('processes multiple matches preserving order', () => {
    const matches: TMatchRecord[] = [
      makeMatch(EMdStyleTagType.BOLD, false),
      makeMatch(ELineTagType.HEADING, false),
      makeMatch(ESpecialTagType.HASHTAG, false),
    ];
    const results = convertMatchesToTags(matches);

    expect(results).toHaveLength(3);
    expect(results[0].isProtected).toBe(false);
    expect(results[1].isProtected).toBe(true);
    expect(results[2].isProtected).toBe(true);
  });
});
