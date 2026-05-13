import {
  EMdStyleTagType,
  EHtmlStyleTagType,
  ESpanStyleTagType,
  ELineTagType,
  ESpecialTagType,
} from '../../../../../interfaces';
import type { TTag, ILineStyleTag, ISpecialTag, TagPosition } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';

// Extracts the explicit title text from a callout opener line.
// Falls back to the callout type (e.g. "warning" from "> [!warning]") when no custom title is present.
// Returns as a single-element array for consistency with the string[] title shape.
const extractCalloutTitle = (content: string, open: TagPosition): string[] | undefined => {
  const line = content.split('\n')[open.start.line];
  const match = line.match(/^>+\s*\[!([^\]]+)\]\s*(.*)/);
  if (!match) return undefined;
  const title = match[2]?.trim() || match[1]?.trim() || undefined;
  return title ? [title] : undefined;
};

// Extracts the footnote label from the open position, e.g. "[^footnote]" → "footnote".
const extractFootnoteLabel = (content: string, open: TagPosition): string | undefined => {
  const line = content.split('\n')[open.start.line];
  const rawText = line.slice(open.start.ch, open.end.ch);
  return rawText.match(/\[\^([^\]]+)\]/)?.[1] ?? undefined;
};

export const convertMatchesToTags = (content: string, matches: TMatchRecord[]): TTag[] => {
  const result: TTag[] = [];

  // Tracks the title chain of the most recent CALLOUT opener so continuation lines can inherit it.
  let lastCalloutTitle: string[] | undefined;

  for (const match of matches) {
    // Skip orphan closes — they have no open position.
    if (!match.open) continue;

    const { type, isHTML, open, close } = match;

    if (Object.values(EMdStyleTagType).includes(type as EMdStyleTagType)) {
      // MD style tags must be paired to be meaningful.
      if (!close) continue;
      result.push({
        type: type as EMdStyleTagType,
        open,
        close,
        ...(isHTML && { isHTML: true }),
        isProtected: false,
      });
    } else if (Object.values(EHtmlStyleTagType).includes(type as EHtmlStyleTagType)) {
      if (!close) continue;
      result.push({
        type: type as EHtmlStyleTagType,
        open,
        close,
        isHTML: true,
        isProtected: false,
      });
    } else if (Object.values(ESpanStyleTagType).includes(type as ESpanStyleTagType)) {
      // GENERIC is an internal tracking-only type — never exposed as a tag.
      if (type === ESpanStyleTagType.GENERIC || !close) continue;
      result.push({
        type: type as ESpanStyleTagType,
        open,
        close,
        isHTML: true,
        isProtected: false,
      });
    } else if (Object.values(ELineTagType).includes(type as ELineTagType)) {
      const tag: ILineStyleTag = {
        type: type as ELineTagType,
        open,
        isHTML: false,
        isProtected: true,
      };

      if (type === ELineTagType.CALLOUT) {
        // Prefer the pre-extracted title chain from findAllMatches.
        // Fall back to re-extracting from content when match.title is not set.
        const title = match.title ?? extractCalloutTitle(content, open);
        if (title && title.length > 0) {
          tag.title = title;
          lastCalloutTitle = title;
        } else if (lastCalloutTitle) {
          tag.title = lastCalloutTitle;
        }
      } else if (match.title && match.title.length > 0) {
        tag.title = match.title;
      }

      result.push(tag);
    } else if (Object.values(ESpecialTagType).includes(type as ESpecialTagType)) {
      const tag: ISpecialTag = {
        type: type as ESpecialTagType,
        open,
        close,
        isHTML: false,
        isProtected: true,
      };

      if (type === ESpecialTagType.FOOTNOTE_REF) {
        const label = extractFootnoteLabel(content, open);
        if (label) tag.title = label;
      }

      result.push(tag);
    }
  }

  return result;
};
