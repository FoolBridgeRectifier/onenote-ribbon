import type { TagDefinition, TextReplacement, ProtectedRange } from '../../interfaces';
import type { HtmlTagRange } from '../../../enclosing-html-tags/interfaces';
import { wrapTextWithTag } from '../TagManipulation';

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
  tagName: string
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
    const hasOverlap = contentStart < selectionEndOffset && selectionStartOffset < contentEnd;

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
  tagDefinition: TagDefinition
): TextReplacement[] {
  if (protectedRanges.length === 0) {
    return wrapTextWithTag(selectionStartOffset, selectionEndOffset, tagDefinition);
  }

  const sortedRanges = [...protectedRanges].sort(
    (rangeA, rangeB) => rangeA.startOffset - rangeB.startOffset
  );

  const allReplacements: TextReplacement[] = [];

  // Collect all formattable gaps as absolute [start, end] pairs
  const gaps: Array<{ absoluteStart: number; absoluteEnd: number }> = [];

  // Gap before the first protected range
  const firstProtectedAbsoluteStart = selectionStartOffset + sortedRanges[0].startOffset;
  if (firstProtectedAbsoluteStart > selectionStartOffset) {
    gaps.push({
      absoluteStart: selectionStartOffset,
      absoluteEnd: firstProtectedAbsoluteStart,
    });
  }

  // Gaps between consecutive protected ranges
  for (let gapIndex = 0; gapIndex < sortedRanges.length - 1; gapIndex++) {
    const currentRangeAbsoluteEnd = selectionStartOffset + sortedRanges[gapIndex].endOffset;
    const nextRangeAbsoluteStart = selectionStartOffset + sortedRanges[gapIndex + 1].startOffset;

    if (nextRangeAbsoluteStart > currentRangeAbsoluteEnd) {
      gaps.push({
        absoluteStart: currentRangeAbsoluteEnd,
        absoluteEnd: nextRangeAbsoluteStart,
      });
    }
  }

  // Gap after the last protected range
  const lastSortedRange = sortedRanges[sortedRanges.length - 1];
  const lastProtectedAbsoluteEnd = selectionStartOffset + lastSortedRange.endOffset;
  if (lastProtectedAbsoluteEnd < selectionEndOffset) {
    gaps.push({
      absoluteStart: lastProtectedAbsoluteEnd,
      absoluteEnd: selectionEndOffset,
    });
  }

  // Generate wrap replacements for each gap
  for (let gapIndex = 0; gapIndex < gaps.length; gapIndex++) {
    const gap = gaps[gapIndex];
    const wrapReplacements = wrapTextWithTag(gap.absoluteStart, gap.absoluteEnd, tagDefinition);
    allReplacements.push(...wrapReplacements);
  }

  // Sort all replacements in last-to-first offset order for safe sequential apply
  allReplacements.sort(
    (replacementA, replacementB) => replacementB.fromOffset - replacementA.fromOffset
  );

  return allReplacements;
}
