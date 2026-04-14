import { useEffect, useRef, useState } from 'react';
import { App } from 'obsidian';
import {
  createEnclosingHtmlTagFinder,
  EnclosingHtmlTagFinder,
  HtmlTagRange,
} from '../editor/enclosing-html-tags/enclosingHtmlTags';
import {
  extractStylePropertyFromOpeningTag,
  extractAllStyleProperties,
} from '../editor/styling-engine/tagManipulation';

export interface EditorState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  highlight: boolean;
  subscript: boolean;
  superscript: boolean;
  bulletList: boolean;
  numberedList: boolean;
  headLevel: number;
  fontFamily: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontColor: string | null;
  highlightColor: string | null;
}

// Maps tag names (both MD and HTML) to the EditorState boolean field they represent.
const TAG_NAME_TO_STATE_FIELD: Record<string, keyof EditorState> = {
  bold: 'bold',
  b: 'bold',
  italic: 'italic',
  i: 'italic',
  u: 'underline',
  strikethrough: 'strikethrough',
  s: 'strikethrough',
  highlight: 'highlight',
  mark: 'highlight',
  sub: 'subscript',
  sup: 'superscript',
};

const VALID_TEXT_ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify']);

const CONTENT_CHANGE_DEBOUNCE_MS = 60;
const SELECTION_CHANGE_THROTTLE_MS = 80;

function buildDefaultState(app: App): EditorState {
  // Obsidian's public types don't expose `getConfig` on Vault — cast required
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
    fontFamily: (app.vault as any).getConfig('fontText') ?? 'default',
    fontSize: String((app.vault as any).getConfig('baseFontSize') ?? 16),
    textAlign: 'left',
    fontColor: null,
    highlightColor: null,
  };
}

/**
 * Extracts span-based state fields (fontColor, highlightColor, fontFamily, fontSize, textAlign)
 * from a list of enclosing tag ranges by inspecting their opening tag text.
 */
