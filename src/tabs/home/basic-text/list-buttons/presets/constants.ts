import type { NumberStyleType } from '../interfaces';

/** Rotating cycle of number styles used when building multi-level presets. */
export const DEPTH_STYLE_CYCLE: NumberStyleType[] = [
  'decimal',
  'lower-alpha',
  'lower-roman',
  'upper-alpha',
  'upper-roman',
];
