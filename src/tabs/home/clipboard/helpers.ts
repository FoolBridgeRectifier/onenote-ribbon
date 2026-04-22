import { useEffect } from 'react';
import { FORMAT_PAINTER_ACTIVATE_EVENT } from '../../../shared/commands/constants';

/**
 * Listens for the FORMAT_PAINTER_ACTIVATE_EVENT DOM event and calls handleSingleClick(1)
 * when it fires. This bridges the Obsidian command API (outside React) to the
 * format painter state machine (inside React).
 */
export function useFormatPainterActivation(handleSingleClick: (clickCount: number) => void): void {
  useEffect(() => {
    const handleActivate = () => {
      handleSingleClick(1);
    };

    document.addEventListener(FORMAT_PAINTER_ACTIVATE_EVENT, handleActivate);
    return () => {
      document.removeEventListener(FORMAT_PAINTER_ACTIVATE_EVENT, handleActivate);
    };
  }, [handleSingleClick]);
}
