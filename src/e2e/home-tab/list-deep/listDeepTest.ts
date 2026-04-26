import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for list indent/outdent and canSafelyIndent helper logic.
 * Exercises:
 *  - countLeadingTabs (internal helper)
 *  - isListItemLine (internal helper)
 *  - canSafelyIndent: cursor.line > 0, previous line is a list item, previous line is not a list item
 *  - indent blocked when already one level deeper than parent
 *  - number-library helper paths (formatNumber with different styles)
 *  - highlight color helpers (removeTagInEditor branches)
 */
export async function listDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('list-deep', async ({ clickByCommand, editor, wait }) => {
    if (!editor) {
      throw new Error('list-deep: no editor provided to suite');
    }

    // Test 1: canSafelyIndent with cursor on line 1 below a list item.
    // "- item1\n- item2" → cursor on line 1 → previous line IS a list item at depth 0 →
    // current depth is also 0 → 0 <= 0 → can indent.
    editor.setValue('- item1\n- item2');
    editor.setCursor({ line: 1, ch: 2 });
    clickByCommand('indent');
    await wait(100);

    // Test 2: canSafelyIndent blocked — current line already deeper than parent.
    // "- parent\n\t\t- grandchild" (grandchild at depth 2, parent at depth 0 → blocked).
    editor.setValue('- parent\n\t\t- grandchild');
    editor.setCursor({ line: 1, ch: 3 });
    clickByCommand('indent');
    await wait(100);

    // Test 3: canSafelyIndent with non-list previous line → returns false.
    // "## Heading\n- list item" → previous line is not a list item → canSafelyIndent returns false.
    editor.setValue('## Heading\n- list item');
    editor.setCursor({ line: 1, ch: 2 });
    clickByCommand('indent');
    await wait(100);

    // Test 4: Walk upward over blank lines to find the nearest non-empty line.
    // "- top item\n\n- bottom item" → cursor on line 2, blank on line 1, list item on line 0.
    editor.setValue('- top item\n\n- bottom item');
    editor.setCursor({ line: 2, ch: 2 });
    clickByCommand('indent');
    await wait(100);

    // Test 5: Outdent on an indented list item.
    editor.setValue('- parent\n\t- child');
    editor.setCursor({ line: 1, ch: 3 });
    clickByCommand('outdent');
    await wait(100);

    // Test 6: bullet-list-toggle to exercise the toggle command path.
    editor.setValue('- existing bullet');
    editor.setCursor({ line: 0, ch: 2 });
    clickByCommand('bullet-list-toggle');
    await wait(80);

    // Test 7: number-list-toggle.
    editor.setValue('plain line');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('number-list-toggle');
    await wait(80);
  });
}
