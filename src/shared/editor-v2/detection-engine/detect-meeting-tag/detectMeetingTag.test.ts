import { detectMeetingTag } from './detectMeetingTag';
import { ESpecialTagType } from '../../interfaces';

describe('detectMeetingTag', () => {
  it('returns null for lines with less than 3 lines', () => {
    expect(detectMeetingTag(['---', 'text'])).toBeNull();
  });

  it('returns null when first line is not ---', () => {
    expect(detectMeetingTag(['text', 'field', '---'])).toBeNull();
  });

  it('detects valid meeting tag', () => {
    const lines = ['---', 'title: Meeting', 'date: 2024', '---'];
    const result = detectMeetingTag(lines);

    expect(result).not.toBeNull();
    expect(result?.type).toBe(ESpecialTagType.MEETING_DETAILS);
    expect(result?.open.start.line).toBe(0);
    expect(result?.close?.start.line).toBe(3);
    expect(result?.isProtected).toBe(true);
  });

  it('returns null when meeting fields are invalid', () => {
    const lines = ['---', 'invalid field', '---'];
    expect(detectMeetingTag(lines)).toBeNull();
  });

  it('returns null for old parenthesised field format', () => {
    const lines = ['---', '(title: Meeting)', '---'];
    expect(detectMeetingTag(lines)).toBeNull();
  });

  it('returns null for multi-word field value', () => {
    const lines = ['---', 'title: Q1 Planning', '---'];
    expect(detectMeetingTag(lines)).toBeNull();
  });
});
