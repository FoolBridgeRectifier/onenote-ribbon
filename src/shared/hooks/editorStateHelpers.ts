import type { App } from 'obsidian';
import type { EnclosingHtmlTagFinder } from '../editor/enclosing-html-tags/enclosingHtmlTags';
import { createEnclosingHtmlTagFinder } from '../editor/enclosing-html-tags/enclosingHtmlTags';
import { detectActiveTagKeys } from '../editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
import type { EditorState } from './interfaces';
import { TAG_NAME_TO_STATE_FIELD } from './constants';
import { extractSpanAndDivState } from './spanState';

export { extractSpanAndDivState } from './spanState';

export function buildDefaultState(app: App): EditorState {
  // eslint-disable-next-line strict-structure/no-double-cast -- Obsidian's public types don't expose `getConfig` on Vault; internal API required
  const vault = app.vault as unknown as { getConfig: (key: string) => string & number };
  return {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    highlight: false,
    subscript: false,
    superscript: false,
    bulletList: false,
    numberedList: false,
    headLevel: 0,
    fontFamily: vault.getConfig('fontText') ?? 'default',
    fontSize: String(vault.getConfig('baseFontSize') ?? 16),
    textAlign: 'left',
    fontColor: null,
    highlightColor: null,
    activeTagKeys: new Set<string>(),
  };
}

/**
 * Derives a full EditorState from the current cursor/selection context.
 * Boolean flags come from enclosing tags; line-level state uses line-prefix regex.
 */
export function deriveEditorState(
  app: App,
  cachedFinder: EnclosingHtmlTagFinder | null,
  cachedSourceText: string | null
): EditorState {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return buildDefaultState(app);

  const sourceText = editor.getValue();
  const cursor = editor.getCursor();

  const finder =
    cachedFinder && cachedSourceText === sourceText
      ? cachedFinder
      : createEnclosingHtmlTagFinder(sourceText);

  const location = { cursorPosition: { line: cursor.line, ch: cursor.ch } };
  const enclosingTagRanges = finder.getEnclosingTagRanges(location);

  const state = buildDefaultState(app);

  for (let rangeIndex = 0; rangeIndex < enclosingTagRanges.length; rangeIndex += 1) {
    const tagRange = enclosingTagRanges[rangeIndex];
    const stateField = TAG_NAME_TO_STATE_FIELD[tagRange.tagName];

    if (stateField) {
      const booleanFields: (keyof EditorState)[] = [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'highlight',
        'subscript',
        'superscript',
        'bulletList',
        'numberedList',
      ];
      if (booleanFields.includes(stateField)) {
        // eslint-disable-next-line strict-structure/no-double-cast -- index EditorState by computed key; no mapped-type alternative without changing EditorState definition
        (state as unknown as Record<string, boolean>)[stateField] = true;
      }
    }
  }

  const spanState = extractSpanAndDivState(
    enclosingTagRanges,
    sourceText,
    state.fontFamily,
    state.fontSize
  );
  state.fontColor = spanState.fontColor;
  state.highlightColor = spanState.highlightColor;
  state.fontFamily = spanState.fontFamily;
  state.fontSize = spanState.fontSize;
  state.textAlign = spanState.textAlign;

  // If we found a background span, also set highlight = true
  if (spanState.highlightColor !== null) state.highlight = true;

  const activeLine = editor.getLine(cursor.line);
  if (activeLine) {
    state.bulletList = /^\s*[-*+]\s/.test(activeLine);
    state.numberedList = /^\s*\d+\.\s/.test(activeLine);
    const headMatch = activeLine.match(/^(#{1,6})\s/);
    if (headMatch) state.headLevel = headMatch[1].length;
  }

  // Detect active tag keys for the current cursor position
  state.activeTagKeys = detectActiveTagKeys(editor);

  return state;
}
