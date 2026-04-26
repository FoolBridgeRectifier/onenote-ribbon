import type { StylingContext, StylingResult, TextReplacement } from '../../interfaces';
import { sortReplacementsLastToFirst, lineBoundsAt } from '../../helpers';
import { buildTagContext, getTagsInRange, getEnclosingTags } from '../../../detection-engine/DetectionEngine';
import { offsetToEditorPosition, detectedTagToOffsets } from '../helpers';
import { LINE_PREFIX_PATTERNS } from './constants';

/**
 * Removes every detectable tag (inline + span + line-prefix) inside the selection.
 * Single-pass; replacements sorted last-to-first.
 */
export function processRemoveAllTags(context: StylingContext): StylingResult {
  const tagContext = buildTagContext(context.sourceText);
  const selectionStart = offsetToEditorPosition(context.sourceText, context.selectionStartOffset);
  const selectionEnd = offsetToEditorPosition(context.sourceText, context.selectionEndOffset);

  const enclosing = getEnclosingTags(tagContext, selectionStart, selectionEnd);
  const interior = getTagsInRange(tagContext, selectionStart.ch, selectionEnd.ch);

  // Dedupe by detected-tag identity (object reference).
  const allTags = Array.from(new Set([...enclosing, ...interior]));
  const replacements: TextReplacement[] = [];

  for (const tag of allTags) {
    const range = detectedTagToOffsets(context.sourceText, tag);
    if (!range) continue;
    replacements.push({ fromOffset: range.closeStart, toOffset: range.closeEnd, replacementText: '' });
    replacements.push({ fromOffset: range.openStart, toOffset: range.openEnd, replacementText: '' });
  }

  // Line-prefix removal: any line whose start lies inside the selection.
  replacements.push(...buildLinePrefixRemovals(context));

  // Underscore-italic (`_text_`) — detection-engine doesn't recognise this MD form, so handle it here.
  replacements.push(...buildUnderscoreItalicRemovals(context));

  return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: replacements.length === 0 };
}

/** Locates `_..._` pairs (asymmetric MD italic) inside the selection and emits delimiter deletions. */
function buildUnderscoreItalicRemovals(context: StylingContext): TextReplacement[] {
  const replacements: TextReplacement[] = [];
  const text = context.sourceText.slice(context.selectionStartOffset, context.selectionEndOffset);
  // Match `_word_` style pairs (no whitespace adjacent to underscores).
  const pattern = /(?<![A-Za-z0-9_])_([^_\n]+?)_(?![A-Za-z0-9_])/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const openOffset = context.selectionStartOffset + match.index;
    const closeOffset = openOffset + match[0].length - 1;
    replacements.push({ fromOffset: closeOffset, toOffset: closeOffset + 1, replacementText: '' });
    replacements.push({ fromOffset: openOffset, toOffset: openOffset + 1, replacementText: '' });
  }
  return replacements;
}

function buildLinePrefixRemovals(context: StylingContext): TextReplacement[] {
  const replacements: TextReplacement[] = [];
  const startBounds = lineBoundsAt(context.sourceText, context.selectionStartOffset);

  // Walk all lines whose lineStart is within selection.
  let cursor = startBounds.lineStart;
  while (cursor <= context.selectionEndOffset && cursor <= context.sourceText.length) {
    const bounds = lineBoundsAt(context.sourceText, cursor);
    const lineText = context.sourceText.slice(bounds.lineStart, bounds.lineEnd);
    for (const pattern of LINE_PREFIX_PATTERNS) {
      const match = pattern.exec(lineText);
      if (match) {
        replacements.push({
          fromOffset: bounds.lineStart, toOffset: bounds.lineStart + match[0].length, replacementText: '',
        });
        break;
      }
    }
    if (bounds.lineEnd >= context.sourceText.length) break;
    cursor = bounds.lineEnd + 1;
  }

  return replacements;
}
