import type { EditorPosition } from 'obsidian';
import type { TagContext, ActiveTagsResult, DetectedTag } from './interfaces';

/**
 * Scans the full document content and returns a TagContext containing all detected tags
 * ordered by open.start position, plus all protected ranges (wikilinks, embeds, MD links).
 *
 * Inert zones (fenced code blocks, math blocks, tab-indented lines) are skipped entirely.
 * Call once on load and again after any debounced content change (see DETECTION_DEBOUNCE_MS).
 */
export function buildTagContext(_content: string): TagContext {
  throw new Error('not implemented');
}

/**
 * Returns all closing tags that enclose the given cursor position
 * (open.start ≤ cursor ≤ close.end) plus the line-level tag on the cursor line, if any.
 *
 * Use this result to determine which toolbar buttons appear active in the UI.
 */
export function getActiveTagsAtCursor(
  _context: TagContext,
  _cursorPosition: EditorPosition
): ActiveTagsResult {
  throw new Error('not implemented');
}

/**
 * Returns all tags whose range fully covers the selection [selectionStart, selectionEnd]:
 * the tag must satisfy open.start ≤ selectionStart AND close.end ≥ selectionEnd.
 *
 * Used by the styling engine to decide whether a toggleTag call goes to the remove path.
 */
export function getEnclosingTags(
  _context: TagContext,
  _selectionStart: EditorPosition,
  _selectionEnd: EditorPosition
): DetectedTag[] {
  throw new Error('not implemented');
}
