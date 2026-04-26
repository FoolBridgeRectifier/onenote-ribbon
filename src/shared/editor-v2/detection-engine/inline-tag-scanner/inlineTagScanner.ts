import type { DetectedTag } from '../interfaces';
import { matchHtmlTag } from './html-matcher/htmlMatcher';
import { matchMdDelimiterPair } from './md-matcher/mdMatcher';
import type { InlineSkipRange } from './interfaces';

export type { InlineSkipRange } from './interfaces';

/**
 * Scans `line` for inline tags and returns the detected entries.
 * `skipRanges` lists protected ranges to step over (wikilinks, embeds, etc.).
 * `lineIndex` is used only to stamp EditorPosition.line on every detected tag.
 *
 * Recurses into matched content so nested tags are detected as well.
 * Code tag content is intentionally NOT recursed (invariant I3 — inert).
 * Adds an inlineTodo tag (open only) for each `#todo` token encountered, and
 * an MD `code` tag for each backtick-delimited skip range.
 */
export function scanInlineTags(
  line: string,
  lineIndex: number,
  scanStartCh: number,
  skipRanges: InlineSkipRange[],
): DetectedTag[] {
  const results: DetectedTag[] = [];
  let cursor = scanStartCh;

  while (cursor < line.length) {
    const skip = skipRanges.find((range) => cursor >= range.startCh && cursor < range.endCh);
    if (skip) {
      maybeRecordInlineTodo(line, lineIndex, skip, results);
      maybeRecordCodeTag(line, lineIndex, skip, results);
      cursor = skip.endCh;
      continue;
    }

    const htmlMatch = matchHtmlTag(line, cursor, lineIndex, skipRanges, scanInlineTags);
    if (htmlMatch) {
      results.push(htmlMatch.tag);
      results.push(...htmlMatch.innerTags);
      cursor = htmlMatch.advanceTo;
      continue;
    }

    const mdMatch = matchMdDelimiterPair(line, cursor, lineIndex, skipRanges, scanInlineTags);
    if (mdMatch) {
      results.push(mdMatch.tag);
      results.push(...mdMatch.innerTags);
      cursor = mdMatch.advanceTo;
      continue;
    }

    cursor++;
  }

  return results;
}

/** Records an inlineTodo tag (open only, no close) for a `#todo` skip range. */
function maybeRecordInlineTodo(line: string, lineIndex: number, skip: InlineSkipRange, output: DetectedTag[]): void {
  if (line.slice(skip.startCh, skip.endCh) !== '#todo') return;
  output.push({
    type: 'inlineTodo',
    open: { start: { line: lineIndex, ch: skip.startCh }, end: { line: lineIndex, ch: skip.endCh } },
  });
}

/** Records a `code` MD tag for a backtick-delimited skip range — open/close one tick wide. */
function maybeRecordCodeTag(line: string, lineIndex: number, skip: InlineSkipRange, output: DetectedTag[]): void {
  if (line[skip.startCh] !== '`' || line[skip.endCh - 1] !== '`') return;
  output.push({
    type: 'code',
    isHTML: false,
    isSpan: false,
    open:  { start: { line: lineIndex, ch: skip.startCh },   end: { line: lineIndex, ch: skip.startCh + 1 } },
    close: { start: { line: lineIndex, ch: skip.endCh - 1 }, end: { line: lineIndex, ch: skip.endCh } },
  });
}
