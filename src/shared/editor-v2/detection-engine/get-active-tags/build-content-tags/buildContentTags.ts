import type { TMatchRecord } from '../find-all-matches/interfaces';
import type { TMatchFilter } from './interfaces';
import { findAllMatches } from '../find-all-matches/findAllMatches';
import {
  filterInvalidCodeMatches,
  filterTagsInCodeBlocks,
  filterTagsInMeetingNotes,
  filterTagsInHtml,
} from './helpers';

/** Finds all tags in `content`, applies each filter in order, and returns the result. */
export const buildContentTags = (content: string) => {
  const allMatches = findAllMatches(content);

  const filters: TMatchFilter[] = [
    filterInvalidCodeMatches,
    filterTagsInCodeBlocks,
    filterTagsInMeetingNotes,
    filterTagsInHtml,
  ];

  return filters.reduce<TMatchRecord[]>((matches, filter) => filter(content, matches), allMatches);
};
