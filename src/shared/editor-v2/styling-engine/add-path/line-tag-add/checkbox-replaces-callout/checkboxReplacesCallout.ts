import type { StylingContext, StylingResult, TextReplacement } from '../../../interfaces';
import { lineBoundsAt, sortReplacementsLastToFirst } from '../../../helpers';

/**
 * X16 — When checkbox is toggled and the first selected line is a callout header,
 * convert the callout to a checkbox item and strip `> ` from each subsequent body line.
 *
 * Returns null when the cross-type case does NOT apply (caller falls back to standard checkbox).
 */
export function tryCheckboxReplacesCallout(
  context: StylingContext,
  segments: ReadonlyArray<{ start: number; end: number }>,
): StylingResult | null {
  if (segments.length === 0) return null;

  const headerBounds = lineBoundsAt(context.sourceText, segments[0].start);
  const headerLineText = context.sourceText.slice(headerBounds.lineStart, headerBounds.lineEnd);
  const calloutHeaderMatch = /^>\s*\[!\w+\]\s?/.exec(headerLineText);
  if (!calloutHeaderMatch) return null;

  const replacements: TextReplacement[] = [];

  // Replace `> [!type] ` prefix on header with `- [ ] `; preserve any title text after the marker.
  replacements.push({
    fromOffset: headerBounds.lineStart,
    toOffset:   headerBounds.lineStart + calloutHeaderMatch[0].length,
    replacementText: '- [ ] ',
  });

  // Strip `> ` (or `>`) prefix from each body segment.
  for (let segmentIndex = 1; segmentIndex < segments.length; segmentIndex++) {
    const bodyBounds = lineBoundsAt(context.sourceText, segments[segmentIndex].start);
    const bodyLineText = context.sourceText.slice(bodyBounds.lineStart, bodyBounds.lineEnd);
    const bodyPrefixMatch = /^>\s?/.exec(bodyLineText);
    if (!bodyPrefixMatch) continue;
    replacements.push({
      fromOffset: bodyBounds.lineStart,
      toOffset:   bodyBounds.lineStart + bodyPrefixMatch[0].length,
      replacementText: '',
    });
  }

  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: false };
}
