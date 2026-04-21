import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for TagApply.ts and use-tag-handlers/helpers.ts branches:
 *  - callout on plain line (basic callout with title)
 *  - callout on blockquote line (nested depth > 0)
 *  - task on callout header: cursor inside title (ch:18) — always inserts on next line
 *  - task on callout header: cursor at start (ch:0) — Fix 1 regression guard
 *  - task on existing task line (existingTaskMatch branch — idempotent)
 *  - task on plain line (fallback task creation)
 *  - remove-active-callout path when callout already active (toggle off)
 *  - dropdown select of a callout tag (selectTagFromDropdown callout path)
 *  - callout on checkbox line — marker stripped from body (Fix 2 regression guard)
 */
export async function tagApplyDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tag-apply-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: callout on a plain line — basic callout path, calloutTitle provided.
    editor.setValue('Plain line content');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('important');
    await wait(80);

    const afterPlainCallout = editor.getValue();
    if (afterPlainCallout !== '> [!important] Important\n> Plain line content') {
      throw new Error('Callout on plain line: ' + afterPlainCallout);
    }

    // Test 2: callout on a blockquote line → nested depth path (currentDepth = 1 → prefix = '>>').
    editor.setValue('> Already blockquoted');
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('question');
    await wait(80);

    const afterNestedCallout = editor.getValue();
    if (afterNestedCallout !== '>> [!question] Question\n>> Already blockquoted') {
      throw new Error('Nested callout: ' + afterNestedCallout);
    }

    // Test 3: task on callout header — cursor inside the title region (ch:18).
    // calloutHeaderMatch fires for ANY cursor position; checkbox always goes to next line.
    editor.setValue('> [!important] Important');
    editor.setCursor({ line: 0, ch: 18 });
    clickByCommand('todo');
    await wait(80);

    const afterTaskInTitle = editor.getValue();
    if (afterTaskInTitle !== '> [!important] Important\n> - [ ] ') {
      throw new Error('Task on callout header (ch:18): ' + afterTaskInTitle);
    }

    // Test 4 (Fix 1 regression): task on callout header — cursor at start of line (ch:0).
    // Before Fix 1, ch:0 corrupted the header: '> - [ ] [!important] Important'.
    editor.setValue('> [!important] Important');
    editor.setCursor({ line: 0, ch: 0 });
    await wait(80);
    clickByCommand('todo');
    await wait(80);

    const afterTaskAtStart = editor.getValue();
    if (afterTaskAtStart !== '> [!important] Important\n> - [ ] ') {
      throw new Error('Task on callout header (ch:0): ' + afterTaskAtStart);
    }

    // Test 5: task on a line that already has a markdown task pattern — idempotent.
    editor.setValue('- [ ] Some content');
    editor.setCursor({ line: 0, ch: 8 });
    clickByCommand('todo');
    await wait(80);

    const afterExistingTask = editor.getValue();
    if (afterExistingTask !== '- [ ] Some content') {
      throw new Error('Task on existing task (idempotent): ' + afterExistingTask);
    }

    // Test 6: task on a plain line — plain fallback path.
    editor.setValue('Just a plain sentence');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('todo');
    await wait(80);

    const afterPlainTask = editor.getValue();
    if (afterPlainTask !== '- [ ] Just a plain sentence') {
      throw new Error('Task on plain line: ' + afterPlainTask);
    }

    // Test 7: remove-active-callout toggle-off — apply Important, then click again to remove.
    editor.setValue('Toggle target line');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('important');
    await wait(80);

    // Cursor on header (ch:5); hook re-renders activeTagKeys after the 80ms wait.
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('important');
    await wait(80);

    const afterToggleOff = editor.getValue();
    if (afterToggleOff !== 'Toggle target line') {
      throw new Error('Callout toggle-off: ' + afterToggleOff);
    }

    // Test 8: dropdown Critical callout via more-tags menu.
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

    const afterDropdownCallout = editor.getValue();
    if (afterDropdownCallout !== '> [!danger] Critical\n> Dropdown target') {
      throw new Error('Dropdown callout (Critical): ' + afterDropdownCallout);
    }

    // Test 9 (Fix 2 regression): callout on an unchecked checkbox line.
    // Before Fix 2, the '- [ ] ' marker was preserved in the callout body.
    editor.setValue('- [ ] Follow up with team');
    editor.setCursor({ line: 0, ch: 0 });
    // Wait for activeTagKeys to reflect the new plain-checkbox line (no active callout).
    await wait(200);
    clickByCommand('important');
    await wait(80);

    const afterCalloutOnCheckbox = editor.getValue();
    if (afterCalloutOnCheckbox !== '> [!important] Important\n> Follow up with team') {
      throw new Error('Callout on checkbox line (marker not stripped): ' + afterCalloutOnCheckbox);
    }
  });
}
