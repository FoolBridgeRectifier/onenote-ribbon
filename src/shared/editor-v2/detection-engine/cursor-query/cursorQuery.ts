import type { EditorPosition } from 'obsidian';
import type { TagContext, ActiveTagsResult, DetectedTag } from '../interfaces';

/**
 * Computes which tags enclose `cursorPosition` and which line-level tag is
 * active on the cursor's line. `enclosingTags` lists every paired tag whose
 * range contains the cursor; `lineTag` is the prefix tag on the cursor line.
 *
 * `insertionFormat` reflects the formatting domain at the cursor — `html` if
 * any enclosing tag is HTML, otherwise `markdown`.
 */
export function getActiveTagsAtCursorFromContext(
  context: TagContext,
  cursorPosition: EditorPosition,
): ActiveTagsResult {
  const lineEndCh = computeEndOfLineCh(context.content, cursorPosition.line);

  // Inert zone short-circuit: a cursor inside an inert line returns nothing.
  if (lineEndCh === null) return { enclosingTags: [], lineTag: null, insertionFormat: 'markdown' };

  const enclosingTags = context.tags.filter((tag) => isTagEnclosingCursor(tag, cursorPosition, lineEndCh));

  // Line prefix tag: prefer one with `open` on this line; fall back to a content-scan for meetingDetails.
  const lineTag =
    context.tags.find((tag) => isLinePrefixTagOnLine(tag, cursorPosition.line)) ??
    findMeetingDetailsLineTag(context, cursorPosition.line);

  const insertionFormat: 'markdown' | 'html' = enclosingTags.some((tag) => tag.isHTML) ? 'html' : 'markdown';

  return { enclosingTags, lineTag, insertionFormat };
}

/** Returns the column past the last character of `lineIndex`, or null if the line is missing. */
function computeEndOfLineCh(content: string, lineIndex: number): number | null {
  const lines = content.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) return null;
  return lines[lineIndex].length;
}

/**
 * A paired tag (open + close) encloses `cursor` when the cursor sits between
 * open.start and close.end. close.end is treated as exclusive in general but
 * inclusive when the cursor is at the very end of its line — so caret-at-EOL
 * still counts as "inside" the trailing tag for muscle-memory toggles.
 *
 * Code tags are excluded (invariant I3 — content inside code is inert).
 */
function isTagEnclosingCursor(tag: DetectedTag, cursor: EditorPosition, lineEndCh: number): boolean {
  if (!tag.open || !tag.close) return false;
  if (tag.type === 'code') return false;
  if (tag.open.start.line !== cursor.line) return false;
  if (tag.close.end.line !== cursor.line) return false;
  if (cursor.ch < tag.open.start.ch) return false;
  if (cursor.ch > tag.close.end.ch) return false;
  // Boundary: cursor exactly at close.end is "inside" only when at end-of-line.
  if (cursor.ch === tag.close.end.ch && cursor.ch !== lineEndCh) return false;
  return true;
}

/** A tag is the line-prefix tag on `lineIndex` when it has open but no close on that line. */
function isLinePrefixTagOnLine(tag: DetectedTag, lineIndex: number): boolean {
  if (tag.close) return false;
  if (!tag.open) return false;
  return tag.open.start.line === lineIndex;
}

/**
 * `meetingDetails` tags carry no `open`/`close` per the spec, so we cannot locate
 * them via tag positions. Re-scan the line text directly to know whether the
 * cursor's line is the meeting-details opener.
 */
function findMeetingDetailsLineTag(context: TagContext, lineIndex: number): DetectedTag | null {
  const line = context.content.split('\n')[lineIndex] ?? '';
  if (!/^>\s*---\s*$/.test(line)) return null;
  const meetingTag = context.tags.find((tag) => tag.type === 'meetingDetails');
  return meetingTag ?? null;
}
