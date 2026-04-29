import { useEffect, useRef, useState } from 'react';
import type { App } from 'obsidian';
import type { EditorState, CachedTagContext } from './interfaces';
import { CONTENT_CHANGE_DEBOUNCE_MS } from './constants';
import { deriveEditorState, buildDefaultState } from './editorStateHelpers';
// TODO: restore buildTagContext import after engine refactor is complete

export type { EditorState };
export { extractSpanAndDivState, deriveEditorState } from './editorStateHelpers';

/** Returns true when both states are deeply equal (all primitive fields + activeTagKeys Set). */
function editorStatesEqual(a: EditorState, b: EditorState): boolean {
  if (a === b) return true;
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strikethrough === b.strikethrough &&
    a.highlight === b.highlight &&
    a.subscript === b.subscript &&
    a.superscript === b.superscript &&
    a.bulletList === b.bulletList &&
    a.numberedList === b.numberedList &&
    a.headLevel === b.headLevel &&
    a.fontFamily === b.fontFamily &&
    a.fontSize === b.fontSize &&
    a.textAlign === b.textAlign &&
    a.fontColor === b.fontColor &&
    a.highlightColor === b.highlightColor &&
    a.activeTagKeys.size === b.activeTagKeys.size &&
    [...a.activeTagKeys].every(key => b.activeTagKeys.has(key))
  );
}

export function useEditorState(app: App): EditorState {
  const [editorState, setEditorState] = useState<EditorState>(() => buildDefaultState(app));
  const editorStateRef = useRef<EditorState>(editorState);
  const cachedContextRef = useRef<CachedTagContext | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync with state so updateState can read the latest value without stale closure.
  editorStateRef.current = editorState;

  useEffect(() => {
    /** Only commit a state update when the derived state has actually changed. */
    const commitState = (next: EditorState) => {
      if (!editorStatesEqual(editorStateRef.current, next)) {
        editorStateRef.current = next;
        setEditorState(next);
      }
    };

    const updateState = () => {
      const editor = app.workspace.activeEditor?.editor;

      if (!editor) {
        commitState(buildDefaultState(app));
        return;
      }

      const currentSourceText = editor.getValue();
      const cached = cachedContextRef.current;
      const contentChanged = !cached || cached.sourceText !== currentSourceText;

      if (contentChanged) {
        // Content changed — stub: skip context rebuild until engine refactor is complete.
        cachedContextRef.current = { sourceText: currentSourceText, context: null };

        if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          commitState(
            deriveEditorState(
              app,
              cachedContextRef.current?.context ?? null,
              cachedContextRef.current?.sourceText ?? null
            )
          );
        }, CONTENT_CHANGE_DEBOUNCE_MS);
      } else {
        // Cursor-only move — reuse cached context, compute immediately.
        commitState(deriveEditorState(app, cached.context, cached.sourceText));
      }
    };

    // Batch all event sources (editor-change, selectionchange, active-leaf-change) into one
    // call per event-loop turn. The first event schedules the update; subsequent events from
    // the same user gesture are dropped until the scheduled call fires.
    const scheduleUpdate = () => {
      if (pendingUpdateRef.current !== null) return;
      pendingUpdateRef.current = setTimeout(() => {
        pendingUpdateRef.current = null;
        updateState();
      }, 0);
    };

    const leafChangeRef = app.workspace.on('active-leaf-change', scheduleUpdate);
    const editorChangeRef = app.workspace.on('editor-change', scheduleUpdate);
    document.addEventListener('selectionchange', scheduleUpdate);
    scheduleUpdate();

    return () => {
      app.workspace.offref(leafChangeRef);
      app.workspace.offref(editorChangeRef);
      document.removeEventListener('selectionchange', scheduleUpdate);
      if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);
      if (pendingUpdateRef.current !== null) clearTimeout(pendingUpdateRef.current);
    };
  }, [app]);

  return editorState;
}
