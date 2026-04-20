import { getFormatFunction, buildNumberConverter } from './NumberFormatConverters';
import type { NumberPreset } from '../../../../tabs/home/basic-text/list-buttons/interfaces';

// ── getFormatFunction ─────────────────────────────────────────────────────────

describe('getFormatFunction', () => {
  describe('lower-alpha', () => {
    const format = getFormatFunction('lower-alpha');

    it('converts 1 to "a"', () => expect(format(1)).toBe('a'));
    it('converts 26 to "z"', () => expect(format(26)).toBe('z'));
    it('converts 27 to "aa" (wraps past z)', () => expect(format(27)).toBe('aa'));
    it('converts 52 to "az"', () => expect(format(52)).toBe('az'));
  });

  describe('upper-alpha', () => {
    const format = getFormatFunction('upper-alpha');

    it('converts 1 to "A"', () => expect(format(1)).toBe('A'));
    it('converts 26 to "Z"', () => expect(format(26)).toBe('Z'));
    it('converts 27 to "AA"', () => expect(format(27)).toBe('AA'));
  });

  describe('lower-roman', () => {
    const format = getFormatFunction('lower-roman');

    it('converts 1 to "i"', () => expect(format(1)).toBe('i'));
    it('converts 4 to "iv"', () => expect(format(4)).toBe('iv'));
    it('converts 9 to "ix"', () => expect(format(9)).toBe('ix'));
    it('converts 14 to "xiv"', () => expect(format(14)).toBe('xiv'));
    it('converts 40 to "xl"', () => expect(format(40)).toBe('xl'));
    it('converts 90 to "xc"', () => expect(format(90)).toBe('xc'));
    it('converts 400 to "cd"', () => expect(format(400)).toBe('cd'));
    it('converts 900 to "cm"', () => expect(format(900)).toBe('cm'));
    it('converts 1994 to "mcmxciv"', () => expect(format(1994)).toBe('mcmxciv'));
  });

  describe('upper-roman', () => {
    const format = getFormatFunction('upper-roman');

    it('converts 1 to "I"', () => expect(format(1)).toBe('I'));
    it('converts 4 to "IV"', () => expect(format(4)).toBe('IV'));
    it('converts 1994 to "MCMXCIV"', () => expect(format(1994)).toBe('MCMXCIV'));
  });

  describe('decimal (default)', () => {
    it('returns decimal format for "decimal"', () => {
      const format = getFormatFunction('decimal');
      expect(format(1)).toBe('1');
      expect(format(42)).toBe('42');
    });

    it('returns decimal format for unknown style types', () => {
      const format = getFormatFunction('unknown-style');
      expect(format(7)).toBe('7');
    });
  });
});

// ── buildNumberConverter ──────────────────────────────────────────────────────

describe('buildNumberConverter', () => {
  it('returns null when the preset has fewer than 4 levels', () => {
    const preset: NumberPreset = {
      id: 'bad',
      label: 'Bad',
      // empty array (the "None" variant) → length !== REQUIRED_BULLET_DEPTH_COUNT
      levels: [],
    };

    expect(buildNumberConverter(preset)).toBeNull();
  });

  it('returns a converter function for a valid 4-level preset', () => {
    const preset: NumberPreset = {
      id: 'test',
      label: 'Test',
      levels: [
        { style: 'decimal', suffix: 'period' },
        { style: 'lower-alpha', suffix: 'paren' },
        { style: 'lower-roman', suffix: 'wrapped' },
        { style: 'upper-alpha', suffix: 'period' },
      ],
    };

    const converter = buildNumberConverter(preset);
    expect(converter).not.toBeNull();
  });

  it('formats depth 1 (level index 0) with period suffix as "1. "', () => {
    const preset: NumberPreset = {
      id: 'test',
      label: 'Test',
      levels: [
        { style: 'decimal', suffix: 'period' },
        { style: 'decimal', suffix: 'paren' },
        { style: 'decimal', suffix: 'wrapped' },
        { style: 'decimal', suffix: 'period' },
      ],
    };

    const converter = buildNumberConverter(preset)!;

    expect(converter(1, 1)).toBe('1. ');
  });

  it('formats depth 2 (level index 1) with paren suffix as "1)  "', () => {
    const preset: NumberPreset = {
      id: 'test',
      label: 'Test',
      levels: [
        { style: 'decimal', suffix: 'period' },
        { style: 'decimal', suffix: 'paren' },
        { style: 'decimal', suffix: 'wrapped' },
        { style: 'decimal', suffix: 'period' },
      ],
    };

    const converter = buildNumberConverter(preset)!;

    expect(converter(1, 2)).toBe('1)  ');
  });

  it('formats depth 3 (level index 2) with wrapped suffix as "(1)  "', () => {
    const preset: NumberPreset = {
      id: 'test',
      label: 'Test',
      levels: [
        { style: 'decimal', suffix: 'period' },
        { style: 'decimal', suffix: 'paren' },
        { style: 'decimal', suffix: 'wrapped' },
        { style: 'decimal', suffix: 'period' },
      ],
    };

    const converter = buildNumberConverter(preset)!;

    expect(converter(1, 3)).toBe('(1)  ');
  });

  it('falls back to period suffix for unrecognized suffix values', () => {
    const preset: NumberPreset = {
      id: 'test',
      label: 'Test',
      levels: [
        { style: 'decimal', suffix: 'unknown' as 'period' },
        { style: 'decimal', suffix: 'period' },
        { style: 'decimal', suffix: 'period' },
        { style: 'decimal', suffix: 'period' },
      ],
    };

    const converter = buildNumberConverter(preset)!;

    // Default case in the switch — falls back to `${formattedValue}. `
    expect(converter(3, 1)).toBe('3. ');
  });

  it('wraps depth cycle back to level index 0 at depth 5 (depth 5 % 4 = 0)', () => {
    const preset: NumberPreset = {
      id: 'test',
      label: 'Test',
      levels: [
        { style: 'decimal', suffix: 'period' },
        { style: 'lower-alpha', suffix: 'period' },
        { style: 'lower-roman', suffix: 'period' },
        { style: 'upper-alpha', suffix: 'period' },
      ],
    };

    const converter = buildNumberConverter(preset)!;

    // Depth 1 → level index 0 → decimal
    expect(converter(1, 1)).toBe('1. ');
    // Depth 5 → (5-1) % 4 = 0 → same as depth 1
    expect(converter(1, 5)).toBe('1. ');
    // Depth 2 → level index 1 → lower-alpha
    expect(converter(1, 2)).toBe('a. ');
  });
});
