import type {
  TagDefinition,
  StylingResult,
  FormattingDomain,
  ProtectedRange,
} from '../../interfaces';
import type { HtmlTagRange } from '../../../enclosing-html-tags/interfaces';
import { buildTagRanges } from '../../enclosing-html-tags/EnclosingHtmlTags';
import { wrapTextWithTag } from '../tag-manipulation/TagManipulation';
import { splitFormattingAroundProtectedRanges } from '../tag-manipulation/range-splitting/RangeSplitting';
import { sortReplacementsLastToFirst } from '../shared-helpers/SharedHelpers';
import { buildDomainConversionReplacements } from '../domain-conversion/DomainConversion';

/**
 * Produces wrap replacements for adding a tag, handling domain conversion,
 * protected ranges, and standard wrapping. Shared by toggleTag and addTag.
 */
export function buildWrapReplacements(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  effectiveTag: TagDefinition,
  domainResult: { domain: FormattingDomain; hasMarkdownTokens: boolean },
  structureContext: {
    protectedRanges: { startOffset: number; endOffset: number; tokenType: string }[];
  },
  allTagRanges: HtmlTagRange[] | null
): StylingResult {
  // Domain conversion: adding HTML tag in MD domain with MD tokens present
  if (
    domainResult.domain === 'markdown' &&
    tagDefinition.domain === 'html' &&
    domainResult.hasMarkdownTokens
  ) {
    const tagRanges = allTagRanges ?? buildTagRanges(sourceText);
    const replacements = buildDomainConversionReplacements(
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      tagDefinition,
      tagRanges
    );

    let newSelectionStart: number | undefined;
    let newSelectionEnd: number | undefined;

    if (replacements.length === 1) {
      const replacement = replacements[0];

      if (selectionStartOffset < selectionEndOffset) {
        // Selection exists — find the original selected text within the replacement
        const selectedText = sourceText.slice(selectionStartOffset, selectionEndOffset);
        const selectedTextPosition = replacement.replacementText.indexOf(selectedText);

        if (selectedTextPosition !== -1) {
          newSelectionStart = replacement.fromOffset + selectedTextPosition;
          newSelectionEnd = newSelectionStart + selectedText.length;
        }
      } else {
        // Cursor only — place cursor after the outermost opening markup
        newSelectionStart = replacement.fromOffset + tagDefinition.openingMarkup.length;
        newSelectionEnd = newSelectionStart;
      }
    }

    return {
      replacements: sortReplacementsLastToFirst(replacements),
      isNoOp: false,
      newSelectionStart,
      newSelectionEnd,
    };
  }

  // If structure has protected ranges, split formatting around them
  if (structureContext.protectedRanges.length > 0) {
    const replacements = splitFormattingAroundProtectedRanges(
      selectionStartOffset,
      selectionEndOffset,
      structureContext.protectedRanges as ProtectedRange[],
      effectiveTag
    );

    return { replacements, isNoOp: false };
  }

  // Standard wrap
  const replacements = wrapTextWithTag(selectionStartOffset, selectionEndOffset, effectiveTag);
  return { replacements, isNoOp: false };
}
