import type { EditorPosition } from 'obsidian';
import type { TagContext, ActiveTagsResult, DetectedTag } from './interfaces';
import { buildTagContextFromContent } from './tag-context-builder/tagContextBuilder';
import { getActiveTagsAtCursorFromContext } from './cursor-query/cursorQuery';
import { getEnclosingTagsFromContext, getTagsInRangeFromContext } from './range-query/rangeQuery';

/**
 * Scans the full document content and returns a TagContext containing all
 * detected tags ordered by open.start position, plus all protected ranges.
 *
 * Inert zones (fenced code, math, tab-indented lines) are skipped entirely.
 * Call once on load and again after any debounced content change.
 */
export function buildTagContext(content: string): TagContext {
  return buildTagContextFromContent(content);
}

/**
 * Returns all paired tags whose range encloses the given cursor position,
 * plus the line-level prefix tag on the cursor's line, if any.
 */
export function getActiveTagsAtCursor(
  context: TagContext,
  cursorPosition: EditorPosition,
): ActiveTagsResult {
  return getActiveTagsAtCursorFromContext(context, cursorPosition);
}

/**
 * Returns all paired tags fully contained within the given character range
 * [startCh, endCh] on a single line.
 */
export function getTagsInRange(
  context: TagContext,
  startCh: number,
  endCh: number,
): DetectedTag[] {
  return getTagsInRangeFromContext(context, startCh, endCh);
}

/**
 * Returns all paired tags whose range fully covers the selection
 * [selectionStart, selectionEnd]. Multi-line selections always return [].
 */
export function getEnclosingTags(
  context: TagContext,
  selectionStart: EditorPosition,
  selectionEnd: EditorPosition,
): DetectedTag[] {
  return getEnclosingTagsFromContext(context, selectionStart, selectionEnd);
}
