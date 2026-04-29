import type { StylingContext, TagDefinition, StylingResult } from '../../../interfaces';

/**
 * X13 — `<b>==hello==</b>` + highlight selectAll → strip the `==hello==` MD pair and wrap the
 * inner text with `<span style="background:...">…</span>`. Triggered ONLY when:
 *   - tagDefinition is the MD highlight tag, AND
 *   - a same-type MD highlight pair lives entirely inside the selection, AND
 *   - the pair's interior is inside an HTML element on the same line (HTML context).
 *
 * Returns null when the cross case does not apply.
 * TODO: restore full implementation after engine refactor is complete.
 */
export function tryHighlightInsideHtmlPromote(
  _context: StylingContext,
  tagDefinition: TagDefinition
): StylingResult | null {
  if (tagDefinition.type !== 'highlight') return null;
  if (tagDefinition.isHTML || tagDefinition.isSpan) return null;

  // Stub — always returns null until engine refactor restores buildTagContext.
  return null;
}
