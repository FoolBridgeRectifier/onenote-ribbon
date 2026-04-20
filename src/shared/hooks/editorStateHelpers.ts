import type { App } from 'obsidian';
import type {
  HtmlTagRange,
  EnclosingHtmlTagFinder,
} from '../editor/enclosing-html-tags/EnclosingHtmlTags';
import { createEnclosingHtmlTagFinder } from '../editor/enclosing-html-tags/EnclosingHtmlTags';
import {
  extractStylePropertyFromOpeningTag,
  extractAllStyleProperties,
} from '../editor/styling-engine/tag-manipulation/style-parsing/StyleParsing';
import type { EditorState } from './interfaces';
import { TAG_NAME_TO_STATE_FIELD, VALID_TEXT_ALIGN_VALUES } from './constants';

export function buildDefaultState(app: App): EditorState {
  // Obsidian's public types don't expose `getConfig` on Vault — cast required
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
  };
}

/**
 * Extracts span/div-based state fields (fontColor, highlightColor, fontFamily, fontSize, textAlign)
 * from a list of enclosing tag ranges by inspecting their opening tag text.
 */
export function extractSpanAndDivState(
  enclosingTagRanges: HtmlTagRange[],
  sourceText: string,
  defaultFontFamily: string,
  defaultFontSize: string
): {
  fontColor: string | null;
  highlightColor: string | null;
  fontFamily: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
} {
  let fontColor: string | null = null;
  let highlightColor: string | null = null;
  let fontFamily = defaultFontFamily;
  let fontSize = defaultFontSize;
  let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';

  for (let rangeIndex = 0; rangeIndex < enclosingTagRanges.length; rangeIndex += 1) {
    const tagRange = enclosingTagRanges[rangeIndex];

    if (tagRange.tagName === 'span') {
      const openingTagText = sourceText.slice(
        tagRange.openingTagStartOffset,
        tagRange.openingTagEndOffset
      );
      const allProperties = extractAllStyleProperties(openingTagText);

      for (let propertyIndex = 0; propertyIndex < allProperties.length; propertyIndex += 1) {
        const styleProperty = allProperties[propertyIndex];

        if (styleProperty.propertyName === 'color') {
          fontColor = styleProperty.propertyValue;
        } else if (styleProperty.propertyName === 'background') {
          highlightColor = styleProperty.propertyValue;
        } else if (styleProperty.propertyName === 'font-family') {
          fontFamily = styleProperty.propertyValue.replace(/'/g, '');
        } else if (styleProperty.propertyName === 'font-size') {
          fontSize = styleProperty.propertyValue.replace('pt', '');
        } else if (styleProperty.propertyName === 'text-align') {
          if (VALID_TEXT_ALIGN_VALUES.has(styleProperty.propertyValue)) {
            textAlign = styleProperty.propertyValue as 'left' | 'center' | 'right' | 'justify';
          }
        }
      }

      // Legacy: detect text-align from <div> tags for backward compatibility
    } else if (tagRange.tagName === 'div') {
      const openingTagText = sourceText.slice(
        tagRange.openingTagStartOffset,
        tagRange.openingTagEndOffset
      );
      const styleProperty = extractStylePropertyFromOpeningTag(openingTagText);

      if (styleProperty && styleProperty.propertyName === 'text-align') {
        const alignValue = styleProperty.propertyValue;
        if (VALID_TEXT_ALIGN_VALUES.has(alignValue)) {
          textAlign = alignValue as 'left' | 'center' | 'right' | 'justify';
        }
      }
    }
  }

  return { fontColor, highlightColor, fontFamily, fontSize, textAlign };
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

  return state;
}
