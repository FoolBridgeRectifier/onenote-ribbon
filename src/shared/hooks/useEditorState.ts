import { useEffect, useRef, useState } from 'react';
import type { App } from 'obsidian';
import type { EditorState, CachedFinderData } from './interfaces';
import { CONTENT_CHANGE_DEBOUNCE_MS, SELECTION_CHANGE_THROTTLE_MS } from './constants';
import { deriveEditorState, buildDefaultState } from './editorStateHelpers';

export type { EditorState };
export { extractSpanAndDivState, deriveEditorState } from './editorStateHelpers';

export function useEditorState(app: App): EditorState {
  const [editorState, setEditorState] = useState<EditorState>(() => buildDefaultState(app));
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
        // Content changed � rebuild finder and debounce the state update
        const newFinder = createEnclosingHtmlTagFinder(currentSourceText);
        cachedFinderRef.current = { sourceText: currentSourceText, finder: newFinder };

        if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          setEditorState(
            deriveEditorState(
              app,
              cachedFinderRef.current?.finder ?? null,
              cachedFinderRef.current?.sourceText ?? null
            )
          );
        }, CONTENT_CHANGE_DEBOUNCE_MS);
      } else {
        // Cursor-only move � reuse cached finder, compute immediately
        setEditorState(deriveEditorState(app, cached.finder, cached.sourceText));
      }
    };

    // Throttled for selectionchange which fires very frequently during drag-to-select
    const throttledUpdateState = () => {
      if (selectionThrottleTimerRef.current !== null) return;
      selectionThrottleTimerRef.current = setTimeout(() => {
        selectionThrottleTimerRef.current = null;
        updateState();
      }, SELECTION_CHANGE_THROTTLE_MS);
    };

    const leafChangeRef = app.workspace.on('active-leaf-change', updateState);
    const editorChangeRef = app.workspace.on('editor-change', updateState);
    document.addEventListener('selectionchange', throttledUpdateState);
    updateState();

    return () => {
      app.workspace.offref(leafChangeRef);
      app.workspace.offref(editorChangeRef);
      document.removeEventListener('selectionchange', throttledUpdateState);
      if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);
      if (selectionThrottleTimerRef.current !== null)
        clearTimeout(selectionThrottleTimerRef.current);
    };
  }, [app]);

  return editorState;
}
