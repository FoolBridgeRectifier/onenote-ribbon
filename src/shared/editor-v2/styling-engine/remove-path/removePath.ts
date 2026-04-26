import type { StylingContext, StylingResult, TagDefinition } from '../interfaces';
import { processInlineRemove } from './inline-remove/inlineRemove';
import { decideRemove } from './decide-remove/decideRemove';

/**
 * Top-level inline remove entry (called from toggleTag after decideRemove returns shouldRemove=true).
 * Pure delegation; kept as a separate file for symmetry with addPath.ts.
 */
export function processRemovePath(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  const decision = decideRemove(context, tagDefinition);
  if (!decision.shouldRemove || !decision.enclosingTag) return { replacements: [], isNoOp: true };
  return processInlineRemove(context, tagDefinition, decision);
}
