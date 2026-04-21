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
    // detectFormattingDomain: no enclosing HTML tags → domain = 'markdown'.
    // findEnclosingMatchingTag for BOLD_MD_TAG (tagName 'bold') → null (it's <b>, not **).
    // findDelimiterInclusiveMatch for BOLD_MD_TAG → null.
    // htmlEquivalent = MARKDOWN_TO_HTML_TAG_MAP.get('bold') → BOLD_HTML_TAG (<b>).
    // findEnclosingMatchingTag for <b> → FOUND → unwrap → htmlMatch !== null branch fires.
    editor.setValue('<b>bold via html</b>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(3), editor.offsetToPos(17));
    clickByCommand('bold');
    await wait(100);

    // Test 2: htmlDelimiterMatch branch — selection covers the <b>...</b> delimiters.
    // Select from start of <b> to end of </b> → delimiter-inclusive match of <b>.
    editor.setValue('<b>bold via html</b>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(20));
    clickByCommand('bold');
    await wait(100);

    // Test 3: htmlMatch branch for italic — toggle markdown italic on text inside <i>.
    editor.setValue('<i>italic via html</i>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(3), editor.offsetToPos(18));
    clickByCommand('italic');
    await wait(100);

    // Test 4: mutuallyExclusiveMatch branch — toggle subscript on text inside <sup>.
    // resolveMutuallyExclusiveScriptTag(SUB_TAG) returns SUP_TAG.
    // findEnclosingMatchingTag for <sup> → FOUND → buildTagMarkupSwapReplacements fires.
    editor.setValue('<sup>super text</sup>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(5), editor.offsetToPos(15));
    clickByCommand('subscript');
    await wait(100);

    // Test 5: mutuallyExclusiveMatch branch — toggle superscript on text inside <sub>.
    // resolveMutuallyExclusiveScriptTag(SUP_TAG) returns SUB_TAG.
    editor.setValue('<sub>sub text</sub>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(5), editor.offsetToPos(13));
    clickByCommand('superscript');
    await wait(100);

    // Test 6: delimiterInclusiveMutuallyExclusiveMatch — selection covers the <sup> delimiters.
    editor.setValue('<sup>super text</sup>');
    await wait(60);
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(21));
    clickByCommand('subscript');
    await wait(100);
  });
}
