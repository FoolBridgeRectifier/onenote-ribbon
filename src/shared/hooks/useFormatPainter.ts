import { useCallback, useEffect, useRef, useState } from 'react';
import { App } from 'obsidian';
import { copyFormatFromEditor, addTagInEditor } from '../editor/styling-engine/editorIntegration';
import type { CopiedFormat } from '../editor/styling-engine/interfaces';

export type FormatPainterMode = 'idle' | 'armed' | 'locked';

export interface FormatPainterState {
  mode: FormatPainterMode;
  copiedFormat: CopiedFormat | null;
}

interface UseFormatPainterResult {
  state: FormatPainterState;
  handleSingleClick: () => void;
  handleDoubleClick: () => void;
  cancel: () => void;
}

/**
 * Format painter state machine hook (OneNote-style).
 *
 * idle → single click → armed (copy format, apply once on next click) → idle
 * idle → double click → locked (copy format, apply on every click until Escape)
 * armed/locked → Escape → idle
 */
export function useFormatPainter(app: App): UseFormatPainterResult {
  const [state, setState] = useState<FormatPainterState>({
    mode: 'idle',
    copiedFormat: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const getEditor = useCallback(
    () => app.workspace.activeEditor?.editor ?? null,
    [app],
  );

  const copyCurrentFormat = useCallback((): CopiedFormat | null => {
    const editor = getEditor();
    if (!editor) return null;
    return copyFormatFromEditor(editor);
  }, [getEditor]);

  const applyFormat = useCallback(
    (copiedFormat: CopiedFormat) => {
      const editor = getEditor();
      if (!editor) return;

      const selection = editor.getSelection();
      if (!selection) return;

      // Apply each tag definition from the copied format
      for (
        let tagIndex = 0;
        tagIndex < copiedFormat.tagDefinitions.length;
        tagIndex += 1
      ) {
        addTagInEditor(editor, copiedFormat.tagDefinitions[tagIndex]);
      }
    },
    [getEditor],
  );

  const cancel = useCallback(() => {
    setState({ mode: 'idle', copiedFormat: null });
  }, []);

  const handleSingleClick = useCallback(() => {
    if (stateRef.current.mode !== 'idle') {
      // If already active, cancel
      cancel();
      return;
    }

    const format = copyCurrentFormat();
    if (!format || format.tagDefinitions.length === 0) return;

    setState({ mode: 'armed', copiedFormat: format });
  }, [copyCurrentFormat, cancel]);

  const handleDoubleClick = useCallback(() => {
    if (stateRef.current.mode === 'locked') {
      cancel();
      return;
    }

    const format = copyCurrentFormat();
    if (!format || format.tagDefinitions.length === 0) return;

    setState({ mode: 'locked', copiedFormat: format });
  }, [copyCurrentFormat, cancel]);

  // Listen for editor clicks when armed/locked to apply format
  const pendingApplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.mode === 'idle') return;

    const handleEditorClick = () => {
      // Small delay to let the selection settle after the click
      pendingApplyTimerRef.current = setTimeout(() => {
        pendingApplyTimerRef.current = null;
        const currentState = stateRef.current;
        if (currentState.mode === 'idle' || !currentState.copiedFormat) return;

        applyFormat(currentState.copiedFormat);

        if (currentState.mode === 'armed') {
          setState({ mode: 'idle', copiedFormat: null });
        }
      }, 50);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancel();
      }
    };

    // Listen on the editor container for clicks
    const editorContainer = document.querySelector('.cm-editor');

    if (editorContainer) {
      editorContainer.addEventListener('click', handleEditorClick);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (editorContainer) {
        editorContainer.removeEventListener('click', handleEditorClick);
      }

      document.removeEventListener('keydown', handleKeyDown);

      if (pendingApplyTimerRef.current !== null) {
        clearTimeout(pendingApplyTimerRef.current);
        pendingApplyTimerRef.current = null;
      }
    };
  }, [state.mode, applyFormat, cancel]);

  return { state, handleSingleClick, handleDoubleClick, cancel };
}
