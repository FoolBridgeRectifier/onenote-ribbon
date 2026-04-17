import type { NumberLevelConfig } from '../interfaces';

// Lookup arrays for converting a 1-based counter value to its string representation.
const LOWER_ALPHA_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const LOWER_ROMAN_NUMERALS = [
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'viii',
  'ix',
  'x',
];

/**
 * Converts a 1-based counter value to its string form for the given style.
 * Values beyond the lookup range fall back to the decimal representation.
 */
function toCounterString(
  value: number,
  style: NumberLevelConfig['style'],
): string {
  switch (style) {
    case 'decimal':
      return String(value);

    case 'lower-alpha':
      return LOWER_ALPHA_CHARS[value - 1] ?? String(value);

    case 'upper-alpha':
      return (LOWER_ALPHA_CHARS[value - 1] ?? String(value)).toUpperCase();

    case 'lower-roman':
      return LOWER_ROMAN_NUMERALS[value - 1] ?? String(value);

    case 'upper-roman':
      return (LOWER_ROMAN_NUMERALS[value - 1] ?? String(value)).toUpperCase();
  }
}

/**
 * Formats a single level's preview marker string from a config and a counter value.
 *
 * Examples:
 *   formatLevelPreview({ style: 'decimal',     suffix: 'period'  }, 1) → "1."
 *   formatLevelPreview({ style: 'lower-alpha', suffix: 'paren'   }, 1) → "a)"
 *   formatLevelPreview({ style: 'lower-roman', suffix: 'wrapped' }, 1) → "(i)"
 */
export function formatLevelPreview(
  config: NumberLevelConfig,
  value: number,
): string {
  const counter = toCounterString(value, config.style);

  switch (config.suffix) {
    case 'period':
      return `${counter}.`;

    case 'paren':
      return `${counter})`;

    case 'wrapped':
      return `(${counter})`;
  }
}
