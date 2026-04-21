import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Targeted coverage for highlight-text-color/helpers.ts branches that are not
 * reached by color-picker-deep (which resets lastHighlightColor between tests).
 *
 * Target branches:
 *  - applyHighlightClick: lastHighlightColor !== DEFAULT_HIGHLIGHT_COLOR
 *    AND editorState.highlightColor === lastHighlightColor → removeTagInEditor (else if)
 *  - applyHighlightClick: lastHighlightColor !== DEFAULT_HIGHLIGHT_COLOR
 *    AND editorState.highlightColor !== lastHighlightColor → remove old + add new (else)
 *  - inner if(editorState.highlightColor) in else branch (when existing color present)
 *  - removeBackgroundSpanIfPresent: highlightColor non-null → removeTagInEditor
 *  - applyHighlightNoColor: highlightColor is null → skip removeTagInEditor
 */
export async function highlightHelpersBranchTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('highlight-helpers-branch', async ({ editor, wait }) => {
    const click = (element: Element): void => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    const openHighlightPicker = async (): Promise<void> => {
      const caretBtn = document.querySelector('.onr-highlight-wrapper .onr-caret-btn');
      if (!caretBtn) throw new Error('Highlight caret button not found');
      click(caretBtn);
      await wait(150);
    };

    // Test 1: Select a swatch color, then immediately click the main highlight button
    // on text that already has that same span color.
    // → editorState.highlightColor === lastHighlightColor → "else if" branch (remove span)
    editor.setValue('text with color');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(15));
    await wait(80);

    // Open picker and click first swatch (#000000)
    await openHighlightPicker();
    const firstSwatch = document.querySelector('.onr-cp-grid .onr-cp-swatch');
    if (firstSwatch) {
      click(firstSwatch);
      await wait(150);
    }

    // Now editor has: <span style="background:#000000;">text with color</span>
    // lastHighlightColor = '#000000', editorState.highlightColor should be '#000000'
    // Place cursor inside the span
    editor.setCursor({ line: 0, ch: 5 });
    await wait(80);

    // Click highlight button → applyHighlightClick with lastHighlightColor='#000000'
    // editorState.highlightColor should be '#000000' → "else if" branch fires
    const highlightBtn = document.querySelector('[data-cmd="highlight"]');
    if (highlightBtn) {
      click(highlightBtn);
      await wait(120);
    }

    // Test 2: Apply one color span, then select a DIFFERENT color swatch.
    // This exercises the "else" branch: editorState.highlightColor !== lastHighlightColor.
    // First apply #000000 span to establish editorState.highlightColor
    editor.setValue('transition color test');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(20));
    await wait(80);

    await openHighlightPicker();
    const allSwatches = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');
    // Click first swatch (#000000) to add a span
    if (allSwatches[0]) {
      click(allSwatches[0]);
      await wait(150);
    }

    // editor now has #000000 span; place cursor inside it
    editor.setCursor({ line: 0, ch: 5 });
    await wait(80);

    // Open picker again and click SECOND swatch (#434343) — different color
    // This sets lastHighlightColor to '#434343' AND applies '#434343' span
    // (applyHighlightColorSelect removes old + adds new via addTagInEditor)
    await openHighlightPicker();
    const swatchesForTransition = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');
    if (swatchesForTransition[1]) {
      click(swatchesForTransition[1]);
      await wait(150);
    }

    // At this point lastHighlightColor = '#434343'
    // Now click highlight button with editorState.highlightColor reflecting the new span
    // To get a color mismatch: place cursor on plain text (no span), then click highlight
    editor.setValue('plain text no span');
    editor.setCursor({ line: 0, ch: 5 });
    await wait(80);

    // lastHighlightColor is '#434343', editorState.highlightColor is null → "else" branch
    // inner if(editorState.highlightColor) → false (null), still adds the new color span
    if (highlightBtn) {
      click(highlightBtn);
      await wait(120);
    }

    // Test 3: removeBackgroundSpanIfPresent with non-null highlightColor.
    // Trigger applyHighlightClick with DEFAULT color when editorState has a color span.
    // → removeBackgroundSpanIfPresent(editor, highlightColor) where highlightColor != null
    // First add a span so editorState.highlightColor is non-null
    editor.setValue('span then default click');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(10));
    await wait(80);

    // Apply a span color via swatch
    await openHighlightPicker();
    const swatchesForDefault = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');
    if (swatchesForDefault[2]) {
      click(swatchesForDefault[2]);
      await wait(150);
    }

    // Now click "no color" to reset lastHighlightColor to DEFAULT
    await openHighlightPicker();
    const noColorBtn = document.querySelector('.onr-cp-no-color');
    if (noColorBtn) {
      click(noColorBtn);
      await wait(120);
    }

    // Editor still has span content at line 0; place cursor on span text
    // Now apply the span back via swatch and then click "no color" with an existing span
    editor.setValue('text with existing span');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(10));
    await wait(80);

    await openHighlightPicker();
    const swatchesForSpan = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');
    if (swatchesForSpan[0]) {
      click(swatchesForSpan[0]);
      await wait(150);
    }

    // Cursor inside span now; editorState.highlightColor = '#000000'
    editor.setCursor({ line: 0, ch: 5 });
    await wait(80);

    // Reset picker to DEFAULT then click highlight button
    // → removeBackgroundSpanIfPresent(editor, '#000000') → highlightColor non-null → removeTagInEditor
    await openHighlightPicker();
    const noColorForReset = document.querySelector('.onr-cp-no-color');
    if (noColorForReset) {
      click(noColorForReset);
      await wait(120);
    }

    // Test 4: applyHighlightNoColor with highlightColor null.
    // Place cursor on plain text (no span), open picker, click "no color"
    // → applyHighlightNoColor(editor, null) → if (highlightColor) = false → skips removeTagInEditor
    editor.setValue('plain text no highlight');
    editor.setCursor({ line: 0, ch: 5 });
    await wait(80);

    await openHighlightPicker();
    const noColorForNull = document.querySelector('.onr-cp-no-color');
    if (noColorForNull) {
      click(noColorForNull);
      await wait(100);
    }
  });
}
