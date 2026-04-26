import type { TagDefinition, StylingContext, StylingResult, TextReplacement } from '../../interfaces';
import { lineBoundsAt, splitSelectionByLine, sortReplacementsLastToFirst } from '../../helpers';
import { classifyLine } from './helpers';
import { processCalloutAdd } from './callout-add/calloutAdd';
import { processMeetingDetails } from './meeting-details-add/meetingDetailsAdd';
import { tryCheckboxReplacesCallout } from './checkbox-replaces-callout/checkboxReplacesCallout';

/**
 * Add (or remove) a single-line / special tag on every line covered by the selection.
 * Handles: list, heading, quote, indent, checkbox, callout, inlineTodo, meetingDetails.
 */
export function processLineTagAdd(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  const segments = splitSelectionByLine(context.sourceText, context.selectionStartOffset, context.selectionEndOffset);
  if (segments.length === 0) {
    const bounds = lineBoundsAt(context.sourceText, context.selectionStartOffset);
    segments.push({ start: bounds.lineStart, end: bounds.lineStart });
  }

  if (tagDefinition.type === 'meetingDetails') return processMeetingDetails(context);
  if (tagDefinition.type === 'callout')        return processCalloutAdd(context, segments);
  if (tagDefinition.type === 'checkbox') {
    const calloutReplacement = tryCheckboxReplacesCallout(context, segments);
    if (calloutReplacement) return calloutReplacement;
  }

  // For multi-line: classify each line as already-tagged or not, then decide add vs remove.
  const lineOps = segments.map((segment) => classifyLine(context.sourceText, segment.start, tagDefinition));
  const allTagged = lineOps.every((op) => op.alreadyTagged);

  const replacements: TextReplacement[] = [];
  for (const op of lineOps) {
    if (allTagged) replacements.push(...op.removalReplacements);
    else if (!op.alreadyTagged) replacements.push(...op.additionReplacements);
  }

  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
}
