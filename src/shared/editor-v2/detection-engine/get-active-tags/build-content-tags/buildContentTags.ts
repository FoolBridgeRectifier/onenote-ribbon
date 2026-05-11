import type { TMatchRecord } from '../find-all-matches/interfaces';
import type { TMatchFilter } from './interfaces';
import { findAllMatches } from '../find-all-matches/findAllMatches';
import { tagPositionToRange } from '../utils';
import {
  filterInvalidCodeMatches,
  filterTagsInCodeBlocks,
  filterTagsInMeetingNotes,
  filterTagsInHtml,
  matchSpanTags,
  matchHtmlTags,
  matchMdTags,
  matchFootnotes,
} from './helpers';

/** Finds all tags in `content`, applies each filter in order, and returns the result. */
export const buildContentTags = (content: string) => {
  const allMatches = findAllMatches(content);

  const filters: TMatchFilter[] = [
    filterInvalidCodeMatches,
    filterTagsInCodeBlocks,
    filterTagsInMeetingNotes,
    filterTagsInHtml,
    matchSpanTags,
    matchHtmlTags,
    matchMdTags,
    matchFootnotes,
  ];

  const tags = filters.reduce<TMatchRecord[]>(
    (matches, filter) => filter(content, matches),
    allMatches
  );

  console.warn(
    '[buildContentTags]',
    tags.map((tag) => ({
      type: tag.type,
      open: tag.open,
      openText: tag.open && (({ offset, length }) => content.slice(offset, offset + length))(tagPositionToRange(tag.open, content)),
      close: tag.close,
      closeText: tag.close && (({ offset, length }) => content.slice(offset, offset + length))(tagPositionToRange(tag.close, content)),
    }))
  );

  return tags;
};
