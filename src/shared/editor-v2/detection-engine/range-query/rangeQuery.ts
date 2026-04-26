import type { EditorPosition } from 'obsidian';
import type { TagContext, DetectedTag } from '../interfaces';

/**
 * Returns every paired inline tag whose range fully covers the selection
 * [`selectionStart`, `selectionEnd`]. Inline tags are single-line, so
 * multi-line selections always return [].
 */
export function getEnclosingTagsFromContext(
  context: TagContext,
  selectionStart: EditorPosition,
  selectionEnd: EditorPosition,
): DetectedTag[] {
  if (selectionStart.line !== selectionEnd.line) return [];

  return context.tags.filter((tag) => isTagEnclosingRange(tag, selectionStart, selectionEnd));
}

function isTagEnclosingRange(tag: DetectedTag, selectionStart: EditorPosition, selectionEnd: EditorPosition): boolean {
  if (!tag.open || !tag.close) return false;
  if (tag.open.start.line !== selectionStart.line) return false;
  if (tag.close.end.line !== selectionStart.line) return false;
  if (tag.open.start.ch > selectionStart.ch) return false;
  if (tag.close.end.ch < selectionEnd.ch) return false;
  return true;
}

/**
 * Returns every paired inline tag fully contained within [startCh, endCh] on
 * a single line. Zero-range queries (startCh === endCh) return no tags.
 */
export function getTagsInRangeFromContext(
  context: TagContext,
  startCh: number,
  endCh: number,
): DetectedTag[] {
  if (startCh === endCh) return [];
  return context.tags.filter((tag) => isTagInsideRange(tag, startCh, endCh));
}

function isTagInsideRange(tag: DetectedTag, startCh: number, endCh: number): boolean {
  if (!tag.open || !tag.close) return false;
  if (tag.open.start.ch < startCh) return false;
  if (tag.close.end.ch > endCh) return false;
  return true;
}
