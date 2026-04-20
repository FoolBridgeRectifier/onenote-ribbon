import { removeActiveCallout } from './helpers';
import { MockEditor } from '../../../../test-utils/MockEditor';

describe('removeActiveCallout — no-op cases', () => {
  it('does nothing when cursor is on a plain paragraph', () => {
    const editor = new MockEditor();
    editor.setValue('Just a paragraph');
    editor.setCursor({ line: 0, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('Just a paragraph');
  });

  it('does nothing when line starts with ">" but has no callout header', () => {
    const editor = new MockEditor();
    // A plain blockquote without > [!type] header
    editor.setValue('> A plain blockquote');
    editor.setCursor({ line: 0, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('> A plain blockquote');
  });

  it('does nothing when cursor is above the callout block', () => {
    const editor = new MockEditor();
    editor.setValue('Normal line\n> [!tip]\n> Body');
    editor.setCursor({ line: 0, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('Normal line\n> [!tip]\n> Body');
  });
});

describe('removeActiveCallout — header removal', () => {
  it('removes a single-line callout (header only)', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important]');
    editor.setCursor({ line: 0, ch: 0 });

    removeActiveCallout(editor as any);

    // Header is removed, nothing left
    expect(editor.getValue()).toBe('');
  });

  it('removes the header and strips "> " from body lines', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip]\n> This is the body');
    editor.setCursor({ line: 0, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('This is the body');
  });

  it('strips a multi-line callout block to plain text', () => {
    const editor = new MockEditor();
    editor.setValue('> [!warning]\n> Line one\n> Line two\n> Line three');
    editor.setCursor({ line: 1, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('Line one\nLine two\nLine three');
  });
});

describe('removeActiveCallout — cursor on continuation line', () => {
  it('still removes the whole block when cursor is in the middle', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note]\n> First\n> Second\n> Third');
    editor.setCursor({ line: 2, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('First\nSecond\nThird');
  });

  it('still removes when cursor is on the last body line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!danger]\n> Body\n> Last line');
    editor.setCursor({ line: 2, ch: 5 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('Body\nLast line');
  });
});

describe('removeActiveCallout — surrounding content preserved', () => {
  it('does not touch lines before the callout block', () => {
    const editor = new MockEditor();
    editor.setValue('Before\n> [!tip]\n> Body\nAfter');
    editor.setCursor({ line: 1, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('Before\nBody\nAfter');
  });

  it('preserves content above and below when block is in the middle', () => {
    const editor = new MockEditor();
    editor.setValue('Top\n> [!question]\n> Q body\nBottom');
    editor.setCursor({ line: 2, ch: 0 });

    removeActiveCallout(editor as any);

    expect(editor.getValue()).toBe('Top\nQ body\nBottom');
  });
});
