import { MockEditor } from '../../../../../../../test-utils/MockEditor';
import { removeActiveCheckbox } from '../removeActiveCheckbox';

describe('removeActiveCheckbox', () => {
  it('removes an unchecked checkbox marker from the current line', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Follow up');
    editor.setCursor({ line: 0, ch: 3 });

    removeActiveCheckbox(editor as any);

    expect(editor.getValue()).toBe('Follow up');
  });

  it('removes a checked checkbox marker from the current line', () => {
    const editor = new MockEditor();
    editor.setValue('- [x] Done item');
    editor.setCursor({ line: 0, ch: 4 });

    removeActiveCheckbox(editor as any);

    expect(editor.getValue()).toBe('Done item');
  });

  it('preserves indentation while removing the checkbox marker', () => {
    const editor = new MockEditor();
    editor.setValue('  - [ ] Indented item');
    editor.setCursor({ line: 0, ch: 6 });

    removeActiveCheckbox(editor as any);

    expect(editor.getValue()).toBe('  Indented item');
  });

  it('preserves callout quote prefix while removing the checkbox marker', () => {
    const editor = new MockEditor();
    editor.setValue('> - [ ] Nested task');
    editor.setCursor({ line: 0, ch: 6 });

    removeActiveCheckbox(editor as any);

    expect(editor.getValue()).toBe('> Nested task');
  });

  it('is a no-op when the current line is not a checkbox line', () => {
    const editor = new MockEditor();
    editor.setValue('Plain line');
    editor.setCursor({ line: 0, ch: 2 });

    removeActiveCheckbox(editor as any);

    expect(editor.getValue()).toBe('Plain line');
  });
});
