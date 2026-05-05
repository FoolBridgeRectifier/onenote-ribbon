import { ESpecialTagType } from '../../../../../interfaces';
import type { TagPosition } from '../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';
import { tagPositionToRange } from '../../../utils';
import { SQUARE_BRACKET_REGEX, STYLE_ATTRIBUTE_REGEX } from '../../constants';
import { mergeSortedRanges } from '../../utils';

/**
 * Returns all match records, excluding code matches whose position falls inside an invalid context:
 * square brackets, style attributes, EXTERNAL_LINK, WIKILINK, or MEETING_DETAILS match ranges.
 */
export const filterInvalidCodeMatches = (content: string, allMatches: TMatchRecord[]) => {
  const regexRanges = Array.from(
    content.matchAll(
      new RegExp(`${SQUARE_BRACKET_REGEX.source}|${STYLE_ATTRIBUTE_REGEX.source}`, 'g')
    )
  ).map((match) => ({ offset: match.index, length: match[0].length }));

  const tagRanges = allMatches
    .filter(
      ({ type }) =>
        type === ESpecialTagType.MEETING_DETAILS ||
        type === ESpecialTagType.EXTERNAL_LINK ||
        type === ESpecialTagType.WIKILINK
    )
    .map(({ open }) => tagPositionToRange(open!, content));

  const sortedRanges = mergeSortedRanges(regexRanges, tagRanges);

  const results: TMatchRecord[] = [];
  let rangeIndex = 0;

  for (const match of allMatches) {
    if (match.type !== ESpecialTagType.INLINE_CODE) {
      results.push(match);
      continue;
    }

    const { offset } = tagPositionToRange((match.open || match.close) as TagPosition, content);

    while (
      rangeIndex < sortedRanges.length &&
      sortedRanges[rangeIndex].offset + sortedRanges[rangeIndex].length <= offset
    ) {
      rangeIndex++;
    }

    const isInInvalidRange =
      rangeIndex < sortedRanges.length && offset >= sortedRanges[rangeIndex].offset;
    if (!isInInvalidRange) {
      results.push(match);
    }
  }

  return results;
};
