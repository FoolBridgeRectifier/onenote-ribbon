import { buildContentTags } from '../index';
import { EMdStyleTagType, ESpecialTagType } from '../../../interfaces';
import type { TMatchRecord } from '../interfaces';

type TTagWithMeta = TMatchRecord & { isProtected: boolean };

// Cast helper: buildContentTags returns TTag[] but TMatchRecord fields are present at runtime.
const buildTags = (content: string) => buildContentTags(content) as unknown as TTagWithMeta[];

describe('buildContentTags', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('returns empty array for empty content', () => {
    const result = buildContentTags('');
    expect(result).toEqual([]);
  });

  test('detects a bold tag with open and close positions (tag.open && tag.close branches)', () => {
    // **bold** produces a BOLD tag with both open and close after matchMdTags.
    const result = buildTags('**bold**');
    const boldTag = result.find((tag) => tag.type === EMdStyleTagType.BOLD);

    expect(boldTag).not.toBeUndefined();
    expect(boldTag?.open).not.toBeUndefined();
    expect(boldTag?.close).not.toBeUndefined();
    expect(boldTag?.isProtected).toBe(false);
  });

  test('detects a hashtag with only an open position (tag.close falsy branch)', () => {
    // Atomic token: no close position.
    const result = buildTags('#mytag');
    const hashtagTag = result.find((tag) => tag.type === ESpecialTagType.HASHTAG);

    expect(hashtagTag).not.toBeUndefined();
    expect(hashtagTag?.open).not.toBeUndefined();
    expect(hashtagTag?.close).toBeUndefined();
    expect(hashtagTag?.isProtected).toBe(true);
  });

  test('detects a footnote definition as a close-only record (tag.open falsy branch)', () => {
    // '[^foot]:' at line start — produces a close-only FOOTNOTE_REF (no inline ref present).
    const result = buildTags('[^foot]:');
    const footnoteTag = result.find((tag) => tag.type === ESpecialTagType.FOOTNOTE_REF);

    expect(footnoteTag).not.toBeUndefined();
    expect(footnoteTag?.close).not.toBeUndefined();
    expect(footnoteTag?.open).toBeUndefined();
  });

  test('covers all console.warn branches with content having open-only, close-only, and paired tags', () => {
    // **bold** → paired (open + close)
    // #hashtag → open-only
    // [^foot]: → close-only
    buildContentTags('**bold** #hashtag\n[^foot]:');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('[buildContentTags]', expect.any(Array));
  });

  test('applies all filters in pipeline: MD tag inside code block is removed', () => {
    // Inside a fenced code block, bold should not appear as a tag.
    const result = buildTags('```\n**bold**\n```');
    const boldTag = result.find((tag) => tag.type === EMdStyleTagType.BOLD);

    expect(boldTag).toBeUndefined();
  });

  test('detects a heading with its title', () => {
    const result = buildTags('# My Heading');
    const headingTag = result.find((tag) => tag.type === 'HEADING');

    expect(headingTag).not.toBeUndefined();
    expect(headingTag?.title).toEqual(['My Heading']);
  });

  test('result tags have isProtected=true for special/line types and false for style types', () => {
    const result = buildTags('**bold** #hashtag');

    const boldTag = result.find((tag) => tag.type === EMdStyleTagType.BOLD);
    const hashtagTag = result.find((tag) => tag.type === ESpecialTagType.HASHTAG);

    expect(boldTag?.isProtected).toBe(false);
    expect(hashtagTag?.isProtected).toBe(true);
  });

  test('console.warn is called once per invocation with the tag log array', () => {
    buildContentTags('# hello');
    buildContentTags('**bold**');

    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
