import { describe, it, expect, vi } from 'vitest';
import { getTagsInSelection } from './getTagsInSelection';

describe('getTagsInSelection', () => {
  it('returns empty array', () => {
    const result = getTagsInSelection(null, 0, 10);
    expect(result).toEqual([]);
  });

  it('logs selection range', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const context = { some: 'context' };
    const startCh = 5;
    const endCh = 15;

    getTagsInSelection(context, startCh, endCh);

    expect(consoleWarnSpy).toHaveBeenCalledWith('[DetectionEngine] getTagsInSelection', {
      startCh,
      endCh,
    });
    consoleWarnSpy.mockRestore();
  });
});
