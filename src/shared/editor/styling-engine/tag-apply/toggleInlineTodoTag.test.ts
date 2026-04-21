import { MockEditor } from '../../../../test-utils/MockEditor';
import { toggleInlineTodoTag } from './helpers';

describe('toggleInlineTodoTag', () => {
  it('inserts #todo at cursor when no #todo exists at cursor', () => {
    const editor = new MockEditor();
    editor.setValue('Follow up');
    editor.setCursor({ line: 0, ch: 0 });

    toggleInlineTodoTag(editor as any);

    expect(editor.getValue()).toBe('#todoFollow up');
  });

  it('removes #todo when cursor is inside the token', () => {
    const editor = new MockEditor();
    editor.setValue('Please #todo this');
    editor.setCursor({ line: 0, ch: 9 });

    toggleInlineTodoTag(editor as any);

    expect(editor.getValue()).toBe('Please this');
  });

  it('removes selected #todo text', () => {
    const editor = new MockEditor();
    editor.setValue('#todo task');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    toggleInlineTodoTag(editor as any);

    expect(editor.getValue()).toBe(' task');
  });

  it('replaces non-empty selection with #todo', () => {
    const editor = new MockEditor();
    editor.setValue('urgent task');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 6 });

    toggleInlineTodoTag(editor as any);

    expect(editor.getValue()).toBe('#todo task');
  });

  it('removes only one space when #todo is between words', () => {
    const editor = new MockEditor();
    editor.setValue('A #todo B');
    editor.setCursor({ line: 0, ch: 4 });

    toggleInlineTodoTag(editor as any);

    expect(editor.getValue()).toBe('A B');
  });

  it('inserts #todo at cursor when cursor is before an existing #todo in the line', () => {
    // Cursor at ch=0 is before the #todo at index 7.
    // findTodoTagAtCursor iterates the match but cursorCh(0) >= startIndex(7) is FALSE
    // → returns null → inserts #todo at cursor position instead of removing existing one.
    const editor = new MockEditor();
    editor.setValue('finish #todo later');
    editor.setCursor({ line: 0, ch: 0 });

    toggleInlineTodoTag(editor as any);

    expect(editor.getValue()).toBe('#todofinish #todo later');
  });

  it('removes #todo without extra space adjustment when it starts the line (no leading space)', () => {
    // beforeTag is '' (empty, does not end with space) → the space-removal condition is false
    // → afterTag is kept as-is (covers the false branch of the space-adjustment condition)
    const editor = new MockEditor();
    editor.setValue('#todo task');
    // Cursor at ch=2 is inside '#todo' (startIndex=0, endIndex=5)
    editor.setCursor({ line: 0, ch: 2 });

    toggleInlineTodoTag(editor as any);

    // '#todo' removed; 'afterTag' is ' task' but no space removed (beforeTag='' doesn't end with space)
    expect(editor.getValue()).toBe(' task');
  });
});
