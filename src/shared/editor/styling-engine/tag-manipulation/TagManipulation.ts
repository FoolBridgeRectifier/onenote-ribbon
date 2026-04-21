import type { HtmlTagDefinition, TextReplacement } from '../interfaces';
import type { HtmlTagRange } from '../../enclosing-html-tags/interfaces';

// ============================================================
// Tag Wrapping and Unwrapping
// ============================================================

/**
 * Creates two insertion replacements that wrap a selection with a tag's markup.
 * Returns replacements in last-to-first offset order for safe sequential apply.
 */
export function wrapTextWithTag(
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: HtmlTagDefinition
): TextReplacement[] {
  if (selectionStartOffset === selectionEndOffset) {
    return [
      {
        fromOffset: selectionStartOffset,
        toOffset: selectionStartOffset,
        replacementText: tagDefinition.openingMarkup + tagDefinition.closingMarkup,
      },
    ];
  }

  const closingInsertion: TextReplacement = {
    fromOffset: selectionEndOffset,
    toOffset: selectionEndOffset,
    replacementText: tagDefinition.closingMarkup,
  };

  const openingInsertion: TextReplacement = {
    fromOffset: selectionStartOffset,
    toOffset: selectionStartOffset,
    replacementText: tagDefinition.openingMarkup,
  };

  return [closingInsertion, openingInsertion];
}

/**
 * Creates two deletion replacements that remove both the opening and closing tags.
 * Returns replacements in last-to-first offset order for safe sequential apply.
 */
export function unwrapTag(tagRange: HtmlTagRange): TextReplacement[] {
  const closingDeletion: TextReplacement = {
    fromOffset: tagRange.closingTagStartOffset,
    toOffset: tagRange.closingTagEndOffset,
    replacementText: '',
  };

  const openingDeletion: TextReplacement = {
    fromOffset: tagRange.openingTagStartOffset,
    toOffset: tagRange.openingTagEndOffset,
    replacementText: '',
  };

  return [closingDeletion, openingDeletion];
}

// ============================================================
// Span Tag Construction
// ============================================================

export function buildSpanTagDefinition(cssProperty: string, cssValue: string): HtmlTagDefinition {
  return {
    tagName: 'span',
    domain: 'html',
    openingMarkup: '<span style="' + cssProperty + ': ' + cssValue + '">',
    closingMarkup: '</span>',
    attributes: { [cssProperty]: cssValue },
  };
}

// ============================================================
// Opening Tag Attribute Replacement
// ============================================================

/**
 * Replaces the opening tag within sourceText with a new tag containing
 * the updated CSS property value. Returns a single TextReplacement.
 * Note: This assumes one-CSS-property-per-span (invariant of this system).
 * Multi-property spans would lose other properties during replacement.
 */
export function replaceOpeningTagAttribute(
  sourceText: string,
  tagRange: HtmlTagRange,
  cssProperty: string,
  newCssValue: string
): TextReplacement {
  const newOpeningTag = '<span style="' + cssProperty + ': ' + newCssValue + '">';

  return {
    fromOffset: tagRange.openingTagStartOffset,
    toOffset: tagRange.openingTagEndOffset,
    replacementText: newOpeningTag,
  };
}
