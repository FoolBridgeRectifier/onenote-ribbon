import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for multi-line formatting paths.
 * Exercises:
 *  - shouldProcessPerLine → true (multi-line selection with list prefixes)
 *  - toggleTagPerLine / addTagPerLine (PerLineProcessing.ts)
 *  - lineHasMatchingTag branches (tag already present on some lines)
 *  - TagToggle when cursor is in an inert range (code block)
 *  - mutuallyExclusiveScriptTag path (bold on a line that has sub/superscript)
 */
export async function multilineFormattingDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite(
    'multiline-formatting-deep',
    async ({ clickByCommand, editor, selectToken, wait }) => {
      // Helper to select a range from startText to endText across multiple lines
      const selectRange = (startText: string, endText: string) => {
        const value = editor.getValue();
        const startIndex = value.indexOf(startText);
        const endIndex = value.indexOf(endText) + endText.length;
        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Range not found: ' + startText + ' ... ' + endText);
        }
        editor.setSelection(editor.offsetToPos(startIndex), editor.offsetToPos(endIndex));
      };

      // Test 1: Apply bold to a multi-line list selection.
      // This triggers shouldProcessPerLine → true → toggleTagPerLine.
      editor.setValue('- first line\n- second line\n- third line');
      await wait(60);
      selectRange('first line', 'second line');
      clickByCommand('bold');
      await wait(120);

      const afterMultilineBold = editor.getValue();
      if (afterMultilineBold !== '- **first line**\n- **second line**\n- third line') {
        throw new Error('Multi-line bold (per-line): ' + afterMultilineBold);
      }

      // Test 2: Apply bold to multi-line where some lines already have bold.
      // This triggers lineHasMatchingTag returning true on some lines.
      editor.setValue('- **already bold**\n- plain line');
      await wait(60);
      selectRange('already bold', 'plain line');
      clickByCommand('bold');
      await wait(120);

      // Test 3: Apply italic to multi-line numbered list.
      editor.setValue('1. first item\n2. second item\n3. third item');
      await wait(60);
      selectRange('first item', 'second item');
      clickByCommand('italic');
      await wait(120);

      // Test 4: Apply formatting to a heading (structured prefix line).
      editor.setValue('# My Heading\n## Sub Heading');
      await wait(60);
      selectRange('My Heading', 'Sub Heading');
      clickByCommand('bold');
      await wait(120);

      // Test 5: Apply formatting to a callout body (blockquote prefix lines).
      // This exercises inert-range detection and shouldProcessPerLine on callout lines.
      editor.setValue('> [!info]\n> first callout line\n> second callout line');
      await wait(60);
      selectRange('first callout line', 'second callout line');
      clickByCommand('bold');
      await wait(120);

      // Test 6: Toggle bold when cursor is inside a code fence (inert zone).
      // This exercises structureContext.isFullyInert → true → return no-op.
      editor.setValue('```\ncode content here\n```');
      await wait(60);
      selectToken('code content here');
      clickByCommand('bold');
      await wait(80);

      // Test 7: Apply subscript then superscript on the same selection.
      // Exercises mutuallyExclusiveScriptTag: applying superscript removes subscript.
      editor.setValue('some text here');
      await wait(60);
      selectToken('some text here');
      clickByCommand('subscript');
      await wait(80);

      // Now apply superscript — should remove the sub tag first (mutually exclusive path)
      selectToken('some text here');
      clickByCommand('superscript');
      await wait(80);
    }
  );
}
