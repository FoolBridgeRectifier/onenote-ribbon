import type { TTagType } from '../../../interfaces';
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

/**
 * Scans `content` for every known tag pattern and returns a flat list of open/close records
 * sorted ascending by document position.
 * Open pattern hit  → `{ type, open: TagPosition }`
 * Close pattern hit → `{ type, close: TagPosition }`
 */
export const findAllMatches = (content: string) => {
  return [
    ...MD_TAG_REGEX,
    ...HTML_EQUIV_MD_TAG_REGEX,
    ...HTML_TAG_REGEX,
    ...SPAN_TAG_REGEX,
    ...LINE_TAG_REGEX,
    ...SPECIAL_TAG_REGEX,
  ]
    .flatMap(({ type, isHTML, open, close }: { type: TTagType; isHTML: boolean; open?: RegExp; close?: RegExp }) => [
      ...(open
        ? scanPattern(content, open).map((match) => ({
            type,
            isHTML,
            open: rangeToTagPosition(match.index, match.length, content),
          }))
        : []),
      ...(close
        ? scanPattern(content, close).map((match) => ({
            type,
            isHTML,
            close: rangeToTagPosition(match.index, match.length, content),
          }))
        : []),
    ])
    .sort(compareByPosition);
};
