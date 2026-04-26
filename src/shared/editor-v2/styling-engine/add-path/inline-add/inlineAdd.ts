import type { TagDefinition, StylingContext, StylingResult, TextReplacement } from '../../interfaces';
import { sortReplacementsLastToFirst, lineBoundsAt } from '../../helpers';
import { isMarkdownTag, isSpanTag } from './helpers';
import { upgradeMdToHtmlIfNeeded } from '../upgrade-md-to-html/upgradeMdToHtml';
import { findNonProtectedSegments, trimSegmentWhitespace, buildPunchOutReplacements } from '../protected-punch-out/protectedPunchOut';
import { buildWrapReplacements } from './enclosing-detection/enclosingDetection';
import { computeLinePrefixLength } from './line-prefix/linePrefix';
import { tryMergeOrExtendMd } from './md-merge/mdMerge';
import { processSpanAdd } from './span-add/spanAdd';
import { upgradeInlineMdInsideSelection } from './md-to-html-pre-step/mdToHtmlPreStep';

/**
 * Adds (or merges/removes) an inline tag on a single-line selection.
 * Handles A1, A2, A3, A4, A5, A6, A7, A9, A10, A18, X10.
 */
export function processInlineAdd(context: StylingContext, tagDefinition: TagDefinition): StylingResult {
  const { sourceText } = context;
  let { selectionStartOffset: start, selectionEndOffset: end } = context;

  // X10 — never wrap line prefix.
  const lineStart = lineBoundsAt(sourceText, start).lineStart;
  const linePrefixLength = computeLinePrefixLength(sourceText, lineStart);
  const contentStart = lineStart + linePrefixLength;
  if (start < contentStart) start = contentStart;
  if (end < start) end = start;

  // A2 / A18 — upgrade MD tag to HTML when surrounded by HTML.
  const effectiveTag = upgradeMdToHtmlIfNeeded(sourceText, start, end, tagDefinition);

  if (isSpanTag(effectiveTag)) return processSpanAdd(sourceText, start, end, effectiveTag);

  // A7/A9 — MD merge/extend/remove via boundary tokens of same type.
  if (isMarkdownTag(effectiveTag)) {
    const merged = tryMergeOrExtendMd(sourceText, start, end, effectiveTag);
    if (merged) return merged;
  }

  // A10 — protected punch-out.
  const segments = findNonProtectedSegments(sourceText, start, end);
  const trimmed = trimSegmentWhitespace(sourceText, segments);
  const isPunchedOut = trimmed.length > 1 ||
    (trimmed.length === 1 && (trimmed[0].start !== start || trimmed[0].end !== end));

  if (isPunchedOut) {
    const replacements = buildPunchOutReplacements(trimmed, (segmentStart, segmentEnd) =>
      buildWrapReplacements(segmentStart, segmentEnd, effectiveTag));
    return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
  }

  // A18 — when wrapping with HTML/span, upgrade any inline MD inside the selection to HTML.
  let preReplacements: TextReplacement[] = [];
  if (effectiveTag.isHTML || effectiveTag.isSpan) {
    preReplacements = upgradeInlineMdInsideSelection(sourceText, start, end);
  }

  const wrap = buildWrapReplacements(start, end, effectiveTag);
  return {
    replacements: sortReplacementsLastToFirst([...preReplacements, ...wrap]),
    isNoOp: false,
  };
}
