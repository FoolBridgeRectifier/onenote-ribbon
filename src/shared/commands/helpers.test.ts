import { getNextFontSize, getPreviousFontSize } from './helpers';

describe('getNextFontSize', () => {
  it('returns the next larger size for a known mid-range value', () => {
    expect(getNextFontSize('12')).toBe('14');
  });

  it('returns the next larger size from the smallest value', () => {
    expect(getNextFontSize('8')).toBe('9');
  });

  it('returns the same size when already at the maximum', () => {
    expect(getNextFontSize('72')).toBe('72');
  });

  it('returns the same size for an unknown value', () => {
    expect(getNextFontSize('13')).toBe('13');
  });

  it('returns the same size for an empty string', () => {
    expect(getNextFontSize('')).toBe('');
  });
});

describe('getPreviousFontSize', () => {
  it('returns the next smaller size for a known mid-range value', () => {
    expect(getPreviousFontSize('14')).toBe('12');
  });

  it('returns the next smaller size from the largest value', () => {
    expect(getPreviousFontSize('72')).toBe('48');
  });

  it('returns the same size when already at the minimum', () => {
    expect(getPreviousFontSize('8')).toBe('8');
  });

  it('returns the same size for an unknown value', () => {
    expect(getPreviousFontSize('13')).toBe('13');
  });

  it('returns the same size for an empty string', () => {
    expect(getPreviousFontSize('')).toBe('');
  });
});
