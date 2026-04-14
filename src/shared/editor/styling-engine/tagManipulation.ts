import { TagDefinition, TextReplacement, ProtectedRange } from './interfaces';
import { HtmlTagRange } from '../enclosing-html-tags/interfaces';

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
  tagDefinition: TagDefinition,
): TextReplacement[] {
  if (selectionStartOffset === selectionEndOffset) {
    return [
      {
        fromOffset: selectionStartOffset,
        toOffset: selectionStartOffset,
        replacementText:
          tagDefinition.openingMarkup + tagDefinition.closingMarkup,
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

export function buildSpanTagDefinition(
  cssProperty: string,
  cssValue: string,
): TagDefinition {
  return {
    tagName: 'span',
    domain: 'html',
    openingMarkup: '<span style="' + cssProperty + ': ' + cssValue + '">',
    closingMarkup: '</span>',
    attributes: { [cssProperty]: cssValue },
  };
}

// ============================================================
// Opening Tag Parsing
// ============================================================

const STYLE_ATTRIBUTE_REGEX = /style="([^"]+)"/;
const STYLE_PROPERTY_VALUE_REGEX = /^\s*([^:]+?)\s*:\s*(.+?)\s*;?\s*$/;

/**
 * Extracts the CSS property name and value from a span's opening tag.
 * Returns null if the tag has no style attribute or cannot be parsed.
 */
export function extractStylePropertyFromOpeningTag(
  openingTagText: string,
): { propertyName: string; propertyValue: string } | null {
  const styleMatch = openingTagText.match(STYLE_ATTRIBUTE_REGEX);

  if (!styleMatch) {
    return null;
  }

  const styleContent = styleMatch[1];
  const propertyMatch = styleContent.match(STYLE_PROPERTY_VALUE_REGEX);

  if (!propertyMatch) {
    return null;
  }

  return {
    propertyName: propertyMatch[1],
    propertyValue: propertyMatch[2],
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
  newCssValue: string,
): TextReplacement {
  const newOpeningTag =
    '<span style="' + cssProperty + ': ' + newCssValue + '">';

  return {
    fromOffset: tagRange.openingTagStartOffset,
    toOffset: tagRange.openingTagEndOffset,
    replacementText: newOpeningTag,
  };
}

// ============================================================
// Overlapping Tag Range Detection
// ============================================================

/**
 * Returns all tag ranges whose content area overlaps the given selection
 * and whose tagName matches the requested name.
 */
export function findOverlappingTagRanges(
  tagRanges: HtmlTagRange[],
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagName: string,
): HtmlTagRange[] {
  const overlapping: HtmlTagRange[] = [];

  for (let rangeIndex = 0; rangeIndex < tagRanges.length; rangeIndex++) {
    const tagRange = tagRanges[rangeIndex];

    if (tagRange.tagName !== tagName) {
      continue;
    }

    const contentStart = tagRange.openingTagEndOffset;
    const contentEnd = tagRange.closingTagStartOffset;

    // Two ranges overlap when each starts before the other ends
    const hasOverlap =
      contentStart < selectionEndOffset && selectionStartOffset < contentEnd;

    if (hasOverlap) {
      overlapping.push(tagRange);
    }
  }

  return overlapping;
}

// ============================================================
// Protected Range Gap Splitting
// ============================================================

/**
 * Wraps only the formattable gaps between/around protected ranges within a selection.
 * Protected range offsets are relative to selectionStartOffset and must be
 * converted to absolute offsets before generating replacements.
 * Returns all replacements in last-to-first offset order.
 */
export function splitFormattingAroundProtectedRanges(
  selectionStartOffset: number,
  selectionEndOffset: number,
  protectedRanges: ProtectedRange[],
  tagDefinition: TagDefinition,
): TextReplacement[] {
  if (protectedRanges.length === 0) {
    return wrapTextWithTag(
      selectionStartOffset,
      selectionEndOffset,
      tagDefinition,
    );
  }

  const sortedRanges = [...protectedRanges].sort(
    (rangeA, rangeB) => rangeA.startOffset - rangeB.startOffset,
  );

  const allReplacements: TextReplacement[] = [];

  // Collect all formattable gaps as absolute [start, end] pairs
  const gaps: Array<{ absoluteStart: number; absoluteEnd: number }> = [];

  // Gap before the first protected range
  const firstProtectedAbsoluteStart =
    selectionStartOffset + sortedRanges[0].startOffset;
  if (firstProtectedAbsoluteStart > selectionStartOffset) {
    gaps.push({
      absoluteStart: selectionStartOffset,
      absoluteEnd: firstProtectedAbsoluteStart,
    });
  }

  // Gaps between consecutive protected ranges
  for (let gapIndex = 0; gapIndex < sortedRanges.length - 1; gapIndex++) {
    const currentRangeAbsoluteEnd =
      selectionStartOffset + sortedRanges[gapIndex].endOffset;
    const nextRangeAbsoluteStart =
      selectionStartOffset + sortedRanges[gapIndex + 1].startOffset;

    if (nextRangeAbsoluteStart > currentRangeAbsoluteEnd) {
      gaps.push({
        absoluteStart: currentRangeAbsoluteEnd,
        absoluteEnd: nextRangeAbsoluteStart,
      });
    }
  }

  // Gap after the last protected range
  const lastSortedRange = sortedRanges[sortedRanges.length - 1];
  const lastProtectedAbsoluteEnd =
    selectionStartOffset + lastSortedRange.endOffset;
  if (lastProtectedAbsoluteEnd < selectionEndOffset) {
    gaps.push({
      absoluteStart: lastProtectedAbsoluteEnd,
      absoluteEnd: selectionEndOffset,
    });
  }

  // Generate wrap replacements for each gap
  for (let gapIndex = 0; gapIndex < gaps.length; gapIndex++) {
    const gap = gaps[gapIndex];
    const wrapReplacements = wrapTextWithTag(
      gap.absoluteStart,
      gap.absoluteEnd,
      tagDefinition,
    );
    allReplacements.push(...wrapReplacements);
  }

  // Sort all replacements in last-to-first offset order for safe sequential apply
  allReplacements.sort(
    (replacementA, replacementB) =>
      replacementB.fromOffset - replacementA.fromOffset,
  );

  return allReplacements;
}
