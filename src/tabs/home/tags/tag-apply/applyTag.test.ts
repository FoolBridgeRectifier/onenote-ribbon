import { applyTag } from './applyTag';
import { MockEditor } from '../../../../test-utils/MockEditor';

describe('applyTag — command action', () => {
  it('calls executeCommand with the provided command id', () => {
    const mockExecuteCommand = jest.fn();

    applyTag(null, { type: 'command', commandId: 'editor:toggle-checklist-status' }, mockExecuteCommand);

    expect(mockExecuteCommand).toHaveBeenCalledWith('editor:toggle-checklist-status');
    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
  });

  it('does not require a live editor — works with null editor', () => {
    const mockExecuteCommand = jest.fn();

    applyTag(null, { type: 'command', commandId: 'global-search:open' }, mockExecuteCommand);

    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
  });
});

describe('applyTag — callout action', () => {
  it('wraps the cursor line with a callout block', () => {
    const editor = new MockEditor();
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'callout', calloutType: 'important' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('> [!important]\n> Hello world');
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('preserves the original line content inside the callout', () => {
    const editor = new MockEditor();
    editor.setValue('Buy milk and eggs');
    editor.setCursor({ line: 0, ch: 5 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'callout', calloutType: 'note' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('> [!note]\n> Buy milk and eggs');
  });

  it('uses the calloutType verbatim in the output', () => {
    const editor = new MockEditor();
    editor.setValue('Line text');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'callout', calloutType: 'danger' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('> [!danger]\n> Line text');
  });

  it('is a no-op when editor is null', () => {
    const mockExecuteCommand = jest.fn();

    expect(() => {
      applyTag(null, { type: 'callout', calloutType: 'important' }, mockExecuteCommand);
    }).not.toThrow();
  });
});

describe('applyTag — task action', () => {
  it('converts the cursor line to a task item with an empty prefix', () => {
    const editor = new MockEditor();
    editor.setValue('Meeting notes');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'task', taskPrefix: '' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('- [ ] Meeting notes');
  });

  it('prepends a non-empty taskPrefix before the line content', () => {
    const editor = new MockEditor();
    editor.setValue('John');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'task', taskPrefix: 'Discuss:' }, mockExecuteCommand);

    expect(editor.getValue()).toBe('- [ ] Discuss: John');
  });

  it('does not double-space when prefix already has a trailing character', () => {
    const editor = new MockEditor();
    editor.setValue('Jane');
    editor.setCursor({ line: 0, ch: 0 });
    const mockExecuteCommand = jest.fn();

    applyTag(editor as any, { type: 'task', taskPrefix: 'P1:' }, mockExecuteCommand);

    // One space added between prefix and content only
    expect(editor.getValue()).toBe('- [ ] P1: Jane');
  });

  it('is a no-op when editor is null', () => {
    const mockExecuteCommand = jest.fn();

    expect(() => {
      applyTag(null, { type: 'task', taskPrefix: 'Do:' }, mockExecuteCommand);
    }).not.toThrow();
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
