import type { TagDefinition, StylingContext, StylingResult } from '../../interfaces';
import type { DetectedTag } from '../../../detection-engine/interfaces';
import { sortReplacementsLastToFirst } from '../../helpers';
import { detectedTagToOffsets } from '../helpers';
import { buildPunchOutOrFullRemoveReplacements } from '../punch-out-builder/punchOutBuilder';

/**
 * R10/R11/R12 — swap `<sub>` ↔ `<sup>`.
 * Full selection: replace open + close in place.
 * Partial selection: swap whole tag AND punch-out the requested portion to the new type.
 */
export function buildSubSupSwapReplacements(context: StylingContext, enclosingTag: DetectedTag, requestedTag: TagDefinition): StylingResult {
  const range = detectedTagToOffsets(context.sourceText, enclosingTag);
  if (!range) return { replacements: [], isNoOp: true };

  const newElement = requestedTag.type === 'superscript' ? 'sup' : 'sub';
  const newOpen = `<${newElement}>`;
  const newClose = `</${newElement}>`;

  const contentStart = range.openEnd;
  const contentEnd = range.closeStart;
  const coversFullContent = context.selectionStartOffset <= contentStart && context.selectionEndOffset >= contentEnd;

  if (coversFullContent) {
    return {
      replacements: sortReplacementsLastToFirst([
        { fromOffset: range.closeStart, toOffset: range.closeEnd, replacementText: newClose },
        { fromOffset: range.openStart, toOffset: range.openEnd, replacementText: newOpen },
      ]),
      isNoOp: false,
    };
  }

  // Partial: punch-out from selection AND replace original open with new type.
  const punchReplacements = buildPunchOutOrFullRemoveReplacements(
    context.selectionStartOffset, context.selectionEndOffset, range, newOpen, newClose,
  );

  // Ensure the original open is replaced with the new tag type even if the punch-out path didn't touch it.
  const openAlreadyReplaced = punchReplacements.some((replacement) =>
    replacement.fromOffset === range.openStart && replacement.toOffset === range.openEnd);
  const finalReplacements = openAlreadyReplaced
    ? punchReplacements.map((replacement) =>
        replacement.fromOffset === range.openStart && replacement.toOffset === range.openEnd
          ? { ...replacement, replacementText: newOpen }
          : replacement)
    : [...punchReplacements, { fromOffset: range.openStart, toOffset: range.openEnd, replacementText: newOpen }];

  return { replacements: sortReplacementsLastToFirst(finalReplacements), isNoOp: false };
}
