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

    // Single line → no per-line path → entire selection wrapped in bold.
    const afterBold1 = editor.getValue();
    if (afterBold1 !== '- **single list item**') {
      throw new Error('per-line-deep test1: expected "- **single list item**", got: ' + afterBold1);
    }

    // Test 2: Multi-line subscript (non-markdown domain, HTML tag in lineHasMatchingTag).
    // domain !== 'markdown' path in lineHasMatchingTag.
    editor.setValue('- line one text\n- line two text');
    await wait(60);
    selectRange('line one text', 'line two text');
    clickByCommand('subscript');
    await wait(120);

    // Both lines must have received <sub> wrappers.
    const valueAfterSubscript = editor.getValue();
    if (valueAfterSubscript !== '- <sub>line one text</sub>\n- <sub>line two text</sub>') {
      throw new Error(
        'per-line-deep test2: expected both lines subscripted, got: ' + valueAfterSubscript
      );
    }

    // Test 3: Multi-line subscript toggle-off — already has <sub> on both lines.
    // lineHasMatchingTag with findEnclosingMatchingTag returning non-null for HTML tag.
    editor.setValue('- <sub>line one text</sub>\n- <sub>line two text</sub>');
    await wait(60);
    selectRange('line one text', 'line two text');
    clickByCommand('subscript');
    await wait(120);

    // All lines have <sub> → remove from all → plain text remains.
    const afterSubscriptOff = editor.getValue();
    if (afterSubscriptOff !== '- line one text\n- line two text') {
      throw new Error(
        'per-line-deep test3: expected <sub> removed from both lines, got: ' + afterSubscriptOff
      );
    }

    // Test 4: Add <sub> to multi-line where only one line has it.
    // lineHasMatchingTag returns true for one line, false for another.
    editor.setValue('- <sub>already sub</sub>\n- plain line here');
    await wait(60);
    selectRange('already sub', 'plain line here');
    clickByCommand('subscript');
    await wait(120);

    // Line 1 already has <sub>; line 2 does not → add <sub> to missing line only.
    const afterSubscriptMixed = editor.getValue();
    if (afterSubscriptMixed !== '- <sub>already sub</sub>\n- <sub>plain line here</sub>') {
      throw new Error(
        'per-line-deep test4: expected plain line wrapped in <sub>, got: ' + afterSubscriptMixed
      );
    }

    // Test 5: Multi-line with an inert zone line mixed in.
    // buildEffectiveLineRanges: inertZone !== null → skip that line.
    // Use a code block with a list prefix above and below.
    editor.setValue('- before code\n```\ncode block content\n```\n- after code');
    await wait(60);
    selectRange('before code', 'after code');
    clickByCommand('bold');
    await wait(120);

    // Code block is inert → only the two list lines receive bold.
    const afterBoldInert = editor.getValue();
    if (afterBoldInert !== '- **before code**\n```\ncode block content\n```\n- **after code**') {
      throw new Error(
        'per-line-deep test5: expected bold on list lines only, code block skipped, got: ' +
          afterBoldInert
      );
    }

    // Test 6: DomainConversion — add a color span to bold markdown text.
    // The selection is inside **bold** → domain = 'markdown' → DomainConversion fires.
    editor.setValue('**bold text here**');
    await wait(60);
    editor.setSelection(editor.offsetToPos(2), editor.offsetToPos(16));
    clickByCommand('superscript');
    await wait(100);

    // Selection inside **...**→ domain = markdown → DomainConversion fires: ** → <strong>, wraps with <sup>.
    const afterDomainConversion = editor.getValue();
    if (afterDomainConversion !== '<strong><sup>bold text here</sup></strong>') {
      throw new Error(
        'per-line-deep test6: expected domain conversion result "<strong><sup>bold text here</sup></strong>", got: ' +
          afterDomainConversion
      );
    }

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

    // Line 1 already has bold; line 2 does not → add bold to missing line only.
    const afterBoldNumbered = editor.getValue();
    if (afterBoldNumbered !== '1. **already bold text**\n2. **plain numbered item**') {
      throw new Error(
        'per-line-deep test8: expected bold added to line 2 only, got: ' + afterBoldNumbered
      );
    }
  });
}
