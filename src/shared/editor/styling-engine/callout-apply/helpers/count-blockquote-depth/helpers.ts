import { LEADING_BLOCKQUOTE_SEGMENTS_PATTERN } from '../../constants';

/**
 * Counts the number of ">" blockquote prefix characters on a line.
 * Used to determine callout nesting depth for parent-detection and removal.
 */
export function countBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);
  if (!prefixMatch) return 0;
  // The pattern guarantees at least one ">", so match always returns an array
  return prefixMatch[0].match(/>/g)!.length;
}
