import type { StylingContext, TagDefinition, StylingResult, TextReplacement } from '../../../interfaces';
import { sortReplacementsLastToFirst } from '../../../helpers';
import { buildTagContext, getEnclosingTags } from '../../../../detection-engine/DetectionEngine';
import { detectedTagToOffsets } from '../../../remove-path/helpers';
import { buildSpanOpener } from '../helpers';

/**
 * X13 — `<b>==hello==</b>` + highlight selectAll → strip the `==hello==` MD pair and wrap the
 * inner text with `<span style="background:...">…</span>`. Triggered ONLY when:
 *   - tagDefinition is the MD highlight tag, AND
 *   - a same-type MD highlight pair lives entirely inside the selection, AND
 *   - the pair's interior is inside an HTML element on the same line (HTML context).
 *
 * Returns null when the cross case does not apply.
 */
export function tryHighlightInsideHtmlPromote(
  context: StylingContext,
  tagDefinition: TagDefinition,
): StylingResult | null {
  if (tagDefinition.type !== 'highlight') return null;
  if (tagDefinition.isHTML || tagDefinition.isSpan) return null;

  const { sourceText, selectionStartOffset: selectionStart, selectionEndOffset: selectionEnd } = context;

  const tagContext = buildTagContext(sourceText);

  // Find a highlight MD pair fully inside selection.
  const innerPair = tagContext.tags.find((tag) => {
    if (tag.type !== 'highlight') return false;
    if (tag.isHTML || tag.isSpan) return false;
    if (!tag.open || !tag.close) return false;
    const tagOffsets = detectedTagToOffsets(sourceText, tag);
    if (!tagOffsets) return false;
    return tagOffsets.openStart >= selectionStart && tagOffsets.closeEnd <= selectionEnd;
  });
  if (!innerPair) return null;

  const offsets = detectedTagToOffsets(sourceText, innerPair);
  if (!offsets) return null;

  // Verify the pair's interior is inside HTML element on the same line.
  const interiorStartPosition = { line: innerPair.open!.end.line, ch: innerPair.open!.end.ch };
  const interiorEndPosition   = { line: innerPair.close!.start.line, ch: innerPair.close!.start.ch };
  const enclosing = getEnclosingTags(tagContext, interiorStartPosition, interiorEndPosition);
  const insideHtmlElement = enclosing.some((tag) => tag.isHTML || tag.isSpan);
  if (!insideHtmlElement) return null;

  const interiorText = sourceText.slice(offsets.openEnd, offsets.closeStart);
  const spanOpener = buildSpanOpener({ type: 'highlight', isSpan: true });
  const replacementText = `${spanOpener}${interiorText}</span>`;

  const replacements: TextReplacement[] = [{
    fromOffset: offsets.openStart,
    toOffset:   offsets.closeEnd,
    replacementText,
  }];
  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: false };
}
