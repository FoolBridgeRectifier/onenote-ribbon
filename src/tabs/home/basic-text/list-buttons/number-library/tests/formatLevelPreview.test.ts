import { formatLevelPreview } from '../formatLevelPreview';
import type { NumberLevelConfig } from '../../interfaces';

describe('formatLevelPreview', () => {
  describe('decimal style', () => {
    it('returns "1." for period suffix', () => {
      const config: NumberLevelConfig = { style: 'decimal', suffix: 'period' };
      expect(formatLevelPreview(config, 1)).toBe('1.');
    });

    it('returns "3." for value 3 with period suffix', () => {
      const config: NumberLevelConfig = { style: 'decimal', suffix: 'period' };
      expect(formatLevelPreview(config, 3)).toBe('3.');
    });

    it('returns "1)" for paren suffix', () => {
      const config: NumberLevelConfig = { style: 'decimal', suffix: 'paren' };
      expect(formatLevelPreview(config, 1)).toBe('1)');
    });

    it('returns "(1)" for wrapped suffix', () => {
      const config: NumberLevelConfig = { style: 'decimal', suffix: 'wrapped' };
      expect(formatLevelPreview(config, 1)).toBe('(1)');
    });
  });

  describe('lower-alpha style', () => {
    it('returns "a." for value 1 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-alpha',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 1)).toBe('a.');
    });

    it('returns "c." for value 3 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-alpha',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 3)).toBe('c.');
    });

    it('returns "a)" for paren suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-alpha',
        suffix: 'paren',
      };
      expect(formatLevelPreview(config, 1)).toBe('a)');
    });

    it('returns "(a)" for wrapped suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-alpha',
        suffix: 'wrapped',
      };
      expect(formatLevelPreview(config, 1)).toBe('(a)');
    });
  });

  describe('upper-alpha style', () => {
    it('returns "A." for value 1 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-alpha',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 1)).toBe('A.');
    });

    it('returns "C." for value 3 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-alpha',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 3)).toBe('C.');
    });

    it('returns "A)" for paren suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-alpha',
        suffix: 'paren',
      };
      expect(formatLevelPreview(config, 1)).toBe('A)');
    });

    it('returns "(A)" for wrapped suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-alpha',
        suffix: 'wrapped',
      };
      expect(formatLevelPreview(config, 1)).toBe('(A)');
    });
  });

  describe('lower-roman style', () => {
    it('returns "i." for value 1 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-roman',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 1)).toBe('i.');
    });

    it('returns "iii." for value 3 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-roman',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 3)).toBe('iii.');
    });

    it('returns "i)" for paren suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-roman',
        suffix: 'paren',
      };
      expect(formatLevelPreview(config, 1)).toBe('i)');
    });

    it('returns "(i)" for wrapped suffix', () => {
      const config: NumberLevelConfig = {
        style: 'lower-roman',
        suffix: 'wrapped',
      };
      expect(formatLevelPreview(config, 1)).toBe('(i)');
    });
  });

  describe('upper-roman style', () => {
    it('returns "I." for value 1 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-roman',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 1)).toBe('I.');
    });

    it('returns "III." for value 3 with period suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-roman',
        suffix: 'period',
      };
      expect(formatLevelPreview(config, 3)).toBe('III.');
    });

    it('returns "I)" for paren suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-roman',
        suffix: 'paren',
      };
      expect(formatLevelPreview(config, 1)).toBe('I)');
    });

    it('returns "(I)" for wrapped suffix', () => {
      const config: NumberLevelConfig = {
        style: 'upper-roman',
        suffix: 'wrapped',
      };
      expect(formatLevelPreview(config, 1)).toBe('(I)');
    });
  });

  describe('out-of-range values fall back to decimal', () => {
    it('returns "27." when lower-alpha runs out of letters (value 27)', () => {
      const config: NumberLevelConfig = {
        style: 'lower-alpha',
        suffix: 'period',
      };
      // LOWER_ALPHA_CHARS only has 26 entries; value 27 should fallback to "27."
      expect(formatLevelPreview(config, 27)).toBe('27.');
    });

    it('returns "11." when lower-roman runs out of entries (value 11)', () => {
      const config: NumberLevelConfig = {
        style: 'lower-roman',
        suffix: 'period',
      };
      // LOWER_ROMAN_NUMERALS only has 10 entries; value 11 should fallback to "11."
      expect(formatLevelPreview(config, 11)).toBe('11.');
    });
  });
});
