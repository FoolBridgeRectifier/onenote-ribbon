import { ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';
import { matchOpenClosePairs } from '../../utils';

/** Removes all non-code tag records whose position falls inside a code block or inline code span. */
export const filterTagsInCodeBlocks = (
  content: string,
  allMatches: TMatchRecord[]
): TMatchRecord[] => {
  const matchedCodeBlocks = [ESpecialTagType.BLOCK_CODE, ESpecialTagType.INLINE_CODE].reduce(
    (matches, tagType) => matchOpenClosePairs(matches, tagType),
    allMatches
  );

  return matchedCodeBlocks;
};
