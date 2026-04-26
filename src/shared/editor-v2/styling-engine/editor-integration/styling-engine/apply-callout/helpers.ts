import { LEADING_BLOCKQUOTE_SEGMENTS_PATTERN } from '../constants';

/**
 * Counts the number of `>` blockquote prefix characters at the start of a line.
 * Returns 0 when the line has no blockquote prefix.
 */
export function countBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);
  if (!prefixMatch) return 0;
  // The pattern guarantees at least one ">", so the inner match is non-null.
  return prefixMatch[0].match(/>/g)!.length;
}

/** Removes leading blockquote segments and trims left whitespace. */
export function stripLeadingBlockquoteSegments(lineText: string): string {
  return lineText.replace(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN, '').trimStart();
}
