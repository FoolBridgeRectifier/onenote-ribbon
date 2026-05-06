import { ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';
import { calcLineEnd, isSameTagPosition } from '../../utils';

/** Removes all non-code tag records whose position falls inside a code block or inline code span. */
export const filterTagsInCodeBlocks = (
  content: string,
  allMatches: TMatchRecord[]
): TMatchRecord[] => {
  let openTag: TMatchRecord | null = null;
  const filteredMatches: TMatchRecord[] = [];

  for (const match of allMatches) {
    const isCodeType =
      match.type === ESpecialTagType.BLOCK_CODE ||
      match.type === ESpecialTagType.LINE_CODE ||
      match.type === ESpecialTagType.INLINE_CODE;
    const isOpenLineCodeTag =
      openTag?.type === ESpecialTagType.INLINE_CODE || openTag?.type === ESpecialTagType.LINE_CODE;

    const isMatchingClose = !!match.close && match.type === openTag?.type;
    const currentMatchLine = (match.open ?? match.close)!.start.line;
    const openTagLine = openTag?.open?.start.line;

    // No open code block — pass non-code records through and start tracking code openers.
    if (!openTag || (currentMatchLine > openTagLine! && isOpenLineCodeTag)) {
      // LINE_CODE is atomic and spans exactly one line. and if INLINE_CODE till end of line.
      if (currentMatchLine > openTagLine!) {
        if (openTag?.type === ESpecialTagType.INLINE_CODE) {
          openTag.close = calcLineEnd(content, openTagLine!);
          openTag = null;
        }
        if (openTag?.type === ESpecialTagType.LINE_CODE) {
          openTag = null;
        }
      }

      if (isCodeType && match.open) {
        openTag = match;
      }

      if (!isCodeType || match.open) {
        filteredMatches.push(match);
      }
    }

    // INLINE_CODE closes on its matching backtick; set close to end of the open line.
    else if (openTag.type === ESpecialTagType.INLINE_CODE) {
      if (
        isMatchingClose &&
        currentMatchLine === openTagLine &&
        !isSameTagPosition(openTag.open!, match.close!)
      ) {
        openTag.close = match.close;
        openTag = null;
      }
    }

    // BLOCK_CODE — filter everything until the matching close.
    else if (openTag.type === ESpecialTagType.BLOCK_CODE) {
      if (isMatchingClose && !isSameTagPosition(openTag.open!, match.close!)) {
        openTag.close = match.close;
        openTag = null;
      }
    }

    // Default - ignore all else.
  }

  // Unclosed fenced block at EOF — close it at the last character of the file.
  if (openTag?.type === ESpecialTagType.BLOCK_CODE) {
    openTag.close = calcLineEnd(content, content.split('\n').length - 1);
  }

  return filteredMatches;
};
