import type { TagDefinition, TextReplacement } from '../../../interfaces';
import { isMarkdownTag, isHtmlClosingTag, isSpanTag, getMdDelimiter, getHtmlElementName, buildSpanOpener, getSpanCssProperty } from '../helpers';

/**
 * Detects an existing same-type opening tag immediately before `start` and a closing tag
 * immediately after `end`. Returns the offsets of the open & close delimiters, or null.
 */
export function detectEnclosingSameTypeTag(
  sourceText: string,
  start: number,
  end: number,
  tagDefinition: TagDefinition,
): { openStart: number; openEnd: number; closeStart: number; closeEnd: number } | null {
  if (isMarkdownTag(tagDefinition)) {
    const delim = getMdDelimiter(tagDefinition);
    if (!delim) return null;
    if (sourceText.slice(start - delim.length, start) === delim &&
        sourceText.slice(end, end + delim.length) === delim) {
      return {
        openStart: start - delim.length, openEnd: start,
        closeStart: end, closeEnd: end + delim.length,
      };
    }
    // Selection might be delimiter-inclusive: `[**hello**]`.
    if (sourceText.slice(start, start + delim.length) === delim &&
        sourceText.slice(end - delim.length, end) === delim) {
      return {
        openStart: start, openEnd: start + delim.length,
        closeStart: end - delim.length, closeEnd: end,
      };
    }
  }
  if (isHtmlClosingTag(tagDefinition)) {
    const elementName = getHtmlElementName(tagDefinition);
    if (!elementName) return null;
    const opener = `<${elementName}>`;
    const closer = `</${elementName}>`;
    if (sourceText.slice(start - opener.length, start) === opener &&
        sourceText.slice(end, end + closer.length) === closer) {
      return {
        openStart: start - opener.length, openEnd: start,
        closeStart: end, closeEnd: end + closer.length,
      };
    }
  }
  if (isSpanTag(tagDefinition)) {
    const cssProperty = getSpanCssProperty(tagDefinition);
    if (!cssProperty) return null;
    // Look for `<span style="...cssProperty:...">` ending at `start`.
    const closer = '</span>';
    const closerAtEnd = sourceText.slice(end, end + closer.length) === closer;
    const lookBehindLimit = Math.max(0, start - 200);
    const slice = sourceText.slice(lookBehindLimit, start);
    const openerMatch = /<span\s+style="([^"]*)">$/.exec(slice);
    if (closerAtEnd && openerMatch && openerMatch[1].includes(`${cssProperty}:`)) {
      const openStart = lookBehindLimit + openerMatch.index;
      return {
        openStart, openEnd: openStart + openerMatch[0].length,
        closeStart: end, closeEnd: end + closer.length,
      };
    }
  }
  return null;
}

/** Builds the open + close `TextReplacement` pair for wrapping `[start, end)` with the tag. */
export function buildWrapReplacements(start: number, end: number, tagDefinition: TagDefinition): TextReplacement[] {
  if (isMarkdownTag(tagDefinition)) {
    const delim = getMdDelimiter(tagDefinition);
    if (!delim) return [];
    return [
      { fromOffset: end, toOffset: end, replacementText: delim },
      { fromOffset: start, toOffset: start, replacementText: delim },
    ];
  }
  if (isHtmlClosingTag(tagDefinition)) {
    const elementName = getHtmlElementName(tagDefinition);
    if (!elementName) return [];
    return [
      { fromOffset: end, toOffset: end, replacementText: `</${elementName}>` },
      { fromOffset: start, toOffset: start, replacementText: `<${elementName}>` },
    ];
  }
  if (isSpanTag(tagDefinition)) {
    return [
      { fromOffset: end, toOffset: end, replacementText: '</span>' },
      { fromOffset: start, toOffset: start, replacementText: buildSpanOpener(tagDefinition) },
    ];
  }
  return [];
}
