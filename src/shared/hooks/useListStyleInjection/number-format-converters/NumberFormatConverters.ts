import { REQUIRED_BULLET_DEPTH_COUNT } from '../../../../tabs/home/basic-text/list-buttons/constants';
import type {
  NumberLevelConfig,
  NumberPreset,
} from '../../../../tabs/home/basic-text/list-buttons/interfaces';
import type { NumberLevelConverter } from '../../interfaces';

/** Converts a 1-based number to lowercase letters: 1→a, 2→b, ..., 26→z, 27→aa. */
function numberToLowerAlpha(value: number): string {
  let result = '';
  let remaining = value;

  while (remaining > 0) {
    remaining--;
    result = String.fromCharCode(97 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }

  return result;
}

/** Converts a 1-based number to uppercase letters: 1→A, 2→B, etc. */
function numberToUpperAlpha(value: number): string {
  return numberToLowerAlpha(value).toUpperCase();
}

/** Converts a 1-based number to lowercase Roman numerals. */
function numberToLowerRoman(value: number): string {
  const romanPairs: Array<[number, string]> = [
    [1000, 'm'],
    [900, 'cm'],
    [500, 'd'],
    [400, 'cd'],
    [100, 'c'],
    [90, 'xc'],
    [50, 'l'],
    [40, 'xl'],
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ];

  let result = '';
  let remaining = value;

  for (const [threshold, symbol] of romanPairs) {
    while (remaining >= threshold) {
      result += symbol;
      remaining -= threshold;
    }
  }

  return result;
}

/** Converts a 1-based number to uppercase Roman numerals. */
function numberToUpperRoman(value: number): string {
  return numberToLowerRoman(value).toUpperCase();
}

/** Maps a CSS list-style-type name to a number→string function. */
export function getFormatFunction(styleType: string): (value: number) => string {
  switch (styleType) {
    case 'lower-alpha':
      return numberToLowerAlpha;
    case 'upper-alpha':
      return numberToUpperAlpha;
    case 'lower-roman':
      return numberToLowerRoman;
    case 'upper-roman':
      return numberToUpperRoman;
    case 'decimal':
    default:
      return (value: number) => String(value);
  }
}

/**
 * Builds a converter function for a given NumberPreset.
 * Returns null if the preset does not have the required number of levels.
 */
export function buildNumberConverter(numberPreset: NumberPreset): NumberLevelConverter | null {
  if (numberPreset.levels.length !== REQUIRED_BULLET_DEPTH_COUNT) return null;

  const levels = numberPreset.levels as [
    NumberLevelConfig,
    NumberLevelConfig,
    NumberLevelConfig,
    NumberLevelConfig,
  ];

  return (value: number, depth: number) => {
    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const levelConfig = levels[levelIndex];
    const formattedValue = getFormatFunction(levelConfig.style)(value);

    switch (levelConfig.suffix) {
      case 'period':
        return `${formattedValue}. `;
      case 'paren':
        return `${formattedValue})  `;
      case 'wrapped':
        return `(${formattedValue})  `;
      default:
        return `${formattedValue}. `;
    }
  };
}
