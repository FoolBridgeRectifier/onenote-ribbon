import { SIZES } from '../../tabs/home/basic-text/font-picker/constants';

/**
 * Returns the next larger font size from the picker's size list.
 * Returns the current size unchanged if already at the maximum.
 */
export function getNextFontSize(currentSize: string): string {
  const sizeIndex = SIZES.indexOf(currentSize);

  // Unknown size or already at max — leave unchanged
  if (sizeIndex === -1 || sizeIndex === SIZES.length - 1) return currentSize;

  return SIZES[sizeIndex + 1];
}

/**
 * Returns the next smaller font size from the picker's size list.
 * Returns the current size unchanged if already at the minimum.
 */
export function getPreviousFontSize(currentSize: string): string {
  const sizeIndex = SIZES.indexOf(currentSize);

  // Unknown size or already at min — leave unchanged
  if (sizeIndex <= 0) return currentSize;

  return SIZES[sizeIndex - 1];
}
