import type { StylingContext, StylingResult } from '../interfaces';
import type { ObsidianEditor } from './interfaces';

/**
 * Builds a v2 {@link StylingContext} from the current Obsidian Editor state.
 * Pure offset arithmetic — no editor mutation.
 */
export function buildStylingContextFromEditor(editor: ObsidianEditor): StylingContext {
  const sourceText = editor.getValue();
  const cursorFrom = editor.getCursor('from');
  const cursorTo = editor.getCursor('to');

  const fromOffset = positionToOffset(sourceText, cursorFrom);
  const toOffset   = positionToOffset(sourceText, cursorTo);

  // Normalise so the start offset is always less-or-equal to the end offset.
  const selectionStartOffset = Math.min(fromOffset, toOffset);
  const selectionEndOffset   = Math.max(fromOffset, toOffset);

  return { sourceText, selectionStartOffset, selectionEndOffset };
}

/**
 * Applies a v2 {@link StylingResult} as an atomic Obsidian transaction so a single Ctrl+Z undoes everything.
 */
export function applyStylingResult(editor: ObsidianEditor, sourceText: string, result: StylingResult): void {
  if (result.isNoOp || result.replacements.length === 0) return;

  const changes = result.replacements.map((replacement) => ({
    from: offsetToPosition(sourceText, replacement.fromOffset),
    to:   offsetToPosition(sourceText, replacement.toOffset),
    text: replacement.replacementText,
  }));

  editor.transaction({ changes });
}

/** Converts an absolute string offset to an `{line, ch}` editor position. */
function offsetToPosition(sourceText: string, offset: number): { line: number; ch: number } {
  let line = 0;
  let lineStart = 0;
  for (let cursor = 0; cursor < offset && cursor < sourceText.length; cursor++) {
    if (sourceText[cursor] === '\n') { line++; lineStart = cursor + 1; }
  }
  return { line, ch: offset - lineStart };
}

/** Converts an `{line, ch}` editor position back to an absolute string offset. */
function positionToOffset(sourceText: string, position: { line: number; ch: number }): number {
  let line = 0;
  let cursor = 0;
  while (cursor < sourceText.length && line < position.line) {
    if (sourceText[cursor] === '\n') line++;
    cursor++;
  }
  return cursor + position.ch;
}
