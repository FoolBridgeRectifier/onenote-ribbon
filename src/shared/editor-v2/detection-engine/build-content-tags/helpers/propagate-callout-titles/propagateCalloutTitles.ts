import { ELineTagType } from '../../../../interfaces';
import type { TMatchRecord } from '../../interfaces';

/**
 * Propagates CALLOUT titles through nesting levels using a depth-keyed stack.
 * Each opener registers its title at `titleStack[depth - 1]`; continuation lines
 * (which have no `[!type]` of their own) inherit the full chain down to their depth.
 * Ascending to a shallower depth clears titles from deeper levels.
 */
export const propagateCalloutTitles = (
  content: string,
  matches: TMatchRecord[]
): TMatchRecord[] => {
  const lines = content.split('\n');
  const titleStack: string[] = [];

  for (const match of matches) {
    if (match.type !== ELineTagType.CALLOUT || !('open' in match) || !match.open) continue;

    // Count leading `>` on this line to determine nesting depth.
    const depth = lines[match.open.start.line]?.match(/^>+/)?.[0]?.length ?? 1;

    // Ascending to a shallower depth clears titles from deeper levels.
    titleStack.splice(depth);

    if (match.title && match.title.length > 0) {
      // Opener: register this level's title in the stack.
      titleStack[depth - 1] = match.title[0];
    }

    // Assign the full chain from outermost down to the current depth.
    const titleChain = titleStack
      .slice(0, depth)
      .filter((entry): entry is string => entry !== undefined);
    match.title = titleChain.length > 0 ? titleChain : undefined;
  }

  return matches;
};
