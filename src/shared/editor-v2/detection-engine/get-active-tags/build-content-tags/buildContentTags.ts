import { findAllMatches } from '../find-all-matches/findAllMatches';

/** Finds all tags in `content` and returns them sorted by start position. */
export const buildContentTags = (content: string) => findAllMatches(content);
