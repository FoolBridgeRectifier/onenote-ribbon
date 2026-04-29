import { describe, it, expect, vi } from 'vitest';
import { getActiveTags } from './getActiveTags';

describe('getActiveTags', () => {
  it('returns empty array when no tags found', () => {
    const content = 'regular text\nmore text';
    const cursor = { line: 0, ch: 0 };

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = getActiveTags(content, cursor);

    expect(result).toEqual([]);
    consoleWarnSpy.mockRestore();
  });

  it('returns meeting tag when found', () => {
    const content = '---\n(title: Meeting)\n(date: 2024-01-01)\n---';
    const cursor = { line: 1, ch: 0 };

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = getActiveTags(content, cursor);

    expect(result.length).toBe(1);
    expect(result[0]?.type).toBe(1); // ESpecialTagType.MEETING_DETAILS
    consoleWarnSpy.mockRestore();
  });

  it('logs cursor position', () => {
    const content = 'text';
    const cursor = { line: 0, ch: 5 };

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getActiveTags(content, cursor);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[DetectionEngine] getActiveTags',
      { cursor },
      expect.any(Array),
    );
    consoleWarnSpy.mockRestore();
  });
});
