import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for ToggleInlineTodoTag.ts uncovered branches:
 *  - selection === '#todo' → replaceSelection('') (remove selected tag)
 *  - !todoTagMatch === false → removeTodoTagFromLine (cursor inside #todo tag)
 *  - removeTodoTagFromLine double-space collapse branch
 *    (beforeTag ends with ' ' AND afterTag starts with ' ' → remove one space)
 *  Also exercises UseTagHandlers.ts handleToDoTag path.
 */
export async function inlineTodoDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('inline-todo-deep', async ({ clickByCommand, editor, wait }) => {
    // Test 1: selection === '#todo' → replaceSelection('') (remove the selected tag).
    editor.setValue('#todo');
    await wait(60);
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    clickByCommand('todo-tag');
    await wait(80);

    const afterSelectedTagRemoval = editor.getValue();
    if (afterSelectedTagRemoval !== '') {
      throw new Error('Selected #todo removal: ' + afterSelectedTagRemoval);
    }

    // Test 2: selection is non-empty and not '#todo' → replaceSelection('#todo').
    // Selects 'plain' (offset 5-10) in 'some plain text' and replaces it with '#todo'.
    editor.setValue('some plain text');
    await wait(60);
    editor.setSelection(editor.offsetToPos(5), editor.offsetToPos(10));
    clickByCommand('todo-tag');
    await wait(80);

    const afterSelectionInsert = editor.getValue();
    if (afterSelectionInsert !== 'some #todo text') {
      throw new Error('Selection replaced with #todo: ' + afterSelectionInsert);
    }

    // Test 3: cursor inside existing #todo tag → !todoTagMatch === false → removeTodoTagFromLine.
    editor.setValue('text #todo more');
    await wait(60);
    editor.setCursor({ line: 0, ch: 7 });
    clickByCommand('todo-tag');
    await wait(80);

    const afterCursorInsideRemoval = editor.getValue();
    if (afterCursorInsideRemoval !== 'text more') {
      throw new Error('Cursor-inside #todo removal: ' + afterCursorInsideRemoval);
    }

    // Test 4: removeTodoTagFromLine double-space collapse.
    // 'before #todo after': beforeTag ends with ' ', afterTag starts with ' '
    // → one space is removed → 'before after'.
    editor.setValue('before #todo after');
    await wait(60);
    editor.setCursor({ line: 0, ch: 10 });
    clickByCommand('todo-tag');
    await wait(80);

    const afterDoubleSpaceCollapse = editor.getValue();
    if (afterDoubleSpaceCollapse !== 'before after') {
      throw new Error('Double-space collapse on #todo removal: ' + afterDoubleSpaceCollapse);
    }

    // Test 5: cursor NOT inside any #todo → insert '#todo' at cursor position.
    editor.setValue('hello world');
    await wait(60);
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('todo-tag');
    await wait(80);

    const afterInsertAtCursor = editor.getValue();
    if (afterInsertAtCursor !== 'hello#todo world') {
      throw new Error('Insert #todo at cursor: ' + afterInsertAtCursor);
    }
  });
}
