import type { HtmlTagDefinition, StylingResult, StylingContext } from '../../interfaces';
import { buildTagRanges } from '../../../enclosing-html-tags/enclosingHtmlTags';
import { replaceOpeningTagAttribute } from '../../tag-manipulation/TagManipulation';
import { detectStructureContext } from '../../structure-detection/StructureDetection';
import { detectFormattingDomain } from '../../domain-detection/DomainDetection';
import { findEnclosingMatchingTag } from '../../shared-helpers/tag-geometry/TagGeometry';
import { resolveTagForDomain } from '../../shared-helpers/SharedHelpers';
import { buildWrapReplacements } from '../../wrap-replacements/WrapReplacements';
import { shouldProcessPerLine, addTagPerLine } from '../../per-line-processing/PerLineProcessing';

/**
 * Adds a formatting tag to the selection (never removes).
 * For spans with the same CSS property already present, replaces the attribute value
 * instead of double-wrapping.
 */
export function addTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;

  const structureContext = detectStructureContext(
    sourceText,
    selectionStartOffset,
    selectionEndOffset
  );
  if (structureContext.isFullyInert) return { replacements: [], isNoOp: true };

  // Multi-line structured content → process each line independently
  if (shouldProcessPerLine(structureContext)) {
    return addTagPerLine(
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      tagDefinition,
      structureContext,
      addTag
    );
  }

  const domainResult = detectFormattingDomain(sourceText, selectionStartOffset, selectionEndOffset);
  const effectiveTag = resolveTagForDomain(tagDefinition, domainResult.domain);

  // For span tags with attributes, check if a span with the same CSS property exists
  const isSpanWithAttributes =
    effectiveTag.tagName === 'span' && effectiveTag.attributes !== undefined;

  if (isSpanWithAttributes) {
    const allTagRanges = buildTagRanges(sourceText);
    const matchingRange = findEnclosingMatchingTag(
      allTagRanges,
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      effectiveTag
    );

    if (matchingRange !== null) {
      // Replace the existing attribute value instead of double-wrapping
      const targetPropertyName = Object.keys(effectiveTag.attributes!)[0];
      const targetPropertyValue = effectiveTag.attributes![targetPropertyName];
      const replacement = replaceOpeningTagAttribute(
        sourceText,
        matchingRange,
        targetPropertyName,
        targetPropertyValue
      );
      return { replacements: [replacement], isNoOp: false };
    }
  }

  // Wrap with the tag (handles domain conversion, protected ranges, standard wrap)
  return buildWrapReplacements(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
    effectiveTag,
    domainResult,
    structureContext,
    null
  );
}
