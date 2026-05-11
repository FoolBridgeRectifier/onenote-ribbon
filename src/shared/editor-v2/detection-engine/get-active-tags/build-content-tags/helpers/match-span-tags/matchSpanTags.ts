import { ESpanStyleTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';
import { invalidateTags, isSameTagPosition } from '../../utils';

/**
 * Pairs span open records with their matching close records.
 * A single <span> element may match multiple style types (e.g. color + font-size on one tag),
 * so opens at the same start position are grouped and closed together by a single </span>.
 * Uses a stack so nested spans are handled correctly.
 * Close records are consumed — the close TagPosition is merged into the open record.
 */
export const matchSpanTags = (_content: string, allMatches: TMatchRecord[]): TMatchRecord[] => {
  const filteredMatches: TMatchRecord[] = [];
  const activeSpans: Array<TMatchRecord[]> = [];
  // Tracks the last processed close to deduplicate closes at the same position
  // (a single </span> produces one close record per matching regex entry).
  let lastClose: TMatchRecord | null = null;

  for (const match of allMatches) {
    const isSpanType =
      match.isHTML && Object.values(ESpanStyleTagType).includes(match.type as ESpanStyleTagType);

    if (!isSpanType) {
      filteredMatches.push(match);
      continue;
    }

    if (match.open) {
      if (
        activeSpans.length &&
        isSameTagPosition(activeSpans[activeSpans.length - 1][0].open!, match.open)
      ) {
        activeSpans[activeSpans.length - 1].push(match);
      } else {
        activeSpans.push([match]);
      }

      if (match.type !== ESpanStyleTagType.GENERIC) {
        filteredMatches.push(match);
      }
    } else {
      if (!lastClose || !isSameTagPosition(lastClose.close!, match.close!)) {
        if (activeSpans.length > 0) {
          activeSpans[activeSpans.length - 1].forEach((openSpan) => (openSpan.close = match.close));
          activeSpans.pop();
        }
        lastClose = match;
      }
    }
  }

  if (activeSpans.length > 0) {
    return invalidateTags(filteredMatches, activeSpans[0][0]);
  }

  return filteredMatches;
};
