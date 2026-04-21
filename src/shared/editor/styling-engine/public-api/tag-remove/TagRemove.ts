import type {
  TagDefinition,
  TextReplacement,
  StylingResult,
  StylingContext,
  RemoveAllTagsOptions,
} from '../../interfaces';
import { buildTagRanges } from '../../../enclosing-html-tags/enclosingHtmlTags';
import { unwrapTag } from '../../tag-manipulation/TagManipulation';
import { detectStructureContext } from '../../structure-detection/StructureDetection';
import {
  findEnclosingMatchingTag,
  findDelimiterInclusiveMatch,
  findAllEnclosingTags,
  findAllTagsWithinSelection,
  compareByContentWidth,
} from '../../shared-helpers/tag-geometry/TagGeometry';
import {
  sortReplacementsLastToFirst,
  deduplicateReplacements,
} from '../../shared-helpers/SharedHelpers';

/**
 * Removes the first matching tag (enclosing or delimiter-inclusive) from the selection.
 */
export function removeTag(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;
  const allTagRanges = buildTagRanges(sourceText);

  const enclosingMatch = findEnclosingMatchingTag(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition
  );
  if (enclosingMatch !== null) return { replacements: unwrapTag(enclosingMatch), isNoOp: false };

  const delimiterMatch = findDelimiterInclusiveMatch(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition
  );
  if (delimiterMatch !== null) return { replacements: unwrapTag(delimiterMatch), isNoOp: false };

  return { replacements: [], isNoOp: true };
}

/**
 * Removes all formatting tags from the selection (optionally filtered to a specific set).
 * Tags are removed largest-first so inner tags are not orphaned.
 */
export function removeAllTags(
  context: StylingContext,
  _options?: RemoveAllTagsOptions
): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;
  const structureContext = detectStructureContext(
    sourceText,
    selectionStartOffset,
    selectionEndOffset
  );
  if (structureContext.isFullyInert) return { replacements: [], isNoOp: true };

  const allTagRanges = buildTagRanges(sourceText);

  const enclosingTagRanges = findAllEnclosingTags(
    allTagRanges,
    selectionStartOffset,
    selectionEndOffset
  );
  const containedTagRanges = findAllTagsWithinSelection(
    allTagRanges,
    selectionStartOffset,
    selectionEndOffset
  );

  // Combine and deduplicate by offset key before building replacements
  const combined = [...enclosingTagRanges, ...containedTagRanges];
  const seenKeys = new Set<string>();
  const uniqueRanges = combined.filter((tagRange) => {
    const key = tagRange.openingTagStartOffset + ':' + tagRange.closingTagEndOffset;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // Sort largest-first (by content width) to unwrap outer tags before inner ones
  uniqueRanges.sort(compareByContentWidth).reverse();

  const rawReplacements: TextReplacement[] = [];
  for (const tagRange of uniqueRanges) {
    rawReplacements.push(...unwrapTag(tagRange));
  }

  const sortedReplacements = sortReplacementsLastToFirst(rawReplacements);
  const deduplicated = deduplicateReplacements(sortedReplacements);

  return { replacements: deduplicated, isNoOp: deduplicated.length === 0 };
}
