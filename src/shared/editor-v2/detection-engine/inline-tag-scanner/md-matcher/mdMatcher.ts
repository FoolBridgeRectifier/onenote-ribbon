import type { DetectedTag } from '../../interfaces';
import { MD_DELIMITER_RECOGNISERS } from '../../constants';
import type { InlineMatchResult, InlineRecursiveScanner, InlineSkipRange } from '../interfaces';

/** Tries every MD delimiter pair at `cursor`; returns the first successful match. */
export function matchMdDelimiterPair(
  line: string,
  cursor: number,
  lineIndex: number,
  skipRanges: InlineSkipRange[],
  recursiveScan: InlineRecursiveScanner,
): InlineMatchResult | null {
  for (const { delimiter, type } of MD_DELIMITER_RECOGNISERS) {
    if (line.substr(cursor, delimiter.length) !== delimiter) continue;
    // For lone `*`, reject when neighbouring `*` would make this part of `**` bold.
    if (delimiter === '*' && (line[cursor - 1] === '*' || line[cursor + 1] === '*')) continue;

    const closeStart = findMdCloser(line, cursor + delimiter.length, delimiter);
    if (closeStart < 0) continue;

    const tag: DetectedTag = {
      type,
      isHTML: false,
      isSpan: false,
      open:  { start: { line: lineIndex, ch: cursor },     end: { line: lineIndex, ch: cursor + delimiter.length } },
      close: { start: { line: lineIndex, ch: closeStart }, end: { line: lineIndex, ch: closeStart + delimiter.length } },
    };

    // Code content is inert (invariant I3); skip recursion for backtick spans.
    const innerTags = type === 'code'
      ? []
      : recursiveScan(line.slice(0, closeStart), lineIndex, cursor + delimiter.length, skipRanges);

    return { tag, innerTags, advanceTo: closeStart + delimiter.length };
  }
  return null;
}

function findMdCloser(line: string, fromCh: number, delimiter: string): number {
  let cursor = fromCh;
  while (cursor < line.length) {
    if (line.substr(cursor, delimiter.length) !== delimiter) { cursor++; continue; }
    if (delimiter === '*' && (line[cursor - 1] === '*' || line[cursor + 1] === '*')) { cursor++; continue; }
    return cursor;
  }
  return -1;
}
