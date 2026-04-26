import { applyTask } from '../applyTask';
import { MockEditor } from '../../../../../../../test-utils/MockEditor';

describe('applyTask', () => {
  it('converts the cursor line to a task item with an empty prefix', () => {
    const editor = new MockEditor();
    editor.setValue('Meeting notes');
    editor.setCursor({ line: 0, ch: 0 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('- [ ] Meeting notes');
  });

  it('prepends a non-empty taskPrefix before the line content', () => {
    const editor = new MockEditor();
    editor.setValue('John');
    editor.setCursor({ line: 0, ch: 0 });

    applyTask(editor as any, 'Discuss:');

    expect(editor.getValue()).toBe('- [ ] Discuss: John');
  });

  it('joins a colon-terminated taskPrefix to content with a single space', () => {
    const editor = new MockEditor();
    editor.setValue('Jane');
    editor.setCursor({ line: 0, ch: 0 });

    applyTask(editor as any, 'P1:');

    // One space added between prefix and content only
    expect(editor.getValue()).toBe('- [ ] P1: Jane');
  });

  it('inserts a blank task body line inside the callout when cursor is on the title', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note] Follow up with team');
    editor.setCursor({ line: 0, ch: 16 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('> [!note] Follow up with team\n> - [ ] ');
  });

  it('inserts a blank task body line inside the callout when cursor is at start of header line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!question] Question');
    editor.setCursor({ line: 0, ch: 0 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('> [!question] Question\n> - [ ] ');
  });

  it('inserts a blank task body line when cursor is inside the bracket part of the header', () => {
    const editor = new MockEditor();
    editor.setValue('> [!question] Question');
    editor.setCursor({ line: 0, ch: 5 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('> [!question] Question\n> - [ ] ');
  });

  it('inserts a prefixed task body line inside the callout when cursor is on the title', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip] Send in email');
    editor.setCursor({ line: 0, ch: 12 });

    applyTask(editor as any, 'P2:');

    expect(editor.getValue()).toBe('> [!tip] Send in email\n> - [ ] P2: ');
  });

  it('inserts a prefixed task body line when cursor is at start of header line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip] Send in email');
    editor.setCursor({ line: 0, ch: 0 });

    applyTask(editor as any, 'P2:');

    expect(editor.getValue()).toBe('> [!tip] Send in email\n> - [ ] P2: ');
  });

  it('inserts task body line for a callout header without a title', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note]');
    editor.setCursor({ line: 0, ch: 0 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('> [!note]\n> - [ ] ');
  });

  it('replaces an existing task prefix when applying a different checkbox tag', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Discuss: Alex');
    editor.setCursor({ line: 0, ch: 10 });

    applyTask(editor as any, 'P2:');

    expect(editor.getValue()).toBe('- [ ] P2: Alex');
  });

  it('removes an existing task prefix when applying a plain checkbox tag', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P1: Follow up');
    editor.setCursor({ line: 0, ch: 8 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('- [ ] Follow up');
  });

  it('preserves callout quote prefix when replacing a nested checkbox line', () => {
    const editor = new MockEditor();
    editor.setValue('> - [ ] Discuss with manager: Sarah');
    editor.setCursor({ line: 0, ch: 8 });

    applyTask(editor as any, 'Call back:');

    expect(editor.getValue()).toBe('> - [ ] Call back: Sarah');
  });

  it('preserves blockquote prefix when converting a plain blockquote body line to a task', () => {
    const editor = new MockEditor();
    editor.setValue('> body inside callout');
    editor.setCursor({ line: 0, ch: 5 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('> - [ ] body inside callout');
  });

  it('preserves multi-level blockquote prefix on a plain body line', () => {
    const editor = new MockEditor();
    editor.setValue('>> nested body');
    editor.setCursor({ line: 0, ch: 3 });

    applyTask(editor as any, 'P2:');

    expect(editor.getValue()).toBe('>> - [ ] P2: nested body');
  });
});
