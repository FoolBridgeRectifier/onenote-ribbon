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
});
