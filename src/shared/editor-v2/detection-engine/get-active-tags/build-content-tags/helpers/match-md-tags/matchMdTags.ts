import { EMdStyleTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';
import { calcLineEnd, isSameTagPosition } from '../../utils';

export const matchMdTags = (content: string, allMatches: TMatchRecord[]): TMatchRecord[] => {
  const openMdTags: TMatchRecord[] = [];
  const result: TMatchRecord[] = [];

  for (const match of allMatches) {
    if (!Object.values(EMdStyleTagType).includes(match.type as EMdStyleTagType) || match.isHTML) {
      result.push(match);
      continue;
    }

    if (match.open) {
      openMdTags.push(match);
      result.push(match);
    } else {
      if (
        openMdTags.length &&
        !isSameTagPosition(openMdTags[openMdTags.length - 1].open!, match.close!)
      ) {
        openMdTags[openMdTags.length - 1].close = match.close;
        openMdTags.pop();
      }
    }
  }

  // Single pass: flush pending unmatched opens when a non-MD tag is encountered.
  const unmatchedSet = new Set(openMdTags);
  const pendingCloses: TMatchRecord[] = [];

  for (const match of result) {
    if (unmatchedSet.has(match)) {
      pendingCloses.push(match);
    } else if (
      pendingCloses.length &&
      (!Object.values(EMdStyleTagType).includes(match.type as EMdStyleTagType) || match.isHTML)
    ) {
      const closePosition = match.open ?? match.close;

      pendingCloses.forEach(
        (openTag) =>
          (openTag.close =
            closePosition?.start.line === openTag.open!.start.line
              ? {
                  start: closePosition!.start,
                  end: closePosition!.start,
                }
              : calcLineEnd(content, openTag.open!.start.line))
      );
      pendingCloses.length = 0;
    }
  }

  return result;
};
