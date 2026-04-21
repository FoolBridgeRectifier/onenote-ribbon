import type { HtmlTagDefinition, StylingResult, StylingContext } from '../../../interfaces';
import { MARKDOWN_TO_HTML_TAG_MAP } from '../../../constants';
import { buildTagRanges } from '../../../../enclosing-html-tags/enclosingHtmlTags';
import { unwrapTag } from '../../../tag-manipulation/TagManipulation';
import { detectStructureContext } from '../../../structure-detection/StructureDetection';
import { detectFormattingDomain } from '../../../domain-detection/DomainDetection';
import {
  findEnclosingMatchingTag,
  findDelimiterInclusiveMatch,
} from '../../../shared-helpers/tag-geometry/TagGeometry';
import {
  resolveTagForDomain,
  resolveMutuallyExclusiveScriptTag,
  buildTagMarkupSwapReplacements,
} from '../../../shared-helpers/SharedHelpers';
import { buildWrapReplacements } from '../../../wrap-replacements/WrapReplacements';
import {
  shouldProcessPerLine,
  toggleTagPerLine,
} from '../../../per-line-processing/PerLineProcessing';
import { addTag } from '../../tag-add/TagAdd';

/** Toggles a formatting tag on/off for the given selection; removes it if present, adds it if absent (handles domain conversion and protected ranges). */
export function toggleHtmlTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;

  const structureContext = detectStructureContext(
    sourceText,
    selectionStartOffset,
    selectionEndOffset
  );
  if (structureContext.isFullyInert) return { replacements: [], isNoOp: true };

  // Multi-line structured content → process each line independently
  if (shouldProcessPerLine(structureContext)) {
    return toggleTagPerLine(
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      tagDefinition,
      structureContext,
      toggleHtmlTag,
      addTag
    );
  }

  const domainResult = detectFormattingDomain(sourceText, selectionStartOffset, selectionEndOffset);
  const allTagRanges = buildTagRanges(sourceText);

  // Check if the target tag is already present
  const matchingRange = findEnclosingMatchingTag(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition
  );
  if (matchingRange !== null) {
    return { replacements: unwrapTag(matchingRange), isNoOp: false };
  }

  // Delimiter-inclusive check — selection includes the tag delimiters themselves
  const delimiterInclusiveMatch = findDelimiterInclusiveMatch(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition
  );
  if (delimiterInclusiveMatch !== null) {
    return { replacements: unwrapTag(delimiterInclusiveMatch), isNoOp: false };
  }

  // Check for HTML equivalent of a markdown tag (after domain conversion *→<b>)
  if (tagDefinition.domain === 'markdown') {
    const htmlEquivalent = MARKDOWN_TO_HTML_TAG_MAP.get(tagDefinition.tagName);

    if (htmlEquivalent) {
      const htmlMatch = findEnclosingMatchingTag(
        allTagRanges,
        sourceText,
        selectionStartOffset,
        selectionEndOffset,
        htmlEquivalent
      );
      if (htmlMatch !== null) return { replacements: unwrapTag(htmlMatch), isNoOp: false };

      const htmlDelimiterMatch = findDelimiterInclusiveMatch(
        allTagRanges,
        sourceText,
        selectionStartOffset,
        selectionEndOffset,
        htmlEquivalent
      );
      if (htmlDelimiterMatch !== null)
        return { replacements: unwrapTag(htmlDelimiterMatch), isNoOp: false };
    }
  }

  const mutuallyExclusiveScriptTag = resolveMutuallyExclusiveScriptTag(tagDefinition);

  if (mutuallyExclusiveScriptTag !== null) {
    const mutuallyExclusiveMatch = findEnclosingMatchingTag(
      allTagRanges,
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      mutuallyExclusiveScriptTag
    );
    if (mutuallyExclusiveMatch !== null) {
      return {
        replacements: buildTagMarkupSwapReplacements(mutuallyExclusiveMatch, tagDefinition),
        isNoOp: false,
      };
    }

    const delimiterInclusiveMutuallyExclusiveMatch = findDelimiterInclusiveMatch(
      allTagRanges,
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      mutuallyExclusiveScriptTag
    );
    if (delimiterInclusiveMutuallyExclusiveMatch !== null) {
      return {
        replacements: buildTagMarkupSwapReplacements(
          delimiterInclusiveMutuallyExclusiveMatch,
          tagDefinition
        ),
        isNoOp: false,
      };
    }
  }

  // Tag is absent — add it
  const effectiveTag = resolveTagForDomain(tagDefinition, domainResult.domain);

  return buildWrapReplacements(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
    effectiveTag,
    domainResult,
    structureContext,
    allTagRanges
  );
}
