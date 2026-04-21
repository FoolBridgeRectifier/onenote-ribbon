import { useCallback, useEffect, useRef, useState } from 'react';
import type { App } from 'obsidian';
import {
  copyFormatFromEditor,
  addTagInEditor,
} from '../editor/styling-engine/editor-integration/helpers';
import type { CopiedFormat } from '../editor/styling-engine/interfaces';
import type { FormatPainterState, UseFormatPainterResult } from './interfaces';
import { APPLY_AFTER_EDITOR_CLICK_DELAY_MILLISECONDS } from './constants';
import {
  computeSingleClickOutcome,
  computeDoubleClickOutcome,
  attachFormatPainterListeners,
} from './use-format-painter/helpers';

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

  const pendingApplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const getEditor = useCallback(() => app.workspace.activeEditor?.editor ?? null, [app]);

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
      for (let tagIndex = 0; tagIndex < copiedFormat.tagDefinitions.length; tagIndex += 1) {
        addTagInEditor(editor, copiedFormat.tagDefinitions[tagIndex]);
      }
    },
    [getEditor]
  );

  const cancel = useCallback(() => {
    setState({ mode: 'idle', copiedFormat: null });
  }, []);

  const handleSingleClick = useCallback(
    (clickCount: number = 1) => {
      const outcome = computeSingleClickOutcome(clickCount, stateRef.current.mode);

      if (outcome === 'noop') return;

      if (outcome === 'cancel') {
        cancel();
        return;
      }

      // 'needs-format': copy format from editor and arm the painter
      const format = copyCurrentFormat();
      if (!format || format.tagDefinitions.length === 0) return;

      setState({ mode: 'armed', copiedFormat: format });
    },
    [copyCurrentFormat, cancel]
  );

  const handleDoubleClick = useCallback(() => {
    const outcome = computeDoubleClickOutcome(stateRef.current.mode, stateRef.current.copiedFormat);

    if (outcome === 'cancel') {
      cancel();
      return;
    }

    if (outcome === 'promote-to-locked') {
      setState({ mode: 'locked', copiedFormat: stateRef.current.copiedFormat! });
      return;
    }

    // 'needs-format': copy from editor and lock the painter
    const format = copyCurrentFormat();
    if (!format || format.tagDefinitions.length === 0) return;

    setState({ mode: 'locked', copiedFormat: format });
  }, [copyCurrentFormat, cancel]);

  // Listen for editor clicks when armed/locked to apply format
  useEffect(() => {
    if (state.mode === 'idle') return;

    return attachFormatPainterListeners(
      () => stateRef.current,
      applyFormat,
      cancel,
      pendingApplyTimerRef,
      APPLY_AFTER_EDITOR_CLICK_DELAY_MILLISECONDS
    );
  }, [state.mode, applyFormat, cancel]);

  return { state, handleSingleClick, handleDoubleClick, cancel };
}
