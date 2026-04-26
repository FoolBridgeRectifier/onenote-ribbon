import type { DetectedTag } from '../../../detection-engine/interfaces';
import type { TextReplacement } from '../../interfaces';
import type { TagOffsetRange } from '../interfaces';
import { detectedTagToOffsets } from '../helpers';
import { MD_TO_HTML_ELEMENT, HTML_TO_MD_DELIM } from './constants';

/** Stable key built from tag positions; used to compare DetectedTags across re-built contexts. */
function positionKey(tag: DetectedTag): string {
  if (!tag.open) return '';
  return `${tag.type}|${tag.open.start.line}:${tag.open.start.ch}-${tag.close?.end.ch ?? -1}`;
}

/**
 * R20 — when removing the last enclosing HTML tag, walk inner HTML closing tags
 * with MD equivalents (`<b>`/`<i>`/`<s>`) inside [interiorStart, interiorEnd) and
 * convert them to MD delimiters. `<u>` and spans have no MD form and are left alone.
 *
 * Returns extra replacements that should be merged with the outer-tag removal.
 */
export function buildDowngradeReplacements(
  sourceText: string,
  enclosingHtmlTagBeingRemoved: DetectedTag,
  allEnclosingTags: DetectedTag[],
  interiorTags: DetectedTag[],
): TextReplacement[] {
  // If another HTML closing tag still encloses the selection, do not downgrade.
  // Compare by position (line+ch) because tag context may be re-built and produce fresh object references.
  const beingRemovedKey = positionKey(enclosingHtmlTagBeingRemoved);
  const otherOuterHtml = allEnclosingTags.some((candidate) =>
    positionKey(candidate) !== beingRemovedKey &&
    candidate.isHTML && !candidate.isSpan &&
    HTML_TO_MD_DELIM[MD_TO_HTML_ELEMENT[candidate.type] ?? ''] !== undefined);
  if (otherOuterHtml) return [];

  const replacements: TextReplacement[] = [];

  for (const innerTag of interiorTags) {
    if (!innerTag.isHTML || innerTag.isSpan) continue;
    const element = MD_TO_HTML_ELEMENT[innerTag.type];
    const delim = element ? HTML_TO_MD_DELIM[element] : undefined;
    if (!delim) continue;

    const range = detectedTagToOffsets(sourceText, innerTag);
    if (!range) continue;

    replacements.push({ fromOffset: range.openStart, toOffset: range.openEnd, replacementText: delim });
    replacements.push({ fromOffset: range.closeStart, toOffset: range.closeEnd, replacementText: delim });
  }

  return replacements;
}

/** Helper: builds offset ranges for inner tags fully nested inside the outer enclosing range. */
export function findInteriorTagsWithinRange(
  sourceText: string,
  outerRange: TagOffsetRange,
  allTags: DetectedTag[],
): DetectedTag[] {
  return allTags.filter((tag) => {
    const range = detectedTagToOffsets(sourceText, tag);
    if (!range) return false;
    if (range.openStart === outerRange.openStart && range.closeStart === outerRange.closeStart) return false;
    return range.openStart >= outerRange.openEnd && range.closeEnd <= outerRange.closeStart;
  });
}