export function extractSpanAndDivState(
  enclosingTagRanges: HtmlTagRange[],
  sourceText: string,
  defaultFontFamily: string,
  defaultFontSize: string,
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

  for (
    let rangeIndex = 0;
    rangeIndex < enclosingTagRanges.length;
    rangeIndex += 1
  ) {
    const tagRange = enclosingTagRanges[rangeIndex];

    if (tagRange.tagName === 'span') {
      const openingTagText = sourceText.slice(
        tagRange.openingTagStartOffset,
        tagRange.openingTagEndOffset,
      );

      // Use multi-property extraction to handle alignment spans
      // (e.g. <span style="display:inline-block;width:100%;vertical-align:top;text-align:center">) alongside
      // single-property formatting spans (e.g. <span style="color: red">).
      const allProperties = extractAllStyleProperties(openingTagText);

      for (
        let propertyIndex = 0;
        propertyIndex < allProperties.length;
        propertyIndex += 1
      ) {
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
        tagRange.openingTagEndOffset,
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
 *
 * Boolean formatting flags are determined by checking which tags enclose
 * the cursor via the engine's tag finder. Line-level state (bulletList,
 * numberedList, headLevel) uses line-based regex since those are line-prefix
 * structures.
 */
export function deriveEditorState(
  app: App,
  cachedFinder: EnclosingHtmlTagFinder | null,
  cachedSourceText: string | null,
): EditorState {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) {
    return buildDefaultState(app);
  }

  const sourceText = editor.getValue();
  const cursor = editor.getCursor();

  // Use cached finder if content hasn't changed, otherwise build new one
  const finder =
    cachedFinder && cachedSourceText === sourceText
      ? cachedFinder
      : createEnclosingHtmlTagFinder(sourceText);

  const location = { cursorPosition: { line: cursor.line, ch: cursor.ch } };
  const enclosingTagRanges = finder.getEnclosingTagRanges(location);

  // Initialize boolean state from enclosing tags
  const state = buildDefaultState(app);

  for (
    let rangeIndex = 0;
    rangeIndex < enclosingTagRanges.length;
    rangeIndex += 1
  ) {
    const tagRange = enclosingTagRanges[rangeIndex];
    const stateField = TAG_NAME_TO_STATE_FIELD[tagRange.tagName];

    if (stateField) {
      (state as any)[stateField] = true;
    }
  }

  // Extract span/div-based properties (reuse defaults already computed by buildDefaultState)
  const spanState = extractSpanAndDivState(
    enclosingTagRanges,
    sourceText,
    state.fontFamily,
    state.fontSize,
  );

  state.fontColor = spanState.fontColor;
  state.highlightColor = spanState.highlightColor;
  state.fontFamily = spanState.fontFamily;
  state.fontSize = spanState.fontSize;
  state.textAlign = spanState.textAlign;

  // If we found a background span, also set highlight = true
  if (spanState.highlightColor !== null) {
    state.highlight = true;
  }

  // Line-level detection (bullet, numbered, heading)
  const activeLine = editor.getLine(cursor.line);

  if (activeLine) {
    state.bulletList = /^\s*[-*+]\s/.test(activeLine);
    state.numberedList = /^\s*\d+\.\s/.test(activeLine);

    const headMatch = activeLine.match(/^(#{1,6})\s/);

    if (headMatch) {
      state.headLevel = headMatch[1].length;
    }
  }

  return state;
}

interface CachedFinderData {
  sourceText: string;
  finder: EnclosingHtmlTagFinder;
}

export function useEditorState(app: App): EditorState {
  const [editorState, setEditorState] = useState<EditorState>(() =>
    buildDefaultState(app),
  );

  const cachedFinderRef = useRef<CachedFinderData | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateState = () => {
      const editor = app.workspace.activeEditor?.editor;

      if (!editor) {
        setEditorState(buildDefaultState(app));
        return;
      }

      const currentSourceText = editor.getValue();
      const cached = cachedFinderRef.current;
      const contentChanged = !cached || cached.sourceText !== currentSourceText;

      if (contentChanged) {
        // Content changed — rebuild finder and debounce the state update
        const newFinder = createEnclosingHtmlTagFinder(currentSourceText);
        cachedFinderRef.current = {
          sourceText: currentSourceText,
          finder: newFinder,
        };

        if (debounceTimerRef.current !== null) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          setEditorState(
            deriveEditorState(
              app,
              cachedFinderRef.current?.finder ?? null,
              cachedFinderRef.current?.sourceText ?? null,
            ),
          );
        }, CONTENT_CHANGE_DEBOUNCE_MS);
      } else {
        // Cursor-only move — reuse cached finder, compute immediately
        setEditorState(
          deriveEditorState(app, cached.finder, cached.sourceText),
        );
      }
    };

    // Throttled version for selectionchange, which fires very frequently
    // during drag-to-select and arrow key holds
    const throttledUpdateState = () => {
      if (selectionThrottleTimerRef.current !== null) return;

      selectionThrottleTimerRef.current = setTimeout(() => {
        selectionThrottleTimerRef.current = null;
        updateState();
      }, SELECTION_CHANGE_THROTTLE_MS);
    };

    const leafChangeRef = app.workspace.on('active-leaf-change', updateState);
    const editorChangeRef = app.workspace.on('editor-change', updateState);

    // Detect cursor-only moves (clicks, arrow keys) that don't fire editor-change.
    // Throttled because selectionchange fires on every caret movement.
    document.addEventListener('selectionchange', throttledUpdateState);

    // Initial state derivation
    updateState();

    return () => {
      app.workspace.offref(leafChangeRef);
      app.workspace.offref(editorChangeRef);
      document.removeEventListener('selectionchange', throttledUpdateState);

      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }

      if (selectionThrottleTimerRef.current !== null) {
        clearTimeout(selectionThrottleTimerRef.current);
      }
    };
  }, [app]);

  return editorState;
}
