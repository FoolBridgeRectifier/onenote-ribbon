import type {
  TagDefinition,
  CopiedFormat,
  RemoveAllTagsOptions,
  ObsidianEditor,
} from '../interfaces';

import { toggleTag, addTag, removeTag, removeAllTags, copyFormat } from '../stylingEngine';

import { buildStylingContextFromEditor, applyStylingResult } from './EditorIntegration';

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
