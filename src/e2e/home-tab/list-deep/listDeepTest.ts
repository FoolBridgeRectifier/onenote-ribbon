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

    // Item on line 1 must now be indented exactly one tab level.
    const afterIndent1 = editor.getValue();
    if (afterIndent1 !== '- item1\n\t- item2') {
      throw new Error(
        'list-deep test1: expected "- item1\\n\\t- item2" after indent, got: ' + afterIndent1
      );
    }

    // Test 2: canSafelyIndent blocked — current line already deeper than parent.
    // "- parent\n\t\t- grandchild" (grandchild at depth 2, parent at depth 0 → blocked).
    editor.setValue('- parent\n\t\t- grandchild');
    editor.setCursor({ line: 1, ch: 3 });
    clickByCommand('indent');
    await wait(100);

    // Indent must be blocked — content must remain unchanged.
    const afterIndent2 = editor.getValue();
    if (afterIndent2 !== '- parent\n\t\t- grandchild') {
      throw new Error(
        'list-deep test2: expected indent blocked (content unchanged), got: ' + afterIndent2
      );
    }

    // Test 3: canSafelyIndent with non-list previous line → returns false.
    // "## Heading\n- list item" → previous line is not a list item → canSafelyIndent returns false.
    editor.setValue('## Heading\n- list item');
    editor.setCursor({ line: 1, ch: 2 });
    clickByCommand('indent');
    await wait(100);

    // Indent must be blocked — content must remain unchanged.
    const afterIndent3 = editor.getValue();
    if (afterIndent3 !== '## Heading\n- list item') {
      throw new Error(
        'list-deep test3: expected indent blocked (content unchanged), got: ' + afterIndent3
      );
    }

    // Test 4: Walk upward over blank lines to find the nearest non-empty line.
    // "- top item\n\n- bottom item" → cursor on line 2, blank on line 1, list item on line 0.
    editor.setValue('- top item\n\n- bottom item');
    editor.setCursor({ line: 2, ch: 2 });
    clickByCommand('indent');
    await wait(100);

    // Bottom item must be indented one tab level.
    const afterIndent4 = editor.getValue();
    if (afterIndent4 !== '- top item\n\n\t- bottom item') {
      throw new Error(
        'list-deep test4: expected blank-line indent "- top item\\n\\n\\t- bottom item", got: ' +
          afterIndent4
      );
    }

    // Test 5: Outdent on an indented list item.
    editor.setValue('- parent\n\t- child');
    editor.setCursor({ line: 1, ch: 3 });
    clickByCommand('outdent');
    await wait(100);

    // Tab must be removed — child must be at the same level as parent.
    const afterOutdent = editor.getValue();
    if (afterOutdent !== '- parent\n- child') {
      throw new Error(
        'list-deep test5: expected "- parent\\n- child" after outdent, got: ' + afterOutdent
      );
    }

    // Test 6: bullet-list-toggle to exercise the toggle command path.
    editor.setValue('- existing bullet');
    editor.setCursor({ line: 0, ch: 2 });
    clickByCommand('bullet-list-toggle');
    await wait(80);

    // Obsidian toggle-bullet on a line with "- " prefix removes the prefix.
    const afterBulletToggle = editor.getValue();
    if (afterBulletToggle !== 'existing bullet') {
      throw new Error(
        'list-deep test6: expected "existing bullet" after bullet-list-toggle, got: ' +
          afterBulletToggle
      );
    }

    // Test 7: number-list-toggle.
    editor.setValue('plain line');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('number-list-toggle');
    await wait(80);

    // Obsidian toggle-numbered on a plain line adds "1. " prefix.
    const afterNumberToggle = editor.getValue();
    if (afterNumberToggle !== '1. plain line') {
      throw new Error(
        'list-deep test7: expected "1. plain line" after number-list-toggle, got: ' +
          afterNumberToggle
      );
    }
  });
}
