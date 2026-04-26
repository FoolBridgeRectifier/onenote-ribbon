import type { TagDefinition, StylingContext, StylingResult } from '../interfaces';
import { isSelectionInsideInertZone, buildNoOpResult } from './inert-detection/inertDetection';
import { processLineTagAdd } from './line-tag-add/lineTagAdd';
import { processInlineAdd } from './inline-add/inlineAdd';
import { processMultiLineAdd } from './multi-line-add/multiLineAdd';

/** Top-level dispatcher for the Add path (toggleTag entry point for un-tagged selections). */
export function processAddPath(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  if (isSelectionInsideInertZone(context, tagDefinition)) return buildNoOpResult();

  if (isLineLevelTag(tagDefinition)) return processLineTagAdd(context, tagDefinition);

  if (isMultiLineSelection(context)) return processMultiLineAdd(context, tagDefinition);

  return processInlineAdd(context, tagDefinition);
}

function isLineLevelTag(tagDefinition: TagDefinition): boolean {
  const lineTypes = new Set(['list', 'heading', 'quote', 'indent', 'checkbox', 'callout', 'inlineTodo', 'meetingDetails']);
  return lineTypes.has(tagDefinition.type);
}

function isMultiLineSelection(context: StylingContext): boolean {
  const selected = context.sourceText.slice(context.selectionStartOffset, context.selectionEndOffset);
  return selected.includes('\n');
}
