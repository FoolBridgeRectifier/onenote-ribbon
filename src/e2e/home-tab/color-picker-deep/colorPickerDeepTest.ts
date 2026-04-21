import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for highlight and font color picker paths.
 * Exercises:
 *  - applyHighlightColorSelect (open picker, click a color swatch)
 *  - applyHighlightNoColor (open picker, click "no color")
 *  - applyFontColorClick (click main font-color button)
 *  - applyFontColorSelect (open font-color picker, click a swatch)
 *  - applyFontColorNoColor (open font-color picker, click "no color")
 *  - ColorPicker handleSwatchClick, handleNoColor, handleCustomSubmit paths
 */
export async function colorPickerDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('color-picker-deep', async ({ editor, wait }) => {
    // Helper to dispatch a real click event on an element
    const click = (element: Element) => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    editor.setValue('some text to highlight');
    editor.setCursor({ line: 0, ch: 0 });

    // Test 1: Open highlight color picker and click a swatch color.
    const highlightCaretBtn = document.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (!highlightCaretBtn) throw new Error('Highlight caret button not found');

    click(highlightCaretBtn);
    await wait(100);

    // Find the first color swatch in the picker grid
    const firstSwatch = document.querySelector('.onr-cp-grid .onr-cp-swatch');
    if (firstSwatch) {
      click(firstSwatch);
      await wait(100);
    }

    // Test 2: Open highlight color picker and click "no color".
    click(highlightCaretBtn);
    await wait(100);

    const noColorBtn = document.querySelector('.onr-cp-no-color');
    if (noColorBtn) {
      click(noColorBtn);
      await wait(100);
    }

    // Test 3: Click the main highlight button (applyHighlightClick with default color).
    const highlightBtn = document.querySelector('[data-cmd="highlight"]');
    if (highlightBtn) {
      click(highlightBtn);
      await wait(80);
    }

    // Test 4: Open font color picker and click a swatch color (applyFontColorSelect).
    const fontColorCaretBtn = document.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (!fontColorCaretBtn) throw new Error('Font color caret button not found');

    click(fontColorCaretBtn);
    await wait(100);

    // Click the second swatch to exercise applyFontColorSelect with a non-default color
    const swatches = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');
    const secondSwatch = swatches[1];
    if (secondSwatch) {
      click(secondSwatch);
      await wait(100);
    }

    // Test 5: Open font color picker and click "no color" (applyFontColorNoColor).
    click(fontColorCaretBtn);
    await wait(100);

    const noColorAfterFont = document.querySelector('.onr-cp-no-color');
    if (noColorAfterFont) {
      click(noColorAfterFont);
      await wait(100);
    }

    // Test 6: Click main font-color button (applyFontColorClick).
    const fontColorBtn = document.querySelector('[data-cmd="font-color"]');
    if (fontColorBtn) {
      click(fontColorBtn);
      await wait(80);
    }
  });
}
