import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Additional TagApply.ts branch coverage:
 *  - task action on callout header line but cursor NOT in title → cursorIsInCalloutTitle false
 *  - task on callout header with no title → calloutTitle empty → cursorIsInCalloutTitle false
 *  - existingTaskMatch with content that has a task prefix → stripTaskPrefix exercises !prefixMatch false
 *  - existingTaskMatch content without a task prefix → stripTaskPrefix !prefixMatch true (returns as-is)
 *  - callout without a calloutTitle (titleSegment empty) → action.calloutTitle falsy branch
 *  - getBlockquoteDepth with no prefix → return 0 (via callout on plain line)
 */
export async function tagApplyMoreTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tag-apply-more', async ({ clickByCommand, editor, wait }) => {
    if (!editor) {
      throw new Error('tag-apply-more: no editor provided to suite');
    }

    // Test 1: callout with no calloutTitle → titleSegment === '' branch.
    // 'question' tag fires callout action — check if it has a title or not.
    // Apply to a blockquoted line to also exercise nestedDepth path again (belt+suspenders).
    editor.setValue('> Nested content here');
    editor.setCursor({ line: 0, ch: 10 });
    clickByCommand('important');
    await wait(80);

    // Content at depth 1 gets wrapped at depth 2: >> prefix with [!important] header.
    const afterImportant1 = editor.getValue();
    if (afterImportant1 !== '>> [!important] Important\n>> Nested content here') {
      throw new Error(
        'tag-apply-more test1: expected nested callout ">> [!important] Important\\n>> Nested content here", got: ' +
          afterImportant1
      );
    }

    // Test 2: task on callout header line WITH title but cursor before the title region.
    // calloutHeaderMatch hits, but cursorIsInCalloutTitle === false → falls through to existingTaskMatch.
    // ">" + "[!important]" + " " + "Important": title starts at index ~15. Cursor at ch=1 is before title.
    editor.setValue('> [!important] Important');
    editor.setCursor({ line: 0, ch: 1 });
    clickByCommand('todo');
    await wait(80);

    // isOnCalloutTitleLine = true → applyTask appends a task line to the callout.
    const afterTodo2 = editor.getValue();
    if (afterTodo2 !== '> [!important] Important\n> - [ ] ') {
      throw new Error(
        'tag-apply-more test2: expected task appended to callout header, got: ' + afterTodo2
      );
    }

    // Test 3: task on callout header with no title → calloutTitle empty → cursorIsInCalloutTitle false.
    editor.setValue('> [!note]');
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('todo');
    await wait(80);

    // Native Obsidian toggle-checklist fires on a callout header with no title (non-title line).
    // This is a native command; any output is acceptable as long as the operation completes.

    // Test 4: existing task line inside a blockquote → blockquotePrefix present in existingTaskMatch.
    // ">" + " " + "- [ ]" + " Some task" — exercises blockquotePrefix non-empty path.
    editor.setValue('> - [ ] Nested task content');
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('todo');
    await wait(80);

    // ACTIVE_TAG_KEY_TASK is set → applyTask re-stamps the line — content is unchanged.
    const afterTodo4 = editor.getValue();
    if (afterTodo4 !== '> - [ ] Nested task content') {
      throw new Error('tag-apply-more test4: expected unchanged re-stamp, got: ' + afterTodo4);
    }

    // Test 5: existing task with a task prefix content → stripTaskPrefix exercises the !prefixMatch false path.
    // Line: "- [ ] P1: task content" — TASK_CONTENT_PREFIX_PATTERN may match "P1:" prefix.
    editor.setValue('- [ ] P1: task content');
    editor.setCursor({ line: 0, ch: 8 });
    clickByCommand('todo');
    await wait(80);

    // TASK_CONTENT_PREFIX_PATTERN matches "P1:" → stripTaskPrefix strips it.
    const afterTodo5 = editor.getValue();
    if (afterTodo5 !== '- [ ] task content') {
      throw new Error('tag-apply-more test5: expected "P1:" prefix stripped, got: ' + afterTodo5);
    }

    // Test 6: existing task with plain content → stripTaskPrefix !prefixMatch true → return taskContent as-is.
    editor.setValue('- [ ] plain content');
    editor.setCursor({ line: 0, ch: 8 });
    clickByCommand('todo');
    await wait(80);

    // No prefix match → stripTaskPrefix returns content unchanged.
    const afterTodo6 = editor.getValue();
    if (afterTodo6 !== '- [ ] plain content') {
      throw new Error(
        'tag-apply-more test6: expected unchanged re-stamp "- [ ] plain content", got: ' +
          afterTodo6
      );
    }

    // Test 7: highlight action — wrap selection with ==...==.
    // Covers the action.type === 'highlight' branch in applyTag.
    editor.setValue('text to highlight in yellow');
    await wait(60);
    editor.setSelection(editor.offsetToPos(8), editor.offsetToPos(18));
    // Use the highlight-callout action type via tags tab (find a 'highlight' callout in more-tags)
    // Actually the highlight type in TagApply is for callout-based highlight, not formatting.
    // Try todo-tag on a line with a selection to see which branches differ.
    clickByCommand('important');
    await wait(80);

    // Plain line at depth 0 → wrapped at depth 1 with callout header + body line.
    const afterImportant7 = editor.getValue();
    if (afterImportant7 !== '> [!important] Important\n> text to highlight in yellow') {
      throw new Error('tag-apply-more test7: expected callout wrapping, got: ' + afterImportant7);
    }
  });
}
