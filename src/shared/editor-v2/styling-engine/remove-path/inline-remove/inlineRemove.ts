import type {
  TagDefinition,
  StylingContext,
  StylingResult,
  TextReplacement,
} from '../../interfaces';
import type { DetectedTag } from '../../../detection-engine/interfaces';
import { sortReplacementsLastToFirst } from '../../helpers';
import { detectedTagToOffsets } from '../helpers';
import { buildPunchOutOrFullRemoveReplacements } from '../punch-out-builder/punchOutBuilder';
import { buildSpanRemoveReplacements } from '../span-remove/spanRemove';
import type { RemoveDecision } from '../interfaces';
import { buildSubSupSwapReplacements } from '../sub-sup-swap/subSupSwap';
import {
  buildDowngradeReplacements,
  findInteriorTagsWithinRange,
} from '../downgrade-html-to-md/downgradeHtmlToMd';
// TODO: restore buildTagContext / getEnclosingTags imports after engine refactor is complete
import { offsetToEditorPosition } from '../helpers';
import { getMdDelimiter, getHtmlElementName } from '../../add-path/inline-add/helpers';

/** Top-level inline remove dispatcher. Called when `decideRemove` chose remove. */
export function processInlineRemove(
  context: StylingContext,
  tagDefinition: TagDefinition,
  decision: RemoveDecision
): StylingResult {
  // R10/R11/R12 — sub/sup swap takes priority over plain remove.
  if (decision.enclosingTag && isSubSupSwap(decision.enclosingTag.type, tagDefinition.type)) {
    return buildSubSupSwapReplacements(context, decision.enclosingTag, tagDefinition);
  }

  // Span remove (R7/R8/R14/R15) handled separately because it edits the style attribute.
  if (decision.enclosingTag?.isSpan) {
    return buildSpanRemoveReplacements(context, decision.enclosingTag, tagDefinition);
  }

  return buildClosingTagRemoveResult(context, tagDefinition, decision);
}

function isSubSupSwap(enclosingType: string, requestedType: string): boolean {
  return (
    (enclosingType === 'subscript' && requestedType === 'superscript') ||
    (enclosingType === 'superscript' && requestedType === 'subscript')
  );
}

/** MD or HTML closing tag remove: handles R1/R2/R3/R5/R6/R9/R13/R20. */
function buildClosingTagRemoveResult(
  context: StylingContext,
  tagDefinition: TagDefinition,
  decision: RemoveDecision
): StylingResult {
  const allReplacements: TextReplacement[] = [];
  const stackedTags = decision.stackedEnclosing;
  // TODO: restore real detection once engine refactor is complete.
  const tagContext = { tags: [] };

  // R13 — remove every same-type enclosing tag PLUS any same-type tag nested inside the outermost.
  const allSameTypeTags = collectAllSameTypeTagsForRemoval(
    stackedTags,
    tagContext.tags,
    tagDefinition,
    context
  );
  for (const tagToRemove of allSameTypeTags) {
    const range = detectedTagToOffsets(context.sourceText, tagToRemove);
    if (!range) continue;
    const { openText, closeText } = openCloseTextFor(tagDefinition);
    allReplacements.push(
      ...buildPunchOutOrFullRemoveReplacements(
        context.selectionStartOffset,
        context.selectionEndOffset,
        range,
        openText,
        closeText
      )
    );
  }

  // R9 — also remove the HTML equivalent (e.g. <b> when removing **).
  if (decision.htmlEquivalent) {
    const range = detectedTagToOffsets(context.sourceText, decision.htmlEquivalent);
    if (range) {
      const element = getHtmlElementName({ type: decision.htmlEquivalent.type, isHTML: true });
      const openText = element ? `<${element}>` : '';
      const closeText = element ? `</${element}>` : '';
      allReplacements.push(
        ...buildPunchOutOrFullRemoveReplacements(
          context.selectionStartOffset,
          context.selectionEndOffset,
          range,
          openText,
          closeText
        )
      );
    }
  }

  // R20 — when removing an HTML closing tag, downgrade inner HTML tags with MD equivalents.
  if (decision.enclosingTag?.isHTML && !decision.enclosingTag.isSpan) {
    // TODO: stub — getEnclosingTags removed; return empty list until engine refactor is complete.
    const allEnclosing: DetectedTag[] = [];
    const outerRange = detectedTagToOffsets(context.sourceText, decision.enclosingTag);
    if (outerRange) {
      const interior = findInteriorTagsWithinRange(context.sourceText, outerRange, tagContext.tags);
      // Filter out same-type interior tags (already removed above).
      const interiorDifferentType = interior.filter(
        (tag) => tag.type !== decision.enclosingTag!.type
      );
      allReplacements.push(
        ...buildDowngradeReplacements(
          context.sourceText,
          decision.enclosingTag,
          allEnclosing,
          interiorDifferentType
        )
      );
    }
  }

  return {
    replacements: sortReplacementsLastToFirst(allReplacements),
    isNoOp: allReplacements.length === 0,
  };
}

/**
 * R13/R9 helper: collects every same-type tag fully contained in the selection range.
 * Includes enclosing same-type tags (decision.stackedEnclosing) AND inner same-type
 * tags nested inside the outermost (e.g. `<b><b>...</b></b>`, `<b>**...**</b>`).
 */
function collectAllSameTypeTagsForRemoval(
  stackedEnclosing: DetectedTag[],
  allTags: DetectedTag[],
  tagDefinition: TagDefinition,
  context: StylingContext
): DetectedTag[] {
  const collected = [...stackedEnclosing];
  const collectedKeys = new Set(stackedEnclosing.map((tag) => tagPositionKey(tag)));
  const selStart = context.selectionStartOffset;
  const selEnd = context.selectionEndOffset;

  for (const candidate of allTags) {
    if (candidate.type !== tagDefinition.type) continue;
    if (Boolean(candidate.isSpan) !== Boolean(tagDefinition.isSpan)) continue;
    if (Boolean(candidate.isHTML) !== Boolean(tagDefinition.isHTML)) continue;
    const range = detectedTagToOffsets(context.sourceText, candidate);
    if (!range) continue;
    // Tag must be fully inside the selection range.
    if (range.openStart < selStart || range.closeEnd > selEnd) continue;
    const key = tagPositionKey(candidate);
    if (collectedKeys.has(key)) continue;
    collectedKeys.add(key);
    collected.push(candidate);
  }
  return collected;
}

function tagPositionKey(tag: DetectedTag): string {
  if (!tag.open) return '';
  return `${tag.type}|${tag.open.start.line}:${tag.open.start.ch}-${tag.close?.end.ch ?? -1}`;
}

function openCloseTextFor(tagDefinition: TagDefinition): { openText: string; closeText: string } {
  if (tagDefinition.isHTML && !tagDefinition.isSpan) {
    const element = getHtmlElementName(tagDefinition);
    return { openText: element ? `<${element}>` : '', closeText: element ? `</${element}>` : '' };
  }
  const delim = getMdDelimiter(tagDefinition);
  return { openText: delim ?? '', closeText: delim ?? '' };
}
