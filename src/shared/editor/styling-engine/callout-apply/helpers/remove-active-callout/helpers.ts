import { countBlockquoteDepth } from '../count-blockquote-depth/helpers';

/**
 * Counts the number of ">" characters in the leading blockquote prefix of a line.
 * Handles both compact (`>>`) and spaced (`> >`) nesting formats that Obsidian uses.
 */
export function countPrefixBlockquotes(lineText: string): number {
  return countBlockquoteDepth(lineText);
}
