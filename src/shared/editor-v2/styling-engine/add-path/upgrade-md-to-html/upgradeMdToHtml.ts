import type { TagDefinition } from '../../interfaces';
import { HTML_ELEMENT_FOR_TYPE } from '../../constants';

/**
 * Returns true when there is any HTML opening tag enclosing the [start, end) offset on the
 * same line. Used to enforce invariant I2: MD delimiters never appear inside HTML context.
 */
export function isInsideHtmlContext(sourceText: string, start: number, end: number): boolean {
  const lineStart = sourceText.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = (() => {
    const newline = sourceText.indexOf('\n', end);
    return newline === -1 ? sourceText.length : newline;
  })();
  const lineText = sourceText.slice(lineStart, lineEnd);

  const localStart = start - lineStart;
  const localEnd = end - lineStart;

  // Walk for any opening HTML tag that covers [localStart, localEnd).
  for (const elementName of Object.values(HTML_ELEMENT_FOR_TYPE)) {
    if (!elementName) continue;
    const opener = `<${elementName}>`;
    const closer = `</${elementName}>`;
    let cursor = 0;
    while (cursor < lineText.length) {
      const openIndex = lineText.indexOf(opener, cursor);
      if (openIndex === -1) break;
      const closeIndex = lineText.indexOf(closer, openIndex + opener.length);
      if (closeIndex === -1) break;
      const innerStart = openIndex + opener.length;
      const innerEnd = closeIndex;
      if (localStart >= innerStart && localEnd <= innerEnd) return true;
      cursor = closeIndex + closer.length;
    }
  }

  // Also: any <span ...> covering selection counts as HTML context.
  let cursor = 0;
  while (cursor < lineText.length) {
    const openIndex = lineText.indexOf('<span', cursor);
    if (openIndex === -1) break;
    const headerEnd = lineText.indexOf('>', openIndex);
    if (headerEnd === -1) break;
    if (lineText[headerEnd - 1] === '/') { cursor = headerEnd + 1; continue; }
    const closeIndex = lineText.indexOf('</span>', headerEnd);
    if (closeIndex === -1) break;
    const innerStart = headerEnd + 1;
    const innerEnd = closeIndex;
    if (localStart >= innerStart && localEnd <= innerEnd) return true;
    cursor = closeIndex + '</span>'.length;
  }

  return false;
}

/**
 * If `tagDefinition` is a MD tag and we're inside HTML context, returns the upgraded HTML
 * version (b/i/s) — otherwise returns the tag unchanged.
 */
export function upgradeMdToHtmlIfNeeded(
  sourceText: string,
  start: number,
  end: number,
  tagDefinition: TagDefinition,
): TagDefinition {
  if (tagDefinition.isHTML || tagDefinition.isSpan) return tagDefinition;
  if (!isInsideHtmlContext(sourceText, start, end)) return tagDefinition;

  // highlight ==  → <span style="background:...">
  if (tagDefinition.type === 'highlight') {
    return { type: 'highlight', isSpan: true };
  }
  // bold/italic/strikethrough have HTML closing equivalents.
  if (HTML_ELEMENT_FOR_TYPE[tagDefinition.type]) {
    return { type: tagDefinition.type, isHTML: true };
  }
  return tagDefinition;
}
