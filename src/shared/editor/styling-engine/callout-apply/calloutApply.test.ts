import { applyCallout, applyTask } from './calloutApply';
import { MockEditor } from '../../../../test-utils/MockEditor';

describe('applyCallout', () => {
  it('wraps the cursor line with a callout block', () => {
    const editor = new MockEditor();
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'important');

    expect(editor.getValue()).toBe('> [!important]\n> Hello world');
  });

  it('preserves the original line content inside the callout', () => {
    const editor = new MockEditor();
    editor.setValue('Buy milk and eggs');
    editor.setCursor({ line: 0, ch: 5 });

    applyCallout(editor as any, 'note');

    expect(editor.getValue()).toBe('> [!note]\n> Buy milk and eggs');
  });

  it('uses the calloutType verbatim in the output', () => {
    const editor = new MockEditor();
    editor.setValue('Line text');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'danger');

    expect(editor.getValue()).toBe('> [!danger]\n> Line text');
  });

  it('appends the calloutTitle after [!type] when provided', () => {
    const editor = new MockEditor();
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'important', 'Important');

    expect(editor.getValue()).toBe('> [!important] Important\n> Hello world');
  });

  it('appends a multi-word calloutTitle correctly', () => {
    const editor = new MockEditor();
    editor.setValue('Novel draft');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'tip', 'Book to read');

    expect(editor.getValue()).toBe('> [!tip] Book to read\n> Novel draft');
  });

  it('omits the title segment when calloutTitle is undefined', () => {
    const editor = new MockEditor();
    editor.setValue('No title');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'note');

    // No trailing space or title in the header
    expect(editor.getValue()).toBe('> [!note]\n> No title');
  });

  it('nests callouts by one level when cursor is already inside a callout block', () => {
    const editor = new MockEditor();
    editor.setValue('> Existing callout body');
    editor.setCursor({ line: 0, ch: 5 });

    applyCallout(editor as any, 'important', 'Important');

    expect(editor.getValue()).toBe(
      '>> [!important] Important\n>> Existing callout body',
    );
  });

  it('preserves deeper nesting by adding one extra blockquote level', () => {
    const editor = new MockEditor();
    editor.setValue('>> Nested body content');
    editor.setCursor({ line: 0, ch: 4 });

    applyCallout(editor as any, 'note');

    expect(editor.getValue()).toBe('>>> [!note]\n>>> Nested body content');
  });

  it('moves cursor to the body line after applying so a second callout nests correctly', () => {
    const editor = new MockEditor();
    editor.setValue('my note');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'important', 'Important');

    // Cursor must be on line 1 (the body line), not line 0 (the header)
    expect(editor.getCursor()).toEqual({ line: 1, ch: 2 });
  });

  it('applying two callouts in sequence nests the second inside the first without corrupting the header', () => {
    const editor = new MockEditor();
    editor.setValue('my note');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'important', 'Important');
    // Cursor is now on the body line — apply a second callout
    applyCallout(editor as any, 'question', 'Question');

    expect(editor.getValue()).toBe(
      '> [!important] Important\n>> [!question] Question\n>> my note',
    );
  });
});

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

  it('creates a checkbox from callout title and moves callout header to next line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note] Follow up with team');
    editor.setCursor({ line: 0, ch: 16 });

    applyTask(editor as any, '');

    expect(editor.getValue()).toBe('- [ ] Follow up with team\n> [!note]');
  });

  it('applies task prefix when converting callout title into checkbox', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip] Send in email');
    editor.setCursor({ line: 0, ch: 12 });

    applyTask(editor as any, 'P2:');

    expect(editor.getValue()).toBe('- [ ] P2: Send in email\n> [!tip]');
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
});
