import type { DetectedTag, HtmlOpenerMatch, HtmlCloserMatch } from '../../interfaces';
import { HTML_TAG_RECOGNISERS } from '../../constants';
import { parseSpanStyleAttribute } from '../../span-style-parser/spanStyleParser';
import type { InlineMatchResult, InlineRecursiveScanner, InlineSkipRange } from '../interfaces';

/** Tries every HTML tag recogniser in order at `cursor`; returns the first successful match. */
export function matchHtmlTag(
  line: string,
  cursor: number,
  lineIndex: number,
  skipRanges: InlineSkipRange[],
  recursiveScan: InlineRecursiveScanner,
): InlineMatchResult | null {
  for (const { name, type } of HTML_TAG_RECOGNISERS) {
    const opener = name === 'span' ? matchSpanOpener(line, cursor) : matchSimpleHtmlOpener(line, cursor, name);
    if (!opener) continue;

    const closer = findHtmlCloser(line, opener.openEndCh, name);
    if (!closer) continue;

    // For span the type is re-derived from the style attribute payload.
    const finalType = name === 'span' ? (parseSpanStyleAttribute(opener.styleAttribute ?? '') ?? type) : type;

    const tag: DetectedTag = {
      type: finalType,
      isHTML: true,
      isSpan: name === 'span',
      open:  { start: { line: lineIndex, ch: cursor },           end: { line: lineIndex, ch: opener.openEndCh } },
      close: { start: { line: lineIndex, ch: closer.closeStart }, end: { line: lineIndex, ch: closer.closeEnd } },
    };

    const innerTags = recursiveScan(line.slice(0, closer.closeStart), lineIndex, opener.openEndCh, skipRanges);
    return { tag, innerTags, advanceTo: closer.closeEnd };
  }
  return null;
}

function matchSimpleHtmlOpener(line: string, cursor: number, name: string): HtmlOpenerMatch | null {
  const opener = `<${name}>`;
  if (line.substr(cursor, opener.length) !== opener) return null;
  return { openEndCh: cursor + opener.length };
}

function matchSpanOpener(line: string, cursor: number): HtmlOpenerMatch | null {
  if (line.substr(cursor, 5) !== '<span') return null;
  // Reject self-closing forms (`<span ... />`) — line-prefix path captures those.
  const closeAngle = line.indexOf('>', cursor);
  if (closeAngle < 0) return null;
  if (line[closeAngle - 1] === '/') return null;
  const insideTag = line.slice(cursor + 5, closeAngle);
  const styleMatch = /style\s*=\s*"([^"]*)"/i.exec(insideTag);
  return { openEndCh: closeAngle + 1, styleAttribute: styleMatch?.[1] ?? '' };
}

/** Walks forward from `fromCh`, balancing nested same-name openers, and returns the matching close range. */
function findHtmlCloser(line: string, fromCh: number, name: string): HtmlCloserMatch | null {
  const closer = `</${name}>`;
  const openerStart = `<${name}`;
  let depth = 1;
  let cursor = fromCh;
  while (cursor < line.length) {
    if (line.substr(cursor, closer.length) === closer) {
      depth--;
      if (depth === 0) return { closeStart: cursor, closeEnd: cursor + closer.length };
      cursor += closer.length;
      continue;
    }
    if (line.substr(cursor, openerStart.length) === openerStart) {
      const followCh = line[cursor + openerStart.length];
      const isOpener = name === 'span' ? (followCh === ' ' || followCh === '>') : followCh === '>';
      if (isOpener) {
        depth++;
        const skipTo = name === 'span' ? line.indexOf('>', cursor) : cursor + openerStart.length;
        if (skipTo < 0) return null;
        cursor = skipTo + 1;
        continue;
      }
    }
    cursor++;
  }
  return null;
}
