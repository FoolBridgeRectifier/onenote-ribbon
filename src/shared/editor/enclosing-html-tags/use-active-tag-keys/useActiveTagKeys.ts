import { useEffect, useRef, useState } from 'react';
import type { App, Editor } from 'obsidian';

import { detectActiveTagKeys } from '../../../editor-v2/styling-engine/editor-integration/detect-active-tag-keys/detectActiveTagKeys';
import { SELECTION_CHANGE_THROTTLE_MS } from './constants';

/**
 * Hook that tracks which OneNote-style tag types are currently active
 * at the editor cursor, updating in real-time as the cursor moves.
 *
 * Returns a Set of active tag keys such as "important", "tip",
 * "__task__", or "__highlight__".
 *
 * Subscribes to Obsidian workspace events and the browser's
 * selectionchange event (throttled), cleaning up on unmount.
 */
export function useActiveTagKeys(app: App): Set<string> {
  const [activeTagKeys, setActiveTagKeys] = useState<Set<string>>(() => new Set<string>());

  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const recompute = () => {
      const editor = app.workspace.activeEditor?.editor ?? null;
      setActiveTagKeys(detectActiveTagKeys(editor as Editor | null));
    };

    // Throttled version for selectionchange, which fires on every caret movement
    const throttledRecompute = () => {
      if (throttleTimerRef.current !== null) return;

      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        recompute();
      }, SELECTION_CHANGE_THROTTLE_MS);
    };

    const leafChangeRef = app.workspace.on('active-leaf-change', recompute);
    const editorChangeRef = app.workspace.on('editor-change', recompute);
    document.addEventListener('selectionchange', throttledRecompute);

    recompute();

    return () => {
      app.workspace.offref(leafChangeRef);
      app.workspace.offref(editorChangeRef);
      document.removeEventListener('selectionchange', throttledRecompute);

      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [app]);

  return activeTagKeys;
}
