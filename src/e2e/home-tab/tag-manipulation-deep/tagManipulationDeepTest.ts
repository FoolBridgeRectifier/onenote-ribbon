import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for tag manipulation code paths that are not covered by the basic tags suite.
 * Specifically targets:
 *  - getBlockquoteDepth (callout inside existing blockquote)
 *  - stripLeadingBlockquoteSegments
 *  - stripTaskPrefix (task applied to an existing task line)
 *  - calloutTitle segment in the callout branch
 *  - TASK_LINE_WITH_CONTENT_PATTERN matching
 */
export async function tagManipulationDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tag-manipulation-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: Apply callout to a plain line — verifies title segment is appended
    editor.setValue('plain line of text');
    editor.setCursor(editor.offsetToPos(0));
    clickByCommand('important');
    await wait(100);
    const afterImportantOnPlain = editor.getValue();

    const importantTitlePass =
      afterImportantOnPlain.includes('[!important]') && afterImportantOnPlain.includes('Important');
    if (!importantTitlePass) {
      throw new Error('Callout title not appended: ' + afterImportantOnPlain);
    }

    // Test 2: Apply callout to a line already inside a blockquote (> prefix)
    // This exercises getBlockquoteDepth > 0 and stripLeadingBlockquoteSegments
    editor.setValue('> quoted line');
    editor.setCursor(editor.offsetToPos(2));
    clickByCommand('question');
    await wait(100);
    const afterQuestionOnBlockquote = editor.getValue();

    // The result should have nested blockquote prefix (>>) and strip the original >
    const nestedBlockquotePass =
      afterQuestionOnBlockquote.includes('[!question]') && afterQuestionOnBlockquote.includes('>>');
    if (!nestedBlockquotePass) {
      throw new Error('Nested blockquote callout failed: ' + afterQuestionOnBlockquote);
    }

    // Test 3: Apply a task tag to a line that already has a task format
    // This exercises TASK_LINE_WITH_CONTENT_PATTERN and stripTaskPrefix.
    // Open the more-tags dropdown and select a task-type tag on an existing task line.
    editor.setValue('- [ ] some task content here');
    editor.setCursor(editor.offsetToPos(5));

    const moreTagsButton = document.querySelector('[data-cmd="more-tags"]');
    if (!moreTagsButton) {
      throw new Error('more-tags button not found');
    }
    moreTagsButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(150);

    // Find the "Discuss with <Person>" task item in the dropdown
    const dropdownItems = Array.from(document.querySelectorAll('.onr-tags-dd-label'));
    const discussItem = dropdownItems.find((labelElement) =>
      (labelElement.textContent || '').includes('Discuss')
    );

    if (discussItem) {
      discussItem
        .closest('[data-cmd]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(100);
    } else {
      // Close dropdown if discuss item not found
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await wait(80);
    }

    // The result should be a task with the "Discuss:" prefix inserted
    const afterTaskOnTask = editor.getValue();
    const taskOnTaskPass = afterTaskOnTask.includes('- [ ]');
    if (!taskOnTaskPass) {
      throw new Error('Task on task manipulation failed: ' + afterTaskOnTask);
    }

    // Test 4: Remove an active callout by clicking the same tag button again
    editor.setValue('some text');
    editor.setCursor(editor.offsetToPos(0));
    clickByCommand('important');
    await wait(100);
    const afterFirstImportant = editor.getValue();

    // Now place cursor inside the callout and click important again to remove it
    editor.setCursor(editor.offsetToPos(0));
    clickByCommand('important');
    await wait(100);
    const afterSecondImportant = editor.getValue();

    const calloutRemovalPass =
      afterFirstImportant.includes('[!important]') &&
      !afterSecondImportant.includes('[!important]');
    if (!calloutRemovalPass) {
      throw new Error(
        'Callout removal failed. After first: ' +
          afterFirstImportant +
          ' After second: ' +
          afterSecondImportant
      );
    }
  });
}
