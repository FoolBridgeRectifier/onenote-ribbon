import type { EditorPosition } from 'obsidian';
import { ESpecialTagType, type TCursor, type TTag } from '../../interfaces';
import { cursorToSelection } from './helpers/cursor-to-selection/cursorToSelection';

/** Compares two EditorPositions. Returns negative if a < b, 0 if equal, positive if a > b. */
const comparePositions = (a: EditorPosition, b: EditorPosition): number => {
  if (a.line !== b.line) return a.line - b.line;
  return a.ch - b.ch;
};

const isCodeActive = (tags: TTag[], cursor: TCursor): TTag[] => {
  const selection = cursorToSelection(cursor);
  const activeTags: TTag[] = [];

  for (const tag of tags) {
    // BLOCK_CODE / INLINE_CODE: overlap check covers both complete and partial coverage
    if (
      (tag.type === ESpecialTagType.BLOCK_CODE || tag.type === ESpecialTagType.INLINE_CODE) &&
      tag.open &&
      tag.close
    ) {
      const tagStart = tag.open.start;
      const tagEnd = tag.close.end;

      // Active if tag range overlaps selection at all (inclusive boundaries handle cursor-at-edge)
      const overlapsSelection =
        comparePositions(tagStart, selection.end) <= 0 &&
        comparePositions(tagEnd, selection.start) >= 0;

      if (overlapsSelection) activeTags.push(tag);
    }

    // LINE_CODE covers its entire line; check by line number only
    else if (tag.type === ESpecialTagType.LINE_CODE && tag.open) {
      const tagLine = tag.open.start.line;

      const lineInSelection = tagLine >= selection.start.line && tagLine <= selection.end.line;

      if (lineInSelection) activeTags.push(tag);
    }
  }

  return activeTags;
};

export const getActiveTags = (tags: TTag[], cursor: TCursor) => {
  const activeTags: TTag[] = [];

  return tags;
};
