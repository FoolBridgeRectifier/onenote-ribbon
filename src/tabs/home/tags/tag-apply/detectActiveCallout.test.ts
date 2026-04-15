import { detectActiveTagKeys } from './detectActiveCallout';
import { MockEditor } from '../../../../test-utils/MockEditor';
import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from '../constants';

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

describe('detectActiveTagKeys — task prefix detection', () => {
  it('adds a prefix-specific key for a P1 task', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P1: Buy milk');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
    expect(result.has(`${ACTIVE_TAG_KEY_TASK}:P1`)).toBe(true);
  });

  it('adds a prefix-specific key for a P2 task', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P2: Read book');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
    expect(result.has(`${ACTIVE_TAG_KEY_TASK}:P2`)).toBe(true);
  });

  it('does NOT add P1 key when on a P2 task', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P2: Read book');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(`${ACTIVE_TAG_KEY_TASK}:P1`)).toBe(false);
  });

  it('does NOT add P2 key when on a P1 task', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P1: Buy milk');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(`${ACTIVE_TAG_KEY_TASK}:P2`)).toBe(false);
  });

  it('adds a prefix-specific key for a Discuss task', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Discuss: Team meeting');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(`${ACTIVE_TAG_KEY_TASK}:Discuss`)).toBe(true);
  });

  it('adds a prefix-specific key for a "Discuss with manager" task', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Discuss with manager: Project review');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has(`${ACTIVE_TAG_KEY_TASK}:Discuss with manager`)).toBe(
      true,
    );
  });

  it('does NOT add a prefix key for a plain task with no prefix', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Buy milk');
    editor.setCursor({ line: 0, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    // Only the generic __task__ key, no prefix-specific key
    expect(result.size).toBe(1);
    expect(result.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
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
