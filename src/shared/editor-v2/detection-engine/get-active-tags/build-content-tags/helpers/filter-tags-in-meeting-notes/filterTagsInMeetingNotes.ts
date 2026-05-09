import { ESpecialTagType } from '../../../../../interfaces';
import type { TagPosition } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';
import { filterTagsWithinRanges } from '../../utils';

/**
 * Removes markdown style tag records that fall inside a MEETING_DETAILS block.
 * MEETING_DETAILS is atomic — its open TagPosition spans the entire ---...--- block.
 */
export const filterTagsInMeetingNotes = (
  _content: string,
  allMatches: TMatchRecord[]
): TMatchRecord[] => {
  // Each MEETING_DETAILS open TagPosition already spans the full block range.
  const meetingRanges: TagPosition[] = allMatches
    .filter((match) => match.type === ESpecialTagType.MEETING_DETAILS && match.open)
    .map((match) => match.open!);

  return filterTagsWithinRanges(allMatches, meetingRanges);
};
