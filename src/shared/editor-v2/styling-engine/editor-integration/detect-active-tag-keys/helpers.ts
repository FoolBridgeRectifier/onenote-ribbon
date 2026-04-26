import { LEADING_BLOCKQUOTE_SEGMENTS_PATTERN } from './constants';

/**
 * Counts the number of `>` blockquote prefix characters at the start of a line.
 * Used to determine callout nesting depth.
 */
export function countBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);
  if (!prefixMatch) return 0;
  // The pattern guarantees at least one ">", so the inner match is non-null.
  return prefixMatch[0].match(/>/g)!.length;
}
