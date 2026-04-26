import type { TextReplacement } from '../../../interfaces';
import { MD_TO_HTML_DELIMITER_MAP } from './constants';

/**
 * A18 — converts inline `**text**` / `*text*` pairs inside [start, end) to HTML
 * `<b>...</b>` / `<i>...</i>`. Runs as a pre-step before the outer HTML wrap is added.
 */
export function upgradeInlineMdInsideSelection(sourceText: string, start: number, end: number): TextReplacement[] {
  const replacements: TextReplacement[] = [];

  for (const { delim, element } of MD_TO_HTML_DELIMITER_MAP) {
    let cursor = start;
    while (cursor < end) {
      const openPos = sourceText.indexOf(delim, cursor);
      if (openPos === -1 || openPos >= end) break;
      // Avoid `**` matched as `*` when scanning italic.
      if (delim === '*' && (sourceText[openPos + 1] === '*' || sourceText[openPos - 1] === '*')) {
        cursor = openPos + delim.length;
        continue;
      }
      const closePos = sourceText.indexOf(delim, openPos + delim.length);
      if (closePos === -1 || closePos >= end) break;
      if (delim === '*' && (sourceText[closePos + 1] === '*' || sourceText[closePos - 1] === '*')) {
        cursor = closePos + delim.length;
        continue;
      }
      replacements.push({ fromOffset: openPos, toOffset: openPos + delim.length, replacementText: `<${element}>` });
      replacements.push({ fromOffset: closePos, toOffset: closePos + delim.length, replacementText: `</${element}>` });
      cursor = closePos + delim.length;
    }
  }
  return replacements;
}
