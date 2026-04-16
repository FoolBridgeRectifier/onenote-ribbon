import { applyTag } from './applyTag';
import { MockEditor } from '../../../../test-utils/MockEditor';

describe('applyTag — command action', () => {
  it('calls executeCommand with the provided command id', () => {
    const mockExecuteCommand = jest.fn();

    applyTag(
      null,
      { type: 'command', commandId: 'editor:toggle-checklist-status' },
      mockExecuteCommand,
    );

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      'editor:toggle-checklist-status',
    );
    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
  });

  it('does not require a live editor — works with null editor', () => {
    const mockExecuteCommand = jest.fn();

    applyTag(
      null,
      { type: 'command', commandId: 'global-search:open' },
      mockExecuteCommand,
    );

    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
  });
});

describe('applyTag — callout action', () => {
  it('wraps the cursor line with a callout block', () => {
    const editor = new MockEditor();
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'important' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('> [!important]\n> Hello world');
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('preserves the original line content inside the callout', () => {
    const editor = new MockEditor();
    editor.setValue('Buy milk and eggs');
    editor.setCursor({ line: 0, ch: 5 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'note' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('> [!note]\n> Buy milk and eggs');
  });

  it('uses the calloutType verbatim in the output', () => {
    const editor = new MockEditor();
    editor.setValue('Line text');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'danger' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('> [!danger]\n> Line text');
  });

  it('is a no-op when editor is null', () => {
    const mockExecuteCommand = jest.fn();

    expect(() => {
      applyTag(
        null,
        { type: 'callout', calloutType: 'important' },
        mockExecuteCommand,
      );
    }).not.toThrow();
  });

  it('appends the calloutTitle after [!type] when provided', () => {
    const editor = new MockEditor();
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'important', calloutTitle: 'Important' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('> [!important] Important\n> Hello world');
  });

  it('appends a multi-word calloutTitle correctly', () => {
    const editor = new MockEditor();
    editor.setValue('Novel draft');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'tip', calloutTitle: 'Book to read' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('> [!tip] Book to read\n> Novel draft');
  });

  it('omits the title segment when calloutTitle is undefined', () => {
    const editor = new MockEditor();
    editor.setValue('No title');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'note' },
      mockExecuteCommand,
    );

    // No trailing space or title in the header
    expect(editor.getValue()).toBe('> [!note]\n> No title');
  });

  it('nests callouts by one level when cursor is already inside a callout block', () => {
    const editor = new MockEditor();
    editor.setValue('> Existing callout body');
    editor.setCursor({ line: 0, ch: 5 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'important', calloutTitle: 'Important' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe(
      '>> [!important] Important\n>> Existing callout body',
    );
  });

  it('preserves deeper nesting by adding one extra blockquote level', () => {
    const editor = new MockEditor();
    editor.setValue('>> Nested body content');
    editor.setCursor({ line: 0, ch: 4 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'callout', calloutType: 'note' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('>>> [!note]\n>>> Nested body content');
  });
});

describe('applyTag — task action', () => {
  it('converts the cursor line to a task item with an empty prefix', () => {
    const editor = new MockEditor();
    editor.setValue('Meeting notes');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: '' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('- [ ] Meeting notes');
  });

  it('prepends a non-empty taskPrefix before the line content', () => {
    const editor = new MockEditor();
    editor.setValue('John');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: 'Discuss:' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('- [ ] Discuss: John');
  });

  it('does not double-space when prefix already has a trailing character', () => {
    const editor = new MockEditor();
    editor.setValue('Jane');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: 'P1:' },
      mockExecuteCommand,
    );

    // One space added between prefix and content only
    expect(editor.getValue()).toBe('- [ ] P1: Jane');
  });

  it('is a no-op when editor is null', () => {
    const mockExecuteCommand = jest.fn();

    expect(() => {
      applyTag(null, { type: 'task', taskPrefix: 'Do:' }, mockExecuteCommand);
    }).not.toThrow();
  });

  it('creates a checkbox from callout title and moves callout header to next line', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note] Follow up with team');
    editor.setCursor({ line: 0, ch: 16 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: '' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('- [ ] Follow up with team\n> [!note]');
  });

  it('applies task prefix when converting callout title into checkbox', () => {
    const editor = new MockEditor();
    editor.setValue('> [!tip] Send in email');
    editor.setCursor({ line: 0, ch: 12 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: 'P2:' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('- [ ] P2: Send in email\n> [!tip]');
  });

  it('replaces an existing task prefix when applying a different checkbox tag', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] Discuss: Alex');
    editor.setCursor({ line: 0, ch: 10 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: 'P2:' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('- [ ] P2: Alex');
  });

  it('removes an existing task prefix when applying a plain checkbox tag', () => {
    const editor = new MockEditor();
    editor.setValue('- [ ] P1: Follow up');
    editor.setCursor({ line: 0, ch: 8 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: '' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('- [ ] Follow up');
  });

  it('preserves callout quote prefix when replacing a nested checkbox line', () => {
    const editor = new MockEditor();
    editor.setValue('> - [ ] Discuss with manager: Sarah');
    editor.setCursor({ line: 0, ch: 8 });
    const mockExecuteCommand = jest.fn();

    applyTag(
      editor as any,
      { type: 'task', taskPrefix: 'Call back:' },
      mockExecuteCommand,
    );

    expect(editor.getValue()).toBe('> - [ ] Call back: Sarah');
  });
});

describe('applyTag — highlight action', () => {
  it('wraps a text selection with == markers', () => {
    const editor = new MockEditor();
    editor.setValue('important word here');
    editor.setSelection({ line: 0, ch: 10 }, { line: 0, ch: 14 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'highlight' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('important ==word== here');
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('wraps the entire line when there is no selection', () => {
    const editor = new MockEditor();
    editor.setValue('whole line');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'highlight' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('==whole line==');
  });

  it('wraps an empty line correctly', () => {
    const editor = new MockEditor();
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'highlight' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('====');
  });

  it('is a no-op when editor is null', () => {
    const mockExecuteCommand = jest.fn();

    expect(() => {
      applyTag(null, { type: 'highlight' }, mockExecuteCommand);
    }).not.toThrow();
  });
});
