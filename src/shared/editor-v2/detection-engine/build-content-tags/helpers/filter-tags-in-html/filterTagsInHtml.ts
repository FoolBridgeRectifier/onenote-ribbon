import type { EditorPosition } from 'obsidian';
import { EMdStyleTagType, ESpecialTagType } from '../../../../interfaces';
import type { TagPosition } from '../../../../interfaces';
import type { TMatchRecord } from '../../interfaces';
import { filterTagsWithinRanges } from '../../utils';

/**
 * Removes markdown style tag records that fall inside an HTML tag block.
 * HTML tags are tracked by depth so nested tags are handled correctly.
 */
export const filterTagsInHtml = (_content: string, allMatches: TMatchRecord[]): TMatchRecord[] => {
  const htmlRanges: TagPosition[] = [];
  let htmlDepth = 0;
  let rangeStart: EditorPosition | null = null;

  for (const match of allMatches) {
    if (!match.isHTML) continue;

    if (match.open) {
      if (htmlDepth === 0) rangeStart = match.open.start;
      htmlDepth++;
    }

    if (match.close) {
      htmlDepth = Math.max(0, htmlDepth - 1);

      if (htmlDepth === 0 && rangeStart) {
        htmlRanges.push({ start: rangeStart, end: match.close.end });
        rangeStart = null;
      }
    }
  }

  // Tag types that should be suppressed when they fall inside an HTML tag's attribute or body.
  return filterTagsWithinRanges(
    allMatches,
    htmlRanges,
    [...Object.values(EMdStyleTagType), ESpecialTagType.HASHTAG],
    false
  );
};
