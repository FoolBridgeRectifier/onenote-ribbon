import { removeCalloutByKey } from './RemoveCalloutByKey';
import { MockEditor } from '../../../../../../test-utils/MockEditor';

describe('removeCalloutByKey — no-op cases', () => {
  it('does nothing when cursor is not inside a callout', () => {
    const editor = new MockEditor();
    editor.setValue('Normal paragraph');
    editor.setCursor({ line: 0, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('Normal paragraph');
  });

  it('does nothing when the named callout is not found', () => {
    const editor = new MockEditor();
    editor.setValue('> [!question] Question\n> body');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('> [!question] Question\n> body');
  });
});

describe('removeCalloutByKey — single level', () => {
  it('removes the named callout and unwraps its content', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important] Important\n> body text');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('body text');
  });

  it('matches by callout title (case-sensitive)', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note] Remember for later\n> content');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'Remember for later');

    expect(editor.getValue()).toBe('content');
  });
});

describe('removeCalloutByKey — nested callouts', () => {
  it('removes the outer callout by key, leaving inner intact (stripped one level)', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!important] Important\n' +
      '>> [!question] Question\n' +
      '>> question body'
    );
    editor.setCursor({ line: 2, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    // Outer callout header removed; inner lines stripped one ">"
    expect(editor.getValue()).toBe('> [!question] Question\n> question body');
  });

  it('removes the inner callout by key, leaving outer intact', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!important] Important\n' +
      '>> [!question] Question\n' +
      '>> question body'
    );
    editor.setCursor({ line: 2, ch: 0 });

    removeCalloutByKey(editor as any, 'Question');

    // Inner callout header removed; body stripped one ">" (still inside outer)
    expect(editor.getValue()).toBe('> [!important] Important\n> question body');
  });
});

describe('removeCalloutByKey — type-based matching', () => {
  it('matches by callout type when the header has no title', () => {
    const editor = new MockEditor();
    editor.setValue('> [!warning]\n> body text');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'warning');

    expect(editor.getValue()).toBe('body text');
  });

  it('matches by lowercased type when title does not match the key', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important] Some Different Title\n> body');
    editor.setCursor({ line: 1, ch: 0 });

    // Key matches callout type 'important', not the title 'Some Different Title'
    removeCalloutByKey(editor as any, 'important');

    expect(editor.getValue()).toBe('body');
  });
});

describe('removeCalloutByKey — forward scan boundaries', () => {
  it('stops the body scan at a sibling callout header at the same depth', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!important] Important\n' +
      '> body\n' +
      '> [!note] Note\n' +
      '> note body'
    );
    editor.setCursor({ line: 1, ch: 0 });

    // Only 'Important' block (header + body) should be removed; Note block stays
    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('body\n> [!note] Note\n> note body');
  });

  it('stops the body scan when a shallower-depth line is encountered', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!outer] Outer\n' +
      '>> [!important] Important\n' +
      '>> deep body\n' +
      '> shallow line'
    );
    editor.setCursor({ line: 2, ch: 0 });

    // 'Important' block is lines 1-2; line 3 is shallower and stays
    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('> [!outer] Outer\n> deep body\n> shallow line');
  });
});
