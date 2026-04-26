import { applyCallout } from '../applyCallout';
import { MockEditor } from '../../../../../../../test-utils/MockEditor';

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

    expect(editor.getValue()).toBe('>> [!important] Important\n>> Existing callout body');
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

    expect(editor.getValue()).toBe('> [!important] Important\n>> [!question] Question\n>> my note');
  });

  it('strips the checkbox marker when the cursor line is an unchecked task item', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Follow up with team');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'important', 'Important');

    expect(editor.getValue()).toBe('> [!important] Important\n> Follow up with team');
  });

  it('strips the checkbox marker when the cursor line is a checked task item', () => {
    const editor = new MockEditor();
    editor.setValue('- [x] Completed task');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'note');

    expect(editor.getValue()).toBe('> [!note]\n> Completed task');
  });

  it('strips the checkbox marker from an indented task item', () => {
    const editor = new MockEditor();
    editor.setValue('  - [ ] Indented task');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'tip');

    expect(editor.getValue()).toBe('> [!tip]\n> Indented task');
  });

  it('strips the checkbox marker from a nested blockquote task item', () => {
    const editor = new MockEditor();
    editor.setValue('> - [ ] Nested task');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'note');

    expect(editor.getValue()).toBe('>> [!note]\n>> Nested task');
  });

  it('produces an empty callout body when the checkbox line has no content after the marker', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] ');
    editor.setCursor({ line: 0, ch: 0 });

    applyCallout(editor as any, 'note');

    expect(editor.getValue()).toBe('> [!note]\n> ');
  });
});
