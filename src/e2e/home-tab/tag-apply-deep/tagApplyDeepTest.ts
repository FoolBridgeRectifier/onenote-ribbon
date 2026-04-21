import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for TagApply.ts and use-tag-handlers/helpers.ts branches:
 *  - callout action on a plain line (basic callout with title)
 *  - callout action on a line already inside a blockquote (nested depth > 0)
 *  - task action: cursor on callout header line with title (cursorIsInCalloutTitle branch)
 *  - task action: line already has a task prefix (existingTaskMatch branch)
 *  - task action: plain line (fallback task creation)
 *  - remove-active-callout path when callout already active (toggle off)
 *  - dropdown select of a callout tag (exercises selectTagFromDropdown callout path)
 */
export async function tagApplyDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tag-apply-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: callout on a plain line — basic callout path, calloutTitle provided.
    editor.setValue('Plain line content');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('important');
    await wait(80);

    // Test 2: callout on a line already inside a blockquote → exercises nested depth path.
    // currentDepth = 1 (one '>') → nestedDepth = 2.
    editor.setValue('> Already blockquoted');
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('question');
    await wait(80);

    // Test 3: task on a callout header line with a title, cursor placed inside the title region.
    // ">" + "[!important]" + " " + "Important" → cursor at ch = 18 (inside "Important").
    // Exercises: calloutHeaderMatch truthy AND cursorIsInCalloutTitle = true.
    editor.setValue('> [!important] Important');
    editor.setCursor({ line: 0, ch: 18 });
    clickByCommand('todo');
    await wait(80);

    // Test 4: task on a line that already has a markdown task pattern.
    // "- [ ] Some content" matches TASK_LINE_WITH_CONTENT_PATTERN →
    // existingTaskMatch branch: strips prefix, rewraps.
    editor.setValue('- [ ] Some content');
    editor.setCursor({ line: 0, ch: 8 });
    clickByCommand('todo');
    await wait(80);

    // Test 5: task on a plain line — plain fallback path.
    editor.setValue('Just a plain sentence');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('todo');
    await wait(80);

    // Test 6: remove-active-callout path — click important when callout is already active.
    // First apply important to add callout, then click again → activeTagKeys has 'Important'
    // → removeActiveCallout branch fires.
    editor.setValue('Toggle target line');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('important');
    await wait(80);

    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('important');
    await wait(80);

    // Test 7: open more-tags dropdown and click "Critical" callout tag →
    // exercises selectTagFromDropdown with a non-active callout action type.
    editor.setValue('Dropdown target');
    editor.setCursor({ line: 0, ch: 0 });
    const moreButton = document.querySelector('[data-cmd="more-tags"]');

    if (moreButton) {
      moreButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(120);

      const criticalItem = document.querySelector('[data-cmd="tag-critical"]');

      if (criticalItem) {
        criticalItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(80);
      }
    }
  });
}
