import { detectActiveTagKeys } from './helpers';
import { MockEditor } from '../../../../test-utils/MockEditor';
import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from './constants';

describe('detectActiveTagKeys — null editor', () => {
  it('returns an empty Set when editor is null', () => {
    const result = detectActiveTagKeys(null);

    expect(result.size).toBe(0);
  });
});

describe('detectActiveTagKeys — task detection', () => {
  it('adds __task__ when cursor is on an unchecked task line', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Buy milk');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
  });

  it('adds __task__ when cursor is on a checked task line', () => {
    const editor = new MockEditor();
    editor.setValue('- [x] Done');
    editor.setCursor({ line: 0, ch: 5 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
  });

  it('adds __task__ for indented task lines', () => {
    const editor = new MockEditor();
    editor.setValue('  - [ ] Indented task');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
  });

  it('does NOT add __task__ for a plain bullet list item', () => {
    const editor = new MockEditor();
    editor.setValue('- Just a bullet point');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(false);
  });

  it('does NOT add __task__ for a normal paragraph', () => {
    const editor = new MockEditor();
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(false);
  });
});

describe('detectActiveTagKeys — highlight detection', () => {
  it('adds __highlight__ when line contains ==text==', () => {
    const editor = new MockEditor();
    editor.setValue('Some ==highlighted== text');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_HIGHLIGHT)).toBe(true);
  });

  it('does NOT add __highlight__ for unclosed == marker', () => {
    const editor = new MockEditor();
    editor.setValue('Some == broken');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_HIGHLIGHT)).toBe(false);
  });

  it('does NOT add __highlight__ for plain text', () => {
    const editor = new MockEditor();
    editor.setValue('No markers here');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_HIGHLIGHT)).toBe(false);
  });
});

describe('detectActiveTagKeys — callout detection', () => {
  it('detects a callout type when cursor is on the header line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important]\n> Some note');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('important')).toBe(true);
  });

  it('detects callout type when cursor is on a continuation line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip]\n> This is the body\n> More content');
    editor.setCursor({ line: 2, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('tip')).toBe(true);
  });

  it('normalises the callout type to lowercase', () => {
    const editor = new MockEditor();
    editor.setValue('> [!WARNING]\n> Watch out');
    editor.setCursor({ line: 1, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('warning')).toBe(true);
  });

  it('does NOT add a callout key for a plain paragraph', () => {
    const editor = new MockEditor();
    editor.setValue('Just a paragraph');
    editor.setCursor({ line: 0, ch: 0 });

    expect(detectActiveTagKeys(editor as any).size).toBe(0);
  });

  it('does NOT detect callout when line starts with ">" but has no header above', () => {
    const editor = new MockEditor();
    // A plain blockquote — no > [!type] header
    editor.setValue('> Just a blockquote');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('blockquote')).toBe(false);
  });

  it('returns multiple keys when a task is inside a callout', () => {
    const editor = new MockEditor();
    editor.setValue('> [!question]\n> - [ ] Sub-task');
    editor.setCursor({ line: 1, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    // Inside a question callout AND on a task line
    expect(result.has('question')).toBe(true);
    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
  });
});

describe('detectActiveTagKeys — title-based callout detection', () => {
  it('returns the title as the key when the callout header includes a title', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important] Important\n> Some note');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Important')).toBe(true);
    // Does NOT fall back to the type when title is present
    expect(result.has('important')).toBe(false);
  });

  it('returns the title for a titled callout when cursor is on a body line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip] Book to read\n> A great novel');
    editor.setCursor({ line: 1, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Book to read')).toBe(true);
    expect(result.has('tip')).toBe(false);
  });

  it('falls back to the callout type (lowercase) when no title is present', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note]\n> Content');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('note')).toBe(true);
  });

  it('preserves the exact casing of the title text', () => {
    const editor = new MockEditor();
    editor.setValue('> [!warning] Password\n> Keep safe');
    editor.setCursor({ line: 1, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Password')).toBe(true);
    // Original casing from header — not lowercased
    expect(result.has('password')).toBe(false);
  });

  it('handles multi-word titles correctly', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip] Music to listen to\n> Jazz essentials');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Music to listen to')).toBe(true);
  });
});

describe('detectActiveTagKeys — task prefix detection', () => {
  it('adds a task-prefix key when the task line starts with a recognised prefix', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P2: Some task');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
    expect(result.has('task-prefix:P2:')).toBe(true);
  });

  it('adds task-prefix:Discuss: for a Discuss task line', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Discuss: John about budget');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('task-prefix:Discuss:')).toBe(true);
  });

  it('adds task-prefix for multi-word prefix (Discuss with manager:)', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Discuss with manager: Quarterly review');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('task-prefix:Discuss with manager:')).toBe(true);
  });

  it('adds only __task__ (no prefix key) for a plain task with no prefix', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Buy milk');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
    // No task-prefix key should be added since there is no "Word:" prefix
    const prefixKeys = [...result].filter((key) => key.startsWith('task-prefix:'));
    expect(prefixKeys).toHaveLength(0);
  });
});
