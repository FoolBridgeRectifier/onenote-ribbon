import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for TagToggle.ts uncovered branches:
 *  - htmlEquivalent branch: toggle markdown bold on text already wrapped in <b> HTML tag
 *    → MARKDOWN_TO_HTML_TAG_MAP maps 'bold' → <b> → htmlMatch !== null → unwrap <b>
 *  - htmlDelimiterMatch branch: selection includes the <b> delimiters themselves
 *  - mutuallyExclusiveMatch: toggle subscript on text inside <sup> → swap <sup> to <sub>
 *  - delimiterInclusiveMutuallyExclusiveMatch: selection includes the <sup> tag delimiters
 */
export async function tagToggleDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tag-toggle-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: htmlMatch branch — toggle markdown bold on text already inside <b>.
    // Selection covers the inner text only (offset 3 to 16, NOT 17 which is '<' of '</b>').
    // htmlEquivalent for 'bold' is <b> → findEnclosingMatchingTag finds it → unwrap.
    editor.setValue('<b>bold via html</b>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(3), editor.offsetToPos(16));
    clickByCommand('bold');
    await wait(100);

    const afterHtmlBoldToggle = editor.getValue();
    if (afterHtmlBoldToggle !== 'bold via html') {
      throw new Error('HTML bold unwrap (inner selection): ' + afterHtmlBoldToggle);
    }

    // Test 2: htmlDelimiterMatch branch — selection covers the <b>...</b> delimiters.
    editor.setValue('<b>bold via html</b>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(20));
    clickByCommand('bold');
    await wait(100);

    const afterHtmlBoldDelimiter = editor.getValue();
    if (afterHtmlBoldDelimiter !== 'bold via html') {
      throw new Error('HTML bold unwrap (delimiter-inclusive): ' + afterHtmlBoldDelimiter);
    }

    // Test 3: htmlMatch branch for italic — toggle markdown italic on text inside <i>.
    editor.setValue('<i>italic via html</i>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(3), editor.offsetToPos(18));
    clickByCommand('italic');
    await wait(100);

    const afterHtmlItalicToggle = editor.getValue();
    if (afterHtmlItalicToggle !== 'italic via html') {
      throw new Error('HTML italic unwrap: ' + afterHtmlItalicToggle);
    }

    // Test 4: mutuallyExclusiveMatch branch — toggle subscript on text inside <sup>.
    // resolveMutuallyExclusiveScriptTag(SUB_TAG) returns SUP_TAG → swap <sup> to <sub>.
    editor.setValue('<sup>super text</sup>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(5), editor.offsetToPos(15));
    clickByCommand('subscript');
    await wait(100);

    const afterSubOnSup = editor.getValue();
    if (afterSubOnSup !== '<sub>super text</sub>') {
      throw new Error('Subscript on superscript swap: ' + afterSubOnSup);
    }

    // Test 5: mutuallyExclusiveMatch branch — toggle superscript on text inside <sub>.
    editor.setValue('<sub>sub text</sub>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(5), editor.offsetToPos(13));
    clickByCommand('superscript');
    await wait(100);

    const afterSupOnSub = editor.getValue();
    if (afterSupOnSub !== '<sup>sub text</sup>') {
      throw new Error('Superscript on subscript swap: ' + afterSupOnSub);
    }

    // Test 6: delimiterInclusiveMutuallyExclusiveMatch — selection covers the <sup> delimiters.
    editor.setValue('<sup>super text</sup>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(21));
    clickByCommand('subscript');
    await wait(100);

    const afterSubOnSupDelimiter = editor.getValue();
    if (afterSubOnSupDelimiter !== '<sub>super text</sub>') {
      throw new Error('Subscript on superscript (delimiter-inclusive): ' + afterSubOnSupDelimiter);
    }
  });
}
