import type { TagDefinition, StylingContext, StylingResult, TextReplacement } from '../../interfaces';
import type { DetectedTag } from '../../../detection-engine/interfaces';
import { sortReplacementsLastToFirst } from '../../helpers';
import { detectedTagToOffsets } from '../helpers';
import { buildSpanOpener, getSpanCssProperty } from '../../add-path/inline-add/helpers';

/**
 * Span remove (R7/R8/R14/R15).
 * - Multi-property span: rebuild opener with the requested property stripped.
 * - Single-property span (or property absent): full remove of `<span ...>` and `</span>`.
 * - Partial selection: punch-out — selected portion loses span; flanking portions keep it.
 */
export function buildSpanRemoveReplacements(context: StylingContext, enclosingTag: DetectedTag, requestedTag: TagDefinition): StylingResult {
  const range = detectedTagToOffsets(context.sourceText, enclosingTag);
  if (!range) return { replacements: [], isNoOp: true };

  const requestedProperty = getSpanCssProperty(requestedTag);
  if (!requestedProperty) return { replacements: [], isNoOp: true };

  const openText = context.sourceText.slice(range.openStart, range.openEnd);
  const styleAttribute = extractStyleAttribute(openText);
  const remainingProperties = stripPropertyFromStyle(styleAttribute, requestedProperty);

  const contentStart = range.openEnd;
  const contentEnd = range.closeStart;
  const coversFullContent = context.selectionStartOffset <= contentStart && context.selectionEndOffset >= contentEnd;

  // Multi-property: only strip the requested property; keep the span.
  if (remainingProperties.length > 0 && coversFullContent) {
    const newOpenText = `<span style="${remainingProperties}">`;
    return {
      replacements: [{ fromOffset: range.openStart, toOffset: range.openEnd, replacementText: newOpenText }],
      isNoOp: false,
    };
  }

  if (coversFullContent) {
    return {
      replacements: sortReplacementsLastToFirst([
        { fromOffset: range.closeStart, toOffset: range.closeEnd, replacementText: '' },
        { fromOffset: range.openStart, toOffset: range.openEnd, replacementText: '' },
      ]),
      isNoOp: false,
    };
  }

  // Partial selection: punch-out — the span continues outside, but the selected portion is bare.
  const replacements: TextReplacement[] = [];
  const newCloseText = '</span>';
  const newOpenForRemainder = remainingProperties.length > 0
    ? `<span style="${remainingProperties}">`
    : openText;

  if (context.selectionEndOffset >= contentEnd) {
    replacements.push({ fromOffset: range.closeStart, toOffset: range.closeEnd, replacementText: '' });
    replacements.push({ fromOffset: context.selectionStartOffset, toOffset: context.selectionStartOffset, replacementText: newCloseText });
  } else if (context.selectionStartOffset <= contentStart) {
    replacements.push({ fromOffset: context.selectionEndOffset, toOffset: context.selectionEndOffset, replacementText: newOpenForRemainder });
    replacements.push({ fromOffset: range.openStart, toOffset: range.openEnd, replacementText: '' });
  } else {
    replacements.push({ fromOffset: context.selectionEndOffset, toOffset: context.selectionEndOffset, replacementText: newOpenForRemainder });
    replacements.push({ fromOffset: context.selectionStartOffset, toOffset: context.selectionStartOffset, replacementText: newCloseText });
  }

  // Ensure final replacements are sorted last-to-first.
  void buildSpanOpener; // Imported for future use in nested-span scenarios.
  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: false };
}

/** Extracts the `style="..."` attribute payload from a `<span ...>` opener. */
function extractStyleAttribute(openText: string): string {
  const match = /style="([^"]*)"/.exec(openText);
  return match ? match[1] : '';
}

/** Removes one CSS property declaration from a semicolon-separated style string. */
function stripPropertyFromStyle(styleAttribute: string, propertyName: string): string {
  return styleAttribute
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.length > 0)
    .filter((declaration) => !declaration.startsWith(`${propertyName}:`))
    .join(';');
}
