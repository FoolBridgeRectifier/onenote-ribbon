import type { TagDefinition, StylingContext } from '../../interfaces';
import type { DetectedTag } from '../../../detection-engine/interfaces';
import { buildTagContext, getEnclosingTags } from '../../../detection-engine/DetectionEngine';
import { offsetToEditorPosition, detectedTagToOffsets } from '../helpers';
import type { RemoveDecision } from '../interfaces';
import { MD_TYPES_WITH_HTML_EQUIVALENT } from './constants';

/**
 * Inspects the document and returns a RemoveDecision indicating whether the
 * requested tag is currently enclosing the selection.
 *
 * Triggers shouldRemove = true when EITHER:
 *   - a same-type non-span tag encloses the selection (R1-R6/R13), OR
 *   - a same-type span FULLY covers the selection (R12/R14/R15 — partial-cov
 *     span goes to add-path so style merge logic can replace properties), OR
 *   - an HTML equivalent encloses AND a same-type MD pair sits inside (R9), OR
 *   - a sub/sup partner encloses (R10/R11/R12 swap).
 */
export function decideRemove(context: StylingContext, tagDefinition: TagDefinition): RemoveDecision {
  const tagContext = buildTagContext(context.sourceText);
  const selectionStart = offsetToEditorPosition(context.sourceText, context.selectionStartOffset);
  const selectionEnd = offsetToEditorPosition(context.sourceText, context.selectionEndOffset);
  const enclosingAll = getEnclosingTags(tagContext, selectionStart, selectionEnd);

  const sameTypeEnclosingRaw = enclosingAll.filter((candidate) => isMatchForRequest(candidate, tagDefinition));
  // For SPANS only: route to remove path ONLY when selection is partial inside the span's content.
  // When selection covers the entire content (or extends beyond), let add-path handle property merge / full strip.
  const sameTypeEnclosing = sameTypeEnclosingRaw.filter((candidate) => {
    if (!tagDefinition.isSpan) return true;
    const range = detectedTagToOffsets(context.sourceText, candidate);
    if (!range) return false;
    const coversFullContent = context.selectionStartOffset <= range.openEnd && context.selectionEndOffset >= range.closeStart;
    return !coversFullContent;
  });

  // R12/R14/R15: a same-type span fully INSIDE the selection should also trigger remove (selectAll on `<span...>...</span>`).
  let spanFullyInsideSelection: DetectedTag | null = null;
  if (tagDefinition.isSpan && sameTypeEnclosing.length === 0) {
    spanFullyInsideSelection = findFirstSameTypeTagInsideSelection(tagContext.tags, tagDefinition, context);
  }

  const swapPartner = findSwapPartner(enclosingAll, tagDefinition);
  const htmlEquivalent = findHtmlEquivalentEnclosingForMdRequest(enclosingAll, tagDefinition);

  // R9 trigger: HTML equivalent encloses AND a same-type MD pair lives inside the selection.
  let r9InsideMatch: DetectedTag | null = null;
  if (htmlEquivalent && sameTypeEnclosing.length === 0) {
    r9InsideMatch = findFirstSameTypeTagInsideSelection(tagContext.tags, tagDefinition, context);
  }

  // Pick innermost enclosing as primary; fall back to span-inside / R9 inside-match / swap partner.
  const primary = sameTypeEnclosing.length > 0
    ? sameTypeEnclosing.reduce((best, candidate) => (candidate.open!.start.ch > best.open!.start.ch ? candidate : best))
    : spanFullyInsideSelection ?? r9InsideMatch ?? swapPartner ?? null;

  return {
    shouldRemove: Boolean(primary),
    enclosingTag: primary,
    htmlEquivalent: r9InsideMatch ? htmlEquivalent : (sameTypeEnclosing.length > 0 ? htmlEquivalent : null),
    stackedEnclosing: sameTypeEnclosing,
  };
}

/** Same-type match: identical type AND identical isHTML / isSpan flags. */
function isMatchForRequest(candidate: DetectedTag, tagDefinition: TagDefinition): boolean {
  if (candidate.type !== tagDefinition.type) return false;
  if (tagDefinition.isSpan) return Boolean(candidate.isSpan);
  if (tagDefinition.isHTML) return Boolean(candidate.isHTML) && !candidate.isSpan;
  return !candidate.isHTML && !candidate.isSpan;
}

/** Returns the first same-type tag whose open..close range is inside the selection. */
function findFirstSameTypeTagInsideSelection(allTags: DetectedTag[], tagDefinition: TagDefinition, context: StylingContext): DetectedTag | null {
  for (const candidate of allTags) {
    if (!isMatchForRequest(candidate, tagDefinition)) continue;
    const range = detectedTagToOffsets(context.sourceText, candidate);
    if (!range) continue;
    if (range.openStart >= context.selectionStartOffset && range.closeEnd <= context.selectionEndOffset) {
      return candidate;
    }
  }
  return null;
}

/** Finds enclosing sub when sup requested (and vice versa) for R10/R11/R12 swap. */
function findSwapPartner(enclosing: DetectedTag[], tagDefinition: TagDefinition): DetectedTag | null {
  const partnerType = tagDefinition.type === 'subscript' ? 'superscript'
    : tagDefinition.type === 'superscript' ? 'subscript'
    : null;
  if (!partnerType) return null;
  return enclosing.find((candidate) => candidate.type === partnerType && candidate.isHTML) ?? null;
}

/** R9 helper: HTML equivalent enclosing for a MD bold/italic/strike request. */
function findHtmlEquivalentEnclosingForMdRequest(enclosing: DetectedTag[], tagDefinition: TagDefinition): DetectedTag | null {
  if (tagDefinition.isHTML || tagDefinition.isSpan) return null;
  if (!MD_TYPES_WITH_HTML_EQUIVALENT.has(tagDefinition.type)) return null;
  return enclosing.find((candidate) => candidate.type === tagDefinition.type && candidate.isHTML && !candidate.isSpan) ?? null;
}
