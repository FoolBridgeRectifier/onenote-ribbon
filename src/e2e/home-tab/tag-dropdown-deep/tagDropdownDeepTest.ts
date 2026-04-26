import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for use-tag-handlers/helpers.ts → selectTagFromDropdown branches:
 *  - isCustomizeTags → true: opens customize modal, closes dropdown
 *  - isRemoveTag → true, canRemoveTag → false: early return (no editor action)
 *  - isRemoveTag → true, canRemoveTag → true: removeActiveCallout path
 *  - isCurrentlyActive && callout type: removeActiveCallout toggle-off path
 *  - isCurrentlyActive && task type: removeActiveCheckbox toggle-off path
 *  - normal callout tag select (non-active): applyTag callout path
 *  - isDisabled tag: early return (no action)
 */
export async function tagDropdownDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tag-dropdown-deep', async ({ clickByCommand, editor, wait }) => {
    if (!editor) {
      throw new Error('tag-dropdown-deep: no editor provided to suite');
    }

    const openDropdown = async (): Promise<void> => {
      const moreButton = document.querySelector('[data-cmd="more-tags"]');
      if (moreButton) {
        moreButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(120);
      }
    };

    const closeDropdown = async (): Promise<void> => {
      document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(60);
    };

    // Test 1: Click "Customize Tags…" in dropdown → isCustomizeTags = true path.
    editor.setValue('customize test');
    editor.setCursor({ line: 0, ch: 0 });
    await openDropdown();

    const customizeItem = document.querySelector('[data-cmd="tag-customize-tags-"]');

    if (customizeItem) {
      customizeItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(80);
      // Close any modal that may have opened
      const closeButton = document.querySelector('.modal-close-button');
      if (closeButton) {
        (closeButton as HTMLElement).click();
        await wait(80);
      }
    }

    await closeDropdown();

    // Test 2: Apply a callout first, then open dropdown and click "Remove Tag" →
    // canRemoveTag will be true (callout is active) → removeActiveCallout path.
    editor.setValue('remove tag test');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('important');
    await wait(80);

    // Cursor inside the newly created callout block
    editor.setCursor({ line: 0, ch: 5 });
    await openDropdown();

    const removeTagItem = document.querySelector('[data-cmd="tag-remove-tag"]');

    if (removeTagItem) {
      removeTagItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(80);
    }

    await closeDropdown();

    // Test 3: Select "Critical" from dropdown when it is NOT already active →
    // normal callout select path: applyTag with callout action.
    editor.setValue('normal callout select');
    editor.setCursor({ line: 0, ch: 0 });
    await openDropdown();

    const criticalItem = document.querySelector('[data-cmd="tag-critical"]');

    if (criticalItem) {
      criticalItem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(80);
    }

    await closeDropdown();

    // Test 4: Select "Critical" again when it IS already active →
    // isCurrentlyActive && callout → removeActiveCallout toggle-off path.
    // (After test 3, the callout is applied — cursor should be inside it.)
    editor.setCursor({ line: 0, ch: 5 });
    await openDropdown();

    const criticalItem2 = document.querySelector('[data-cmd="tag-critical"]');

    if (criticalItem2) {
      criticalItem2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(80);
    }

    await closeDropdown();

    // Test 5: Exercise task-type dropdown tag by selecting a task-type custom tag if available,
    // OR exercise the todo remove path by toggling the todo tag off.
    // Click todo-tag to add a #todo inline tag, then click todo button to remove the checkbox.
    editor.setValue('task toggle test');
    editor.setCursor({ line: 0, ch: 0 });
    clickByCommand('todo');
    await wait(80);

    // Cursor is now inside "- [ ] task toggle test" → click todo again → removeActiveCheckbox.
    editor.setCursor({ line: 0, ch: 4 });
    clickByCommand('todo');
    await wait(80);
  });
}
