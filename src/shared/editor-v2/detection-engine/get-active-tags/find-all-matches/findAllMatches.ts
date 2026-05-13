import type { TTagType } from '../../../interfaces';
import { ELineTagType } from '../../../interfaces';
import {
  MD_TAG_REGEX,
  HTML_EQUIV_MD_TAG_REGEX,
  HTML_TAG_REGEX,
  SPAN_TAG_REGEX,
  LINE_TAG_REGEX,
  SPECIAL_TAG_REGEX,
} from '../tag-regex/tagRegex';
import { rangeToTagPosition } from '../utils';
import { scanPattern, compareByPosition } from './helpers';

// Extracts a title from the content line starting at matchIndex using the first capture group of titleRegex.
const extractTitle = (content: string, matchIndex: number, titleRegex: RegExp): string | undefined => {
  const lineEnd = content.indexOf('\n', matchIndex);
  const lineText = content.slice(matchIndex, lineEnd === -1 ? undefined : lineEnd);
  return lineText.match(titleRegex)?.[1]?.trim() || undefined;
};

// Extracts the callout type from a line (e.g. `> [!warning]` → `"warning"`).
// Used as fallback title when no custom title text follows the [!type] marker.
const extractCalloutType = (content: string, matchIndex: number): string | undefined => {
  const lineEnd = content.indexOf('\n', matchIndex);
  const lineText = content.slice(matchIndex, lineEnd === -1 ? undefined : lineEnd);
  return lineText.match(/\[!([^\]]+)\]/)?.[1]?.trim() || undefined;
};

/**
 * Scans `content` for every known tag pattern and returns a flat list of open/close records
 * sorted ascending by document position.
 * Open pattern hit  → `{ type, open: TagPosition }`
 * Close pattern hit → `{ type, close: TagPosition }`
 */
export const findAllMatches = (content: string) => {
  const matches = [
    ...MD_TAG_REGEX,
    ...HTML_EQUIV_MD_TAG_REGEX,
    ...HTML_TAG_REGEX,
    ...SPAN_TAG_REGEX,
    ...LINE_TAG_REGEX,
    ...SPECIAL_TAG_REGEX,
  ]
    .flatMap(({ type, isHTML, open, close, titleRegex }: { type: TTagType; isHTML: boolean; open?: RegExp; close?: RegExp; titleRegex?: RegExp }) => [
      ...(open
        ? scanPattern(content, open).map((match) => {
            const title = titleRegex ? extractTitle(content, match.index, titleRegex) : undefined;
            // For CALLOUT openers with no custom title, fall back to the callout type (e.g. `> [!warning]` → `"warning"`).
            const singleTitle = title ?? (type === ELineTagType.CALLOUT ? extractCalloutType(content, match.index) : undefined);
            return {
              type,
              isHTML,
              open: rangeToTagPosition(match.index, match.length, content),
              // Wrap in array to match the string[] title shape; propagation will expand to full chain.
              ...(singleTitle && { title: [singleTitle] }),
            };
          })
        : []),
      ...(close
        ? scanPattern(content, close).map((match) => {
            const title = titleRegex ? extractTitle(content, match.index, titleRegex) : undefined;
            return {
              type,
              isHTML,
              close: rangeToTagPosition(match.index, match.length, content),
              ...(title && { title: [title] }),
            };
          })
        : []),
    ])
    .sort(compareByPosition);

  return matches;
};
