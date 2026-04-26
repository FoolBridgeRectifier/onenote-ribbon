import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for per-line-processing/helpers.ts branches:
 *  - shouldProcessPerLine: lines.length <= 1 (false path)
 *  - lineHasMatchingTag: findEnclosingMatchingTag returns non-null (early true)
 *  - lineHasMatchingTag: findDelimiterInclusiveMatch returns non-null (early true)
 *  - lineHasMatchingTag: domain !== 'markdown' (non-markdown tag, multi-line)
 *  - lineHasMatchingTag: htmlEquivalent not found (MD tag with no HTML map entry)
 *  - buildEffectiveLineRanges: inertZone !== null path (skip inert lines)
 *
 * Also exercises:
 *  - DomainConversion.ts: adding HTML tag to markdown-enclosed content (MD → HTML conversion path)
 *  - RemoveActiveCallout.ts: cursor not in callout (no-op path), partial callout
 */
export async function perLineDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('per-line-deep', async ({ clickByCommand, editor, wait }) => {
    if (!editor) {
      throw new Error('per-line-deep: no editor provided to suite');
    }

    const selectRange = (startText: string, endText: string): void => {
      const value = editor.getValue();
      const startIndex = value.indexOf(startText);
      const endIndex = value.indexOf(endText) + endText.length;
      editor.setSelection(editor.offsetToPos(startIndex), editor.offsetToPos(endIndex));
    };

    // Test 1: shouldProcessPerLine → false (single line, list prefix).
    // Verifies lines.length <= 1 early-return branch.
    editor.setValue('- single list item');
    await wait(60);
    editor.setSelection(editor.offsetToPos(2), editor.offsetToPos(18));
    clickByCommand('bold');
    await wait(100);

    // Test 2: Multi-line subscript (non-markdown domain, HTML tag in lineHasMatchingTag).
    // domain !== 'markdown' path in lineHasMatchingTag.
    editor.setValue('- line one text\n- line two text');
    await wait(60);
    selectRange('line one text', 'line two text');
    clickByCommand('subscript');
    await wait(120);

    // Test 3: Multi-line subscript toggle-off — already has <sub> on both lines.
    // lineHasMatchingTag with findEnclosingMatchingTag returning non-null for HTML tag.
    editor.setValue('- <sub>line one text</sub>\n- <sub>line two text</sub>');
    await wait(60);
    selectRange('line one text', 'line two text');
    clickByCommand('subscript');
    await wait(120);

    // Test 4: Add <sub> to multi-line where only one line has it.
    // lineHasMatchingTag returns true for one line, false for another.
    editor.setValue('- <sub>already sub</sub>\n- plain line here');
    await wait(60);
    selectRange('already sub', 'plain line here');
    clickByCommand('subscript');
    await wait(120);

    // Test 5: Multi-line with an inert zone line mixed in.
    // buildEffectiveLineRanges: inertZone !== null → skip that line.
    // Use a code block with a list prefix above and below.
    editor.setValue('- before code\n```\ncode block content\n```\n- after code');
    await wait(60);
    selectRange('before code', 'after code');
    clickByCommand('bold');
    await wait(120);

    // Test 6: DomainConversion — add a color span to bold markdown text.
    // The selection is inside **bold** → domain = 'markdown' → DomainConversion fires.
    editor.setValue('**bold text here**');
    await wait(60);
    editor.setSelection(editor.offsetToPos(2), editor.offsetToPos(16));
    clickByCommand('superscript');
    await wait(100);

    // Test 7: Apply highlight to a multi-line list where one line has existing HTML span.
    // This exercises lineHasMatchingTag with findEnclosingMatchingTag returning non-null (HTML tag).
    editor.setValue('- <span style="background:#FF0000;">colored line</span>\n- plain line here');
    await wait(60);
    selectRange('colored line', 'plain line here');
    clickByCommand('highlight');
    await wait(120);

    // Test 8: Toggle bold on multi-line numbered list with one already bold line.
    // lineHasMatchingTag: findEnclosingMatchingTag returns non-null on first line.
    editor.setValue('1. **already bold text**\n2. plain numbered item');
    await wait(60);
    selectRange('already bold text', 'plain numbered item');
    clickByCommand('bold');
    await wait(120);
  });
}
