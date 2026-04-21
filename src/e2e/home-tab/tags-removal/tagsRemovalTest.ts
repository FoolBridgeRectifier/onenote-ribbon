import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for inline #todo tag removal — exercises the removeTodoTagFromLine
 * path in ToggleInlineTodoTag.ts (lines 22-31) that is never reached by the
 * basic tags integration test.
 *
 * That function is called when: no text is selected, but the cursor position
 * is inside an existing #todo tag on the current line.
 */
export async function tagsRemovalTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('tags-removal', async ({ clickByCommand, editor, wait }) => {
    // Test 1: Remove #todo when cursor is inside the tag (no selection).
    // 'note content #todo action required'
    //  0         1         2
    //  0123456789012345678901234567890
    // #todo starts at index 13, ends at 18 (exclusive).
    // Setting cursor at ch=15 puts it inside #todo (15 >= 13 && 15 <= 18).
    editor.setValue('note content #todo action required');
    editor.setCursor({ line: 0, ch: 15 });
    clickByCommand('todo-tag');
    await wait(100);

    const afterRemoval = editor.getValue();
    const todoRemovedPass = !afterRemoval.includes('#todo');
    if (!todoRemovedPass) {
      throw new Error('inline #todo removal failed — tag still present: ' + afterRemoval);
    }

    // The surrounding text should be preserved (with the extra space collapsed)
    const textPreservedPass =
      afterRemoval.includes('note content') && afterRemoval.includes('action required');
    if (!textPreservedPass) {
      throw new Error('surrounding text lost after #todo removal: ' + afterRemoval);
    }

    // Test 2: Remove #todo when the selection IS exactly "#todo" (the other toggle-off path).
    editor.setValue('#todo');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    clickByCommand('todo-tag');
    await wait(100);

    const afterSelectionRemoval = editor.getValue();
    const selectionRemovalPass = !afterSelectionRemoval.includes('#todo');
    if (!selectionRemovalPass) {
      throw new Error('selection-based #todo removal failed: ' + afterSelectionRemoval);
    }

    // Test 3: Add a new #todo when cursor is on a plain line (no existing #todo).
    // This is the happy-path add — ensure it works after the removal tests.
    editor.setValue('plain meeting note');
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('todo-tag');
    await wait(100);

    const afterAdd = editor.getValue();
    const todoAddedPass = afterAdd.includes('#todo');
    if (!todoAddedPass) {
      throw new Error('#todo add failed after removal tests: ' + afterAdd);
    }
  });
}
