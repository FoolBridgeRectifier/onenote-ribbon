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
    // Test 1: selection === '#todo' → replaceSelection('').
    // Setting selection to exactly '#todo' triggers the "remove tag" branch.
    editor.setValue('#todo');
    await wait(60);
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    clickByCommand('todo-tag');
    await wait(80);

    // Test 2: selection is non-empty but not '#todo' → replaceSelection('#todo') (insert branch).
    // This is already likely covered but ensures the `selection.length > 0` true branch is hit
    // with a non-matching selection value.
    editor.setValue('some plain text');
    await wait(60);
    editor.setSelection(editor.offsetToPos(5), editor.offsetToPos(10));
    clickByCommand('todo-tag');
    await wait(80);

    // Test 3: cursor inside existing #todo tag → !todoTagMatch === false → removeTodoTagFromLine.
    // Cursor at position 7 (inside the '#todo' token).
    editor.setValue('text #todo more');
    await wait(60);
    editor.setCursor({ line: 0, ch: 7 });
    clickByCommand('todo-tag');
    await wait(80);

    // Test 4: removeTodoTagFromLine double-space collapse.
    // 'before #todo after': beforeTag = 'before ', afterTag = ' after'
    // → beforeTag.endsWith(' ') && afterTag.startsWith(' ') → remove one space → 'before after'.
    editor.setValue('before #todo after');
    await wait(60);
    // Position cursor at ch=10 (inside '#todo')
    editor.setCursor({ line: 0, ch: 10 });
    clickByCommand('todo-tag');
    await wait(80);

    // Test 5: cursor NOT inside any #todo (no match) → replaceSelection('#todo') insert.
    // This tests the !todoTagMatch === true branch (cursor elsewhere).
    editor.setValue('hello world');
    await wait(60);
    editor.setCursor({ line: 0, ch: 5 });
    clickByCommand('todo-tag');
    await wait(80);
  });
}
