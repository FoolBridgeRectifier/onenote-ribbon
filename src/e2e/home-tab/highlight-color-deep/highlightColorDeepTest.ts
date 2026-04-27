import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for highlight-text-color/helpers.ts branches:
 *  - applyHighlightClick: lastHighlightColor === DEFAULT_HIGHLIGHT_COLOR (toggle path)
 *  - applyHighlightClick: editorState.highlightColor === lastHighlightColor (remove span path)
 *  - applyHighlightClick: else branch (remove old + add new color)
 *  - applyHighlightClick: inner if(editorState.highlightColor) in else branch
 *  - removeBackgroundSpanIfPresent: highlightColor is null (no-op path)
 *  - applyHighlightNoColor: highlightColor null path
 *  - applyFontColorNoColor: fontColor null path
 */
export async function highlightColorDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('highlight-color-deep', async ({ editor, wait }) => {
    if (!editor) {
      throw new Error('highlight-color-deep: no editor provided to suite');
    }

    const click = (element: Element): void => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    const openHighlightPicker = async (): Promise<void> => {
      const caretBtn = document.querySelector('.onr-highlight-wrapper .onr-caret-btn');
      if (caretBtn) {
        click(caretBtn);
        await wait(100);
      }
    };

    const openFontColorPicker = async (): Promise<void> => {
      const caretBtn = document.querySelector('.onr-color-wrapper .onr-caret-btn');
      if (caretBtn) {
        click(caretBtn);
        await wait(100);
      }
    };

    // Test 1: Select a non-default highlight color from picker to set lastHighlightColor.
    // This exercises applyHighlightColorSelect.
    editor.setValue('text to color');
    editor.setCursor({ line: 0, ch: 0 });
    await openHighlightPicker();

    const swatches = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');

    if (swatches.length > 0) {
      // Click the first swatch: sets lastHighlightColor to a non-default color
      click(swatches[0]);
      await wait(120);
    }

    // Test 2: Now set editor content to include a span with that color, then click
    // the main highlight button. editorState.highlightColor should match lastHighlightColor
    // → exercises the "else if" branch (remove the span).
    const coloredSpanContent = '<span style="background:#FF0000;">colored text</span>';
    editor.setValue(coloredSpanContent);
    editor.setCursor({ line: 0, ch: 20 });
    await wait(100);

    const highlightBtn = document.querySelector('[data-cmd="highlight"]');

    if (highlightBtn) {
      // At this point lastHighlightColor is the swatch color, not default.
      // If editorState detects a background color matching lastHighlightColor → else-if branch.
      click(highlightBtn);
      await wait(100);
    }

    // Test 3: Set editor to plain text, click highlight button when lastHighlightColor is non-default.
    // editorState.highlightColor will be null (no highlight on selection).
    // → exercises the else branch (remove MD tag, add new color), inner if(highlightColor) = false.
    const plainContent = 'plain text for else branch';
    editor.setValue(plainContent);
    editor.setCursor({ line: 0, ch: 0 });
    await wait(80);

    if (highlightBtn) {
      click(highlightBtn);
      await wait(100);

      // Clicking highlight on plain text must add a span (content must change)
      if (editor.getValue() === plainContent) {
        throw new Error(
          'highlight-color-deep test3: content unchanged after highlight on plain text — span was not added'
        );
      }
    }

    // Test 4: Open highlight picker and click "no color" when editor has NO highlight.
    // → applyHighlightNoColor with highlightColor = null (inner if = false).
    editor.setValue('no highlight text');
    editor.setCursor({ line: 0, ch: 0 });
    await wait(60);

    await openHighlightPicker();

    const noColorBtn = document.querySelector('.onr-cp-no-color');

    if (noColorBtn) {
      click(noColorBtn);
      await wait(100);
    }

    // Test 5: Open font color picker and click "no color" when editor has NO font color.
    // → applyFontColorNoColor with fontColor = null (if fontColor = false → no-op).
    editor.setValue('no font color text');
    editor.setCursor({ line: 0, ch: 0 });
    await wait(60);

    await openFontColorPicker();

    const noColorBtnFont = document.querySelector('.onr-cp-no-color');

    if (noColorBtnFont) {
      click(noColorBtnFont);
      await wait(100);
    }

    // Test 6: removeBackgroundSpanIfPresent with highlightColor = null.
    // Open picker, click no-color on already-no-color text → highlightColor is null → no-op branch.
    editor.setValue('clean line');
    editor.setCursor({ line: 0, ch: 0 });
    await wait(60);

    await openHighlightPicker();

    const noColorBtn2 = document.querySelector('.onr-cp-no-color');

    if (noColorBtn2) {
      click(noColorBtn2);
      await wait(100);
    }
  });
}
