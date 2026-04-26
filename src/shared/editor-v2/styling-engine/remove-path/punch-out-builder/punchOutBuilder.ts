import type { TextReplacement } from '../../interfaces';
import type { TagOffsetRange } from '../interfaces';

/**
 * Builds replacements that "remove" a tag from a selection range.
 * Three cases:
 *   1. Selection covers entire content (or wraps the delimiters) → delete open + close entirely.
 *   2. Selection ends exactly at close.start → move close to selection.start (delete original close).
 *   3. Selection starts exactly at open.end → move open to selection.end (delete original open).
 *   4. True interior punch-out → insert close at sel.start, insert open at sel.end.
 *
 * Replacements returned in DOM order; caller is responsible for sorting.
 */
export function buildPunchOutOrFullRemoveReplacements(
  selectionStart: number,
  selectionEnd: number,
  tagRange: TagOffsetRange,
  openText: string,
  closeText: string,
): TextReplacement[] {
  const contentStart = tagRange.openEnd;
  const contentEnd = tagRange.closeStart;
  const coversFullContent = selectionStart <= contentStart && selectionEnd >= contentEnd;

  if (coversFullContent) {
    // Full removal: delete close first (later offset), then open.
    return [
      { fromOffset: tagRange.closeStart, toOffset: tagRange.closeEnd, replacementText: '' },
      { fromOffset: tagRange.openStart, toOffset: tagRange.openEnd, replacementText: '' },
    ];
  }

  const replacements: TextReplacement[] = [];
  const startsAtContentStart = selectionStart <= contentStart;
  const endsAtContentEnd = selectionEnd >= contentEnd;

  if (endsAtContentEnd) {
    // Move close to selection.start. (Selection grabs trailing portion.)
    replacements.push({ fromOffset: tagRange.closeStart, toOffset: tagRange.closeEnd, replacementText: '' });
    replacements.push({ fromOffset: selectionStart, toOffset: selectionStart, replacementText: closeText });
  } else if (startsAtContentStart) {
    // Move open to selection.end. (Selection grabs leading portion.)
    replacements.push({ fromOffset: selectionEnd, toOffset: selectionEnd, replacementText: openText });
    replacements.push({ fromOffset: tagRange.openStart, toOffset: tagRange.openEnd, replacementText: '' });
  } else {
    // True interior punch-out: split the tag into [open..selStart] [selEnd..close].
    replacements.push({ fromOffset: selectionEnd, toOffset: selectionEnd, replacementText: openText });
    replacements.push({ fromOffset: selectionStart, toOffset: selectionStart, replacementText: closeText });
  }

  return replacements;
}
