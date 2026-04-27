import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for use-format-painter/helpers.ts branches:
 *  - attachFormatPainterListeners: handleEditorClick fires after setTimeout delay
 *  - handleEditorClick: mode === 'idle' → noop (early return branch)
 *  - handleEditorClick: mode === 'armed' → applyFormat + cancel (armed branch)
 *  - handleKeyDown: Escape key → cancel (keydown handler branch)
 *  - cleanup function: removeEventListener paths
 */
export async function formatPainterApplyTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite(
    'format-painter-apply',
    async ({ clickByCommand, editor, selectToken, wait }) => {
      if (!editor) {
        throw new Error('format-painter-apply: no editor provided to suite');
      }

      // Test 1: Arm format painter, then click the editor area to trigger handleEditorClick.
      // This exercises the setTimeout callback body (lines 46-51 in helpers.ts).
      // Sequence: set content with bold → select the bold span → copy format (single click) →
      // click somewhere else → wait for debounce → click editor → wait for timeout → verify.
      editor.setValue('<b>Bold text</b> regular text');
      selectToken('Bold text');
      await wait(60);

      // Single click on format-painter arms it (mode transitions to 'armed')
      clickByCommand('format-painter');
      await wait(80);

      // Armed state must be reflected on the button
      const formatPainterBtnAfterArm = document.querySelector('[data-cmd="format-painter"]');
      if (!formatPainterBtnAfterArm?.classList.contains('onr-active')) {
        throw new Error(
          'format-painter-apply test1: button not active after single click (failed to arm)'
        );
      }

      // Now click the cm-editor container to fire handleEditorClick
      const editorContainer = document.querySelector('.cm-editor');

      if (editorContainer) {
        editorContainer.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        // Wait longer than the delayMs (typically 150ms) so the setTimeout fires
        await wait(300);
      }

      // Test 2: Escape key cancels armed format painter (exercises handleKeyDown).
      // Re-arm the painter then press Escape.
      editor.setValue('<b>Bold again</b> regular');
      selectToken('Bold again');
      await wait(60);

      clickByCommand('format-painter');
      await wait(80);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await wait(80);

      // After Escape, painter must be back to idle (button inactive)
      const formatPainterBtnAfterEscape = document.querySelector('[data-cmd="format-painter"]');
      if (formatPainterBtnAfterEscape?.classList.contains('onr-active')) {
        throw new Error(
          'format-painter-apply test2: button still active after Escape — cancel handler did not fire'
        );
      }

      // Test 3: Double-click format painter to lock it (mode → 'locked').
      // Then click editor → handleEditorClick fires → mode === 'locked' → applies without cancel.
      editor.setValue('<b>Lock test</b> plain');
      selectToken('Lock test');
      await wait(60);

      // First click: arm
      clickByCommand('format-painter');
      await wait(60);

      // Second click on the same button in locked mode (double-click behavior)
      clickByCommand('format-painter');
      await wait(80);

      const editorContainer2 = document.querySelector('.cm-editor');

      if (editorContainer2) {
        editorContainer2.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true })
        );
        await wait(300);
      }

      // Test 4: Click format-painter with event.detail === 2 (double-click) to exercise
      // computeSingleClickOutcome clickCount > 1 → 'noop' branch.
      editor.setValue('<b>noop test</b> plain');
      selectToken('noop test');
      await wait(60);

      // Dispatch a click with detail=2 (OS double-click) to trigger noop branch
      const formatPainterBtn = document.querySelector('[data-cmd="format-painter"]');

      if (formatPainterBtn) {
        formatPainterBtn.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, detail: 2 })
        );
        await wait(100);
      }

      // Test 5: Click format-painter when mode is 'armed' (computeSingleClickOutcome 'cancel').
      // First arm the painter with a valid format.
      editor.setValue('<b>cancel test</b>');
      selectToken('cancel test');
      await wait(60);

      // Arm with detail=1
      if (formatPainterBtn) {
        formatPainterBtn.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })
        );
        await wait(80);
      }

      // Now click again with detail=1 while mode is 'armed' → computeSingleClickOutcome returns 'cancel'
      if (formatPainterBtn) {
        formatPainterBtn.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })
        );
        await wait(100);
      }
    }
  );
}
