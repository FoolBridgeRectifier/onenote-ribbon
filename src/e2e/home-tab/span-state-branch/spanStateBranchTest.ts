import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Targeted coverage for spanState.ts and editorStateHelpers.ts uncovered branches.
 *
 * spanState.ts uncovered branches:
 *  - font-family property in extractSpanAndDivState span loop
 *  - font-size property in extractSpanAndDivState span loop
 *  - text-align property in extractSpanAndDivState span loop
 *  - text-align VALID_TEXT_ALIGN_VALUES check
 *  - <div> tagName branch in extractSpanAndDivState
 *
 * editorStateHelpers.ts uncovered branches:
 *  - cachedFinder && cachedSourceText === sourceText → true (use cached finder)
 *    Achieved by moving cursor without changing content between state reads
 */
export async function spanStateBranchTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('span-state-branch', async ({ editor, wait, clickByCommand }) => {
    // Test 1: font-family property branch — place cursor inside the text content of a span.
    // Opening tag '<span style="font-family:Arial;">' is 33 chars (ch 0–32).
    // Text content starts at ch 33; cursor at ch 38 is safely inside the text.
    editor.setValue('<span style="font-family:Arial;">text with font family</span>');
    editor.setCursor({ line: 0, ch: 38 });
    await wait(120);

    // Apply bold to trigger the editor state derivation, which calls extractSpanAndDivState
    clickByCommand('bold');
    await wait(80);

    // Test 2: font-size property branch — cursor inside the text of a span with font-size.
    // Opening tag '<span style="font-size:14pt;">' is 30 chars (ch 0–29).
    // Text content starts at ch 30; cursor at ch 35 is safely inside the text.
    editor.setValue('<span style="font-size:14pt;">text with font size</span>');
    editor.setCursor({ line: 0, ch: 35 });
    await wait(120);

    clickByCommand('italic');
    await wait(80);

    // Test 3: text-align property branch — cursor inside the text of a span with text-align.
    // Opening tag '<span style="text-align:center;">' is 33 chars (ch 0–32).
    // Text content starts at ch 33; cursor at ch 40 is safely inside the text.
    editor.setValue('<span style="text-align:center;">centered text</span>');
    editor.setCursor({ line: 0, ch: 40 });
    await wait(120);

    clickByCommand('bold');
    await wait(80);

    // Test 4: <div> tag branch — cursor inside the text of a div with text-align.
    // Opening tag '<div style="text-align:right;">' is 31 chars (ch 0–30).
    // Text content starts at ch 31; cursor at ch 38 is safely inside the text.
    editor.setValue('<div style="text-align:right;">right aligned text</div>');
    editor.setCursor({ line: 0, ch: 38 });
    await wait(120);

    clickByCommand('italic');
    await wait(80);

    // Test 5: invalid text-align value — VALID_TEXT_ALIGN_VALUES check fails, textAlign stays 'left'.
    // Opening tag '<span style="text-align:invalid;">' is 34 chars (ch 0–33).
    // Text content starts at ch 34; cursor at ch 40 is safely inside the text.
    editor.setValue('<span style="text-align:invalid;">invalid align</span>');
    editor.setCursor({ line: 0, ch: 40 });
    await wait(120);

    clickByCommand('bold');
    await wait(80);

    // Test 6: cachedFinder reuse branch in editorStateHelpers.ts.
    // Set content, wait for debounce, then just move cursor (no content change).
    // The cached finder should be reused on the second state derivation.
    editor.setValue('**bold text** for cache test');
    await wait(120);

    // Move cursor to different position — editorState fires via selectionchange
    // which throttles to update state using the cursor-only path (reuses cached finder)
    editor.setCursor({ line: 0, ch: 5 });
    await wait(100);
    editor.setCursor({ line: 0, ch: 10 });
    await wait(100);
  });
}
