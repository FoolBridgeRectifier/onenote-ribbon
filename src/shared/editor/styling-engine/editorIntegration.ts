import {
  StylingContext,
  StylingResult,
  TagDefinition,
  CopiedFormat,
  RemoveAllTagsOptions,
} from './interfaces';

import { toggleTag, addTag, removeTag, removeAllTags, copyFormat } from './stylingEngine';

import { buildTextIndex, positionToOffset, offsetToPosition } from '../text-offset/textOffset';

// ============================================================
// Editor Interface
// ============================================================

/**
 * Minimal subset of the Obsidian Editor API used by this module.
 * The real Obsidian Editor satisfies this interface via structural typing.
 * Tests can provide a compatible mock without extending the full Editor class.
 */
export interface ObsidianEditor {
  getValue(): string;
  getCursor(which?: 'from' | 'to' | 'head' | 'anchor'): { line: number; ch: number };
  setCursor(position: { line: number; ch: number }): void;
  setSelection(anchor: { line: number; ch: number }, head: { line: number; ch: number }): void;
  transaction(spec: {
    changes: Array<{
      from: { line: number; ch: number };
      to: { line: number; ch: number };
      text: string;
    }>;
  }): void;
}

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

// ============================================================
// Convenience Wrappers
// ============================================================

/**
 * Toggles a formatting tag on or off for the current editor selection.
 * If the tag is present, removes it. If absent, adds it.
 */
export function toggleTagInEditor(editor: ObsidianEditor, tagDefinition: TagDefinition): void {
  const context = buildStylingContextFromEditor(editor);

  if (context === null) {
    return;
  }

  const result = toggleTag(context, tagDefinition);
  applyStylingResult(editor, context.sourceText, result);
}

/**
 * Adds a formatting tag to the current editor selection (never removes).
 * For span tags with the same CSS property, replaces the value instead of double-wrapping.
 */
export function addTagInEditor(editor: ObsidianEditor, tagDefinition: TagDefinition): void {
  const context = buildStylingContextFromEditor(editor);

  if (context === null) {
    return;
  }

  const result = addTag(context, tagDefinition);
  applyStylingResult(editor, context.sourceText, result);
}

/**
 * Removes a specific formatting tag from around the current editor selection.
 */
export function removeTagInEditor(editor: ObsidianEditor, tagDefinition: TagDefinition): void {
  const context = buildStylingContextFromEditor(editor);

  if (context === null) {
    return;
  }

  const result = removeTag(context, tagDefinition);
  applyStylingResult(editor, context.sourceText, result);
}

/**
 * Removes all formatting tags from around the current editor selection.
 */
export function removeAllTagsInEditor(
  editor: ObsidianEditor,
  options?: RemoveAllTagsOptions
): void {
  const context = buildStylingContextFromEditor(editor);

  if (context === null) {
    return;
  }

  const result = removeAllTags(context, options);
  applyStylingResult(editor, context.sourceText, result);
}

/**
 * Copies the formatting context at the current editor selection.
 * Returns the enclosing tag definitions and detected domain for later use with addTagInEditor.
 * Returns null if the editor context cannot be built.
 */
export function copyFormatFromEditor(editor: ObsidianEditor): CopiedFormat | null {
  const context = buildStylingContextFromEditor(editor);

  if (context === null) {
    return null;
  }

  return copyFormat(context.sourceText, context.selectionStartOffset, context.selectionEndOffset);
}
