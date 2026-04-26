import type { TagDefinition, StylingContext, StylingResult } from '../../interfaces';
import { detectInertLines } from '../../../detection-engine/inert-zones/inertZones';
import { scanProtectedTokensInLine } from '../../../detection-engine/protected-tokens/protectedTokens';
import { EMPTY_REPLACEMENTS } from '../../constants';

/**
 * Returns true when the selection lies entirely inside an inert zone:
 *   - fenced code block
 *   - math block
 *   - tab-indented line
 *   - inside a backtick `code` token (X12)
 *
 * Caller short-circuits with isNoOp=true for inline tags in this case.
 * Line tags ignore this check (they always operate on the line prefix).
 */
export function isSelectionInsideInertZone(
  context: StylingContext,
  tagDefinition: TagDefinition,
): boolean {
  // Line tags operate on line start regardless of inert content.
  if (isLineLevelTag(tagDefinition)) return false;

  const lines = context.sourceText.split('\n');
  const inertLines = detectInertLines(context.sourceText);

  // Compute which line the selection start falls on.
  const startLineIndex = lineIndexOfOffset(context.sourceText, context.selectionStartOffset);
  if (inertLines[startLineIndex]) return true;

  // Check whether the selection lies entirely inside a backtick code-token range.
  const lineStartOffset = offsetOfLineStart(context.sourceText, startLineIndex);
  const line = lines[startLineIndex];
  const protectedRanges = scanProtectedTokensInLine(line, lineStartOffset, 0);
  for (const range of protectedRanges) {
    if (range.tokenType !== 'code') continue;
    const insideCode =
      context.selectionStartOffset >= range.startOffset &&
      context.selectionEndOffset   <= range.endOffset;
    if (insideCode) return true;
  }

  return false;
}

/** Builds the no-op styling result returned by toggleTag for inert selections. */
export function buildNoOpResult(): StylingResult {
  return { replacements: EMPTY_REPLACEMENTS, isNoOp: true };
}

function isLineLevelTag(tagDefinition: TagDefinition): boolean {
  const lineTypes = new Set(['list', 'heading', 'quote', 'indent', 'checkbox', 'callout', 'inlineTodo', 'meetingDetails']);
  return lineTypes.has(tagDefinition.type);
}

function lineIndexOfOffset(sourceText: string, offset: number): number {
  let lineIndex = 0;
  for (let i = 0; i < offset && i < sourceText.length; i++) {
    if (sourceText[i] === '\n') lineIndex++;
  }
  return lineIndex;
}

function offsetOfLineStart(sourceText: string, lineIndex: number): number {
  let line = 0;
  for (let i = 0; i < sourceText.length; i++) {
    if (line === lineIndex) return i;
    if (sourceText[i] === '\n') line++;
  }
  return sourceText.length;
}
