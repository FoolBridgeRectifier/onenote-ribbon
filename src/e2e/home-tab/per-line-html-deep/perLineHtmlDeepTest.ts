import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for per-line-processing/helpers.ts remaining uncovered branches:
 *  - lineHasMatchingTag: htmlEquivalent branch → findEnclosingMatchingTag for <b>/<i> on a line
 *    Scenario: multi-line selection covering a list with one line containing <b>text</b>,
 *    toggle markdown bold → per-line fires → lineHasMatchingTag checks <b> HTML equivalent → true
 *  - lineHasMatchingTag: htmlEquivalent → findDelimiterInclusiveMatch for HTML equivalent
 *    Scenario: selection includes the <b> opening/closing tags
 *  - buildEffectiveLineRanges: inertZone !== null skip for lines inside code block
 */
export async function perLineHtmlDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('per-line-html-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: Multi-line selection, one line has <b> HTML bold → lineHasMatchingTag htmlEquivalent true.
    // Toggle markdown bold on a multi-line structured selection containing a line with <b>.
    // Line 1: "- <b>already bold</b>" (has linePrefixType 'bullet')
    // Line 2: "- plain line" (has linePrefixType 'bullet')
    // → shouldProcessPerLine returns true (2+ lines with prefix)
    // → toggleTagPerLine runs per-line
    // → lineHasMatchingTag for line 1: domain='markdown', htmlEquivalent=<b>, findEnclosing(<b>) → true
    editor.setValue('- <b>already bold</b>\n- plain line');
    await wait(80);
    const value1 = editor.getValue();
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(value1.length));
    clickByCommand('bold');
    await wait(120);

    // Test 2: Multi-line with <i> italic HTML on one line → lineHasMatchingTag htmlEquivalent for italic.
    editor.setValue('- <i>italic line</i>\n- normal line');
    await wait(80);
    const value2 = editor.getValue();
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(value2.length));
    clickByCommand('italic');
    await wait(120);

    // Test 3: Multi-line with selection covering the <b> delimiters (delimiter-inclusive).
    // Line 1: "- <b>bold content</b>" — select from start of <b> to end of </b>
    // → findDelimiterInclusiveMatch for HTML equivalent fires
    editor.setValue('- <b>bold content</b>\n- second line');
    await wait(80);
    const value3 = editor.getValue();
    // Select everything including the <b> and </b> delimiters
    editor.setSelection(editor.offsetToPos(2), editor.offsetToPos(value3.indexOf('\n')));
    clickByCommand('bold');
    await wait(120);

    // Test 4: buildEffectiveLineRanges inertZone skip.
    // Multi-line selection including a code-fence line (inertZone !== null on that line).
    // - list item one
    // ```
    // code content
    // ```
    // - list item two
    // Selecting all lines → lines inside ``` have inertZone, those are skipped.
    editor.setValue('- list item one\n```\ncode content\n```\n- list item two');
    await wait(80);
    const value4 = editor.getValue();
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(value4.length));
    clickByCommand('bold');
    await wait(120);
  });
}
