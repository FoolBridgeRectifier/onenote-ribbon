import type { TagDefinition, StylingResult } from '../../../interfaces';
import { sortReplacementsLastToFirst } from '../../../helpers';
import { buildSpanOpener, getSpanCssProperty } from '../helpers';

/** A4/A5/A6: span-add. Same prop → A5 replace; different → A6 nest; else A4 wrap. */
export function processSpanAdd(sourceText: string, start: number, end: number, tagDefinition: TagDefinition): StylingResult {
  const cssProperty = getSpanCssProperty(tagDefinition);
  if (!cssProperty) return { replacements: [], isNoOp: true };

  // Look behind for `<span style="...">`.
  const lookBehindLimit = Math.max(0, start - 200);
  const slice = sourceText.slice(lookBehindLimit, start);
  const openerMatch = /<span\s+style="([^"]*)">$/.exec(slice);
  const closer = '</span>';
  const closerAtEnd = sourceText.slice(end, end + closer.length) === closer;

  if (openerMatch && closerAtEnd) {
    const styleAttribute = openerMatch[1];
    if (styleAttribute.includes(`${cssProperty}:`)) {
      // A5: replace existing opener with one carrying the new value.
      const openStart = lookBehindLimit + openerMatch.index;
      const openEnd = openStart + openerMatch[0].length;
      return {
        replacements: [{ fromOffset: openStart, toOffset: openEnd, replacementText: buildSpanOpener(tagDefinition) }],
        isNoOp: false,
      };
    }
    // A6: different property → nest inside.
    return wrap(start, end, tagDefinition);
  }

  // A4: plain wrap.
  return wrap(start, end, tagDefinition);
}

function wrap(start: number, end: number, tagDefinition: TagDefinition): StylingResult {
  return {
    replacements: sortReplacementsLastToFirst([
      { fromOffset: end, toOffset: end, replacementText: '</span>' },
      { fromOffset: start, toOffset: start, replacementText: buildSpanOpener(tagDefinition) },
    ]),
    isNoOp: false,
  };
}
