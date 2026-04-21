import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for editor integration paths not covered by other suites.
 * Specifically targets:
 *  - handleCut in Clipboard.tsx — clicking [data-cmd="cut"]
 *  - handleCopy in Clipboard.tsx — clicking [data-cmd="copy"]
 *  - Paste as code block inline handler in Clipboard.tsx
 *  - handleFormatPainterDoubleClick via direct dblclick event
 */
export async function editorIntegrationDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('editor-integration-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: Click Cut — exercises handleCut in Clipboard.tsx.
    // The handler checks getEditor() and calls document.execCommand('cut').
    // We verify the button exists and is clickable without throwing.
    editor.setValue('text to cut');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });

    const cutButton = document.querySelector('[data-cmd="cut"]');
    if (!cutButton) {
      throw new Error('[data-cmd="cut"] button not found');
    }

    cutButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(80);

    // Test 2: Click Copy — exercises handleCopy in Clipboard.tsx.
    editor.setValue('text to copy');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });

    const copyButton = document.querySelector('[data-cmd="copy"]');
    if (!copyButton) {
      throw new Error('[data-cmd="copy"] button not found');
    }

    copyButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(80);

    // Test 3: Open paste dropdown and click "Paste as code block" — exercises the
    // inline arrow function handler that wraps content in triple backticks.
    clickByCommand('paste-dropdown');
    await wait(150);

    const pasteCodeItem = Array.from(document.querySelectorAll('.onr-dd-item')).find(
      (itemElement) => (itemElement.textContent || '').toLowerCase().includes('code')
    );

    if (pasteCodeItem) {
      pasteCodeItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(150);
    } else {
      // Close dropdown if item not found (clipboard API may be unavailable in test env)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await wait(80);
    }

    // Test 4: Fire a native dblclick event on the format-painter button to exercise
    // handleFormatPainterDoubleClick in Clipboard.tsx.
    editor.setValue('**formatted text**');
    editor.setSelection({ line: 0, ch: 2 }, { line: 0, ch: 16 });

    const formatPainterButton = document.querySelector('[data-cmd="format-painter"]');
    if (!formatPainterButton) {
      throw new Error('[data-cmd="format-painter"] button not found');
    }

    // A real double-click fires: mousedown, mouseup, click, mousedown, mouseup, click, dblclick
    formatPainterButton.dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true })
    );
    await wait(100);

    // Cancel the locked mode so subsequent tests are not affected
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    await wait(80);
  });
}
