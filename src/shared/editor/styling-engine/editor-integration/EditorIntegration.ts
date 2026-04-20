import type { StylingContext, StylingResult, ObsidianEditor } from '../interfaces';

import { buildTextIndex, positionToOffset, offsetToPosition } from '../../text-offset/TextOffset';

// ============================================================
// Context Building
// ============================================================

/**
 * Builds a StylingContext from the current state of an Obsidian Editor.
 * Extracts source text, cursor/selection positions, and converts them
 * to flat offsets for the styling engine's pure functions.
 * Returns null only if something is fundamentally wrong (in practice, always returns a context).
 */
export function buildStylingContextFromEditor(editor: ObsidianEditor): StylingContext | null {
  const sourceText = editor.getValue();

  const textIndex = buildTextIndex(sourceText);

  const cursorFrom = editor.getCursor('from');
  const cursorTo = editor.getCursor('to');

  const fromOffset = positionToOffset(cursorFrom, textIndex);
  const toOffset = positionToOffset(cursorTo, textIndex);

  // Normalize so selectionStartOffset is always <= selectionEndOffset
  const selectionStartOffset = Math.min(fromOffset, toOffset);
  const selectionEndOffset = Math.max(fromOffset, toOffset);

  const selectedText = sourceText.slice(selectionStartOffset, selectionEndOffset);

  return {
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    selectedText,
  };
}

// ============================================================
// Result Application
// ============================================================

/**
 * Applies a StylingResult to an Obsidian Editor by converting offset-based
 * replacements into position-based transaction changes.
 * All changes are applied atomically via editor.transaction() for single-undo behavior.
 */
export function applyStylingResult(
  editor: ObsidianEditor,
  sourceText: string,
  result: StylingResult
): void {
  if (result.isNoOp || result.replacements.length === 0) {
    return;
  }

  const textIndex = buildTextIndex(sourceText);

  // Convert each TextReplacement (offset-based) to a transaction change (position-based)
  const changes = result.replacements.map((replacement) => ({
    from: offsetToPosition(replacement.fromOffset, textIndex),
    to: offsetToPosition(replacement.toOffset, textIndex),
    text: replacement.replacementText,
  }));

  // Apply all changes atomically — one Ctrl+Z undoes everything
  editor.transaction({ changes });

  // Set cursor/selection if the styling result specifies new positions
  if (result.newSelectionStart !== undefined && result.newSelectionEnd !== undefined) {
    const newSourceText = editor.getValue();
    const newTextIndex = buildTextIndex(newSourceText);

    const newStartPosition = offsetToPosition(result.newSelectionStart, newTextIndex);
    const newEndPosition = offsetToPosition(result.newSelectionEnd, newTextIndex);

    if (result.newSelectionStart === result.newSelectionEnd) {
      editor.setCursor(newStartPosition);
    } else {
      editor.setSelection(newStartPosition, newEndPosition);
    }
  }
}
