import type { StylingContext, StylingResult, TagDefinition, CopiedFormat } from './interfaces';

/**
 * Toggles a tag on the selection in context.sourceText.
 *
 * Decision tree (see SPEC.md for the full matrix):
 *   — Line tags (single/special): line-level add/remove logic
 *   — Inline tags (md-closing/html-closing/html-span): detect domain, find enclosing tag,
 *     then Remove if already active (or partially inside), Add otherwise.
 *
 * Protected ranges inside the selection are punched out (wrapped around, not inside).
 * Invariants I1–I6 must hold after every operation.
 *
 * @returns StylingResult with replacements ordered last-to-first.
 */
export function toggleTag(_context: StylingContext, _tagDefinition: TagDefinition): StylingResult {
  throw new Error('not implemented');
}

/**
 * Removes all enclosing and interior tags from the selection in one pass.
 * Processes replacements last-to-first to prevent offset drift.
 * For multi-line selections: also removes single-line tags if the line start is inside the range.
 */
export function removeAllTags(_context: StylingContext): StylingResult {
  throw new Error('not implemented');
}

/**
 * Captures all active and enclosing inline tags at the cursor or selection,
 * plus the line-level tag if the line start is inside the selection.
 *
 * On paste: caller toggles any tags missing from the destination selection and
 * applies the lineTagDefinition at the start of each destination line.
 */
export function copyFormat(_context: StylingContext): CopiedFormat {
  throw new Error('not implemented');
}
