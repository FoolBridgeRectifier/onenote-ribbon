import type { StylingContext, StylingResult, TagDefinition, CopiedFormat } from './interfaces';
import { processAddPath } from './add-path/addPath';
import { processRemovePath } from './remove-path/removePath';
import { decideRemove } from './remove-path/decide-remove/decideRemove';
import { processRemoveAllTags } from './remove-path/remove-all-tags/removeAllTags';
import { LINE_LEVEL_TYPES } from './constants';
import { copyFormatImpl } from './copy-format/copyFormat';

/**
 * Toggles a tag on the selection. Routing:
 *   - Line tags + multi-line selections → add path (which handles its own remove leg).
 *   - Inline single-line: ask decideRemove if a same-type enclosing tag exists.
 *     Yes → remove path. No → add path.
 */
export function toggleTag(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  if (LINE_LEVEL_TYPES.has(tagDefinition.type)) return processAddPath(context, tagDefinition);

  const selectionSpansMultipleLines = context.sourceText
    .slice(context.selectionStartOffset, context.selectionEndOffset)
    .includes('\n');
  if (selectionSpansMultipleLines) return processAddPath(context, tagDefinition);

  const decision = decideRemove(context, tagDefinition);
  if (decision.shouldRemove) return processRemovePath(context, tagDefinition);

  return processAddPath(context, tagDefinition);
}

/** Removes every detectable tag (inline + span + line-prefix) inside the selection. */
export function removeAllTags(context: StylingContext): StylingResult {
  return processRemoveAllTags(context);
}

/**
 * Captures all active and enclosing inline tags at the cursor or selection,
 * plus the line-level tag if the line start is inside the selection.
 *
 * On paste: caller toggles any tags missing from the destination selection and
 * applies the lineTagDefinition at the start of each destination line.
 */
export function copyFormat(context: StylingContext): CopiedFormat {
  return copyFormatImpl(context);
}
