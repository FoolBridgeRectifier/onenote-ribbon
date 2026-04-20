import type { Editor } from 'obsidian';
import {
  addTagInEditor,
  removeTagInEditor,
  toggleTagInEditor,
} from '../../../../shared/editor/styling-engine/editor-integration/helpers';
import { HIGHLIGHT_MD_TAG } from '../../../../shared/editor/styling-engine/constants';
import { buildSpanTagDefinition } from '../../../../shared/editor/styling-engine/tag-manipulation/TagManipulation';
import type { HighlightEditorState } from './interfaces';
import { DEFAULT_HIGHLIGHT_COLOR } from './constants';

/** Removes the background-color span for the currently active highlight, if present. */
export function removeBackgroundSpanIfPresent(editor: Editor, highlightColor: string | null): void {
  if (highlightColor) {
    removeTagInEditor(editor, buildSpanTagDefinition('background', highlightColor));
  }
}

/** Handles the main highlight button click: toggles highlight using last-used color. */
export function applyHighlightClick(
  editor: Editor,
  editorState: HighlightEditorState,
  lastHighlightColor: string
): void {
  if (lastHighlightColor === DEFAULT_HIGHLIGHT_COLOR) {
    removeBackgroundSpanIfPresent(editor, editorState.highlightColor);
    toggleTagInEditor(editor, HIGHLIGHT_MD_TAG);
  } else if (editorState.highlightColor === lastHighlightColor) {
    removeTagInEditor(editor, buildSpanTagDefinition('background', lastHighlightColor));
  } else {
    removeTagInEditor(editor, HIGHLIGHT_MD_TAG);
    if (editorState.highlightColor) {
      removeTagInEditor(editor, buildSpanTagDefinition('background', editorState.highlightColor));
    }
    addTagInEditor(editor, buildSpanTagDefinition('background', lastHighlightColor));
  }
}

/** Handles selecting a new highlight color from the picker. */
export function applyHighlightColorSelect(editor: Editor, color: string): void {
  removeTagInEditor(editor, HIGHLIGHT_MD_TAG);
  addTagInEditor(editor, buildSpanTagDefinition('background', color));
}

/** Handles the "no color" button in the highlight picker: clears all highlight. */
export function applyHighlightNoColor(editor: Editor, highlightColor: string | null): void {
  removeTagInEditor(editor, HIGHLIGHT_MD_TAG);
  if (highlightColor) {
    removeTagInEditor(editor, buildSpanTagDefinition('background', highlightColor));
  }
}

/** Handles the font color button click: applies the last-used color. */
export function applyFontColorClick(editor: Editor, lastFontColor: string): void {
  addTagInEditor(editor, buildSpanTagDefinition('color', lastFontColor));
}

/** Handles selecting a new font color from the picker. */
export function applyFontColorSelect(editor: Editor, color: string): void {
  addTagInEditor(editor, buildSpanTagDefinition('color', color));
}

/** Handles the "no color" button in the font color picker: removes the color span. */
export function applyFontColorNoColor(editor: Editor, fontColor: string | null): void {
  if (fontColor) {
    removeTagInEditor(editor, buildSpanTagDefinition('color', fontColor));
  }
}
