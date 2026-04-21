import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for the Styles group — actually clicks each style item and
 * clear formatting button to exercise applyStyle, clearStyleFormatting,
 * and computeScrollOffset in src/tabs/home/styles/helpers.ts.
 */
export async function stylesDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('styles-deep', async ({ clickByCommand, commandCalls, editor, wait }) => {
    // Test 1: Click the "Normal" preview button (level 0 path in applyStyle).
    // Start with a heading line so Normal actually changes something.
    editor.setValue('# heading line');
    editor.setCursor(editor.offsetToPos(0));
    await wait(150);
    clickByCommand('style-normal');
    await wait(100);

    const headingCleared = !editor.getValue().startsWith('#');
    if (!headingCleared) {
      throw new Error('applyStyle Normal did not clear heading: ' + editor.getValue());
    }

    // Test 2: Click the "Heading 1" preview button (executeCommandById path).
    editor.setValue('plain line');
    editor.setCursor(editor.offsetToPos(0));
    await wait(80);
    clickByCommand('style-heading-1');
    await wait(100);

    const heading1Applied = commandCalls.some((callId) => callId.includes('set-heading-1'));
    if (!heading1Applied) {
      throw new Error('applyStyle Heading 1 did not execute the heading-1 command');
    }

    // Test 3: Open the expanded styles dropdown and click "Quote" (quote path).
    editor.setValue('some text');
    editor.setCursor(editor.offsetToPos(0));
    await wait(80);
    clickByCommand('styles-expand');
    await wait(150);

    const quoteDropdownItem = Array.from(
      document.querySelectorAll('.onr-styles-dropdown .onr-dd-item')
    ).find((itemElement) => (itemElement.textContent || '').trim() === 'Quote');

    if (!quoteDropdownItem) {
      throw new Error('Quote item not found in expanded styles dropdown');
    }

    quoteDropdownItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(100);

    const quoteCalled = commandCalls.some((callId) => callId.includes('toggle-blockquote'));
    if (!quoteCalled) {
      throw new Error('applyStyle Quote did not execute the blockquote command');
    }

    // Test 4: Open the dropdown and click "Code" (code path).
    clickByCommand('styles-expand');
    await wait(150);

    const codeDropdownItem = Array.from(
      document.querySelectorAll('.onr-styles-dropdown .onr-dd-item')
    ).find((itemElement) => (itemElement.textContent || '').trim() === 'Code');

    if (!codeDropdownItem) {
      throw new Error('Code item not found in expanded styles dropdown');
    }

    codeDropdownItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(100);

    const codeCalled = commandCalls.some((callId) => callId.includes('toggle-code'));
    if (!codeCalled) {
      throw new Error('applyStyle Code did not execute the code command');
    }

    // Test 5: Open the dropdown and click "Clear Formatting" (clearStyleFormatting path).
    editor.setValue('## heading two line');
    editor.setCursor(editor.offsetToPos(0));
    await wait(80);

    clickByCommand('styles-expand');
    await wait(150);

    const clearFormattingButton = document.querySelector('.onr-clear-formatting-btn');
    if (!clearFormattingButton) {
      throw new Error('Clear Formatting button not found in expanded styles dropdown');
    }

    clearFormattingButton.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    await wait(100);

    const headingClearedByButton = !editor.getValue().startsWith('#');
    if (!headingClearedByButton) {
      throw new Error('clearStyleFormatting did not clear heading: ' + editor.getValue());
    }

    // Test 6: Trigger computeScrollOffset by setting a deep heading (H5).
    // The effect fires when editorState.headLevel changes to a value beyond the
    // visible window (default offset = 0, window shows indices 0 and 1).
    editor.setValue('##### heading five');
    editor.setCursor(editor.offsetToPos(0));

    // Apply H5 so the active index (4 in the STYLES_LIST) is outside the visible window
    clickByCommand('styles-expand');
    await wait(150);

    const heading5Item = Array.from(
      document.querySelectorAll('.onr-styles-dropdown .onr-dd-item')
    ).find((itemElement) => (itemElement.textContent || '').trim() === 'Heading 5');

    if (heading5Item) {
      heading5Item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }

    // Wait for the debounced editorState update and computeScrollOffset effect to run
    await wait(200);
  });
}
