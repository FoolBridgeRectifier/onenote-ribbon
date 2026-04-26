import type { MutableRefObject } from 'react';
import type { CopiedFormat } from '../../editor-v2/styling-engine/editor-integration/interfaces';
import type { FormatPainterMode, FormatPainterState } from '../interfaces';
import type { SingleClickOutcome, DoubleClickOutcome } from './interfaces';

// Outcome types for click action decisions — avoids coupling logic to React state

/**
 * Pure decision function for single-click: given click count and current mode,
 * returns what the handler should do without side effects.
 */
export function computeSingleClickOutcome(
  clickCount: number,
  currentMode: FormatPainterMode
): SingleClickOutcome {
  if (clickCount > 1) return 'noop';
  if (currentMode !== 'idle') return 'cancel';
  return 'needs-format';
}

/**
 * Pure decision function for double-click: given current mode and any
 * already-copied format, returns what the handler should do.
 */
export function computeDoubleClickOutcome(
  currentMode: FormatPainterMode,
  existingFormat: CopiedFormat | null
): DoubleClickOutcome {
  if (currentMode === 'locked') return 'cancel';

  const canPromote =
    currentMode === 'armed' && existingFormat !== null && existingFormat.tagDefinitions.length > 0;

  if (canPromote) return 'promote-to-locked';

  return 'needs-format';
}

/**
 * Attaches click and keydown listeners to the editor container for the
 * format painter. Returns a cleanup function to remove all listeners.
 * Designed to be called from a useEffect when mode is armed or locked.
 */
export function attachFormatPainterListeners(
  getState: () => FormatPainterState,
  applyFormat: (format: CopiedFormat) => void,
  cancel: () => void,
  pendingTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  delayMs: number
): () => void {
  const handleEditorClick = () => {
    // Small delay to let the selection settle after the click
    pendingTimerRef.current = setTimeout(() => {
      pendingTimerRef.current = null;
      const currentState = getState();

      if (currentState.mode === 'idle' || !currentState.copiedFormat) return;

      applyFormat(currentState.copiedFormat);

      // Armed = apply once, then reset to idle
      if (currentState.mode === 'armed') {
        cancel();
      }
    }, delayMs);
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

    if (pendingTimerRef.current !== null) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  };
}
