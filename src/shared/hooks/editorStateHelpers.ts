import type { App } from 'obsidian';
import type { TagContext } from '../editor-v2/detection-engine/interfaces';
import { buildTagContext, getActiveTagsAtCursor } from '../editor-v2/detection-engine/DetectionEngine';
import { detectActiveTagKeys } from '../editor-v2/styling-engine/editor-integration/detect-active-tag-keys/detectActiveTagKeys';
import { buildTextIndex } from '../editor/text-offset/TextOffset';
import type { EditorState } from './interfaces';
import { TAG_TYPE_TO_STATE_FIELD } from './constants';
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
 * Boolean flags come from the detection engine's enclosing tags;
 * line-level state uses line-prefix regex on the active line.
 */
export function deriveEditorState(
  app: App,
  cachedContext: TagContext | null,
  cachedSourceText: string | null
): EditorState {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return buildDefaultState(app);

  const sourceText = editor.getValue();
  const cursor = editor.getCursor();

  // Reuse the cached detection-engine context when the source text hasn't changed.
  const tagContext =
    cachedContext && cachedSourceText === sourceText
      ? cachedContext
      : buildTagContext(sourceText);

  const activeTagsResult = getActiveTagsAtCursor(tagContext, { line: cursor.line, ch: cursor.ch });
  const enclosingTags = activeTagsResult.enclosingTags;

  const state = buildDefaultState(app);

  // Set boolean state fields from the detection engine's TagType taxonomy.
  for (let tagIndex = 0; tagIndex < enclosingTags.length; tagIndex += 1) {
    const detectedTag = enclosingTags[tagIndex];
    const stateField = TAG_TYPE_TO_STATE_FIELD[detectedTag.type];

    if (stateField) {
      // eslint-disable-next-line strict-structure/no-double-cast -- index EditorState by computed key; no mapped-type alternative without changing EditorState definition
      (state as unknown as Record<string, boolean>)[stateField] = true;
    }
  }

  // Extract span/div style state via raw-text inspection of opening tags.
  const textIndex = buildTextIndex(sourceText);
  const cursorLineContent = editor.getLine(cursor.line) ?? '';

  const spanState = extractSpanAndDivState(
    enclosingTags,
    sourceText,
    textIndex,
    cursorLineContent,
    state.fontFamily,
    state.fontSize
  );
  state.fontColor = spanState.fontColor;
  state.highlightColor = spanState.highlightColor;
  state.fontFamily = spanState.fontFamily;
  state.fontSize = spanState.fontSize;
  state.textAlign = spanState.textAlign;

  // If we found a background span, also set highlight = true.
  if (spanState.highlightColor !== null) state.highlight = true;

  if (cursorLineContent) {
    state.bulletList = /^\s*[-*+]\s/.test(cursorLineContent);
    state.numberedList = /^\s*\d+\.\s/.test(cursorLineContent);
    const headMatch = cursorLineContent.match(/^(#{1,6})\s/);
    if (headMatch) state.headLevel = headMatch[1].length;
  }

  // Detect active tag keys for the current cursor position.
  state.activeTagKeys = detectActiveTagKeys(editor);

  return state;
}
