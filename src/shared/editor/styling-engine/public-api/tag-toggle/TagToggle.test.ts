import { toggleTag } from './TagToggle';
import { toggleInlineTodoTag } from '../../callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag';

jest.mock('../../callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag', () => ({
  toggleInlineTodoTag: jest.fn(),
}));

describe('toggleTag — editor overload', () => {
  const mockToggleInlineTodoTag = toggleInlineTodoTag as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  function buildMockEditor() {
    return {
      getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
      getLine: jest.fn().mockReturnValue(''),
      setLine: jest.fn(),
      setCursor: jest.fn(),
      getValue: jest.fn().mockReturnValue(''),
      lastLine: jest.fn().mockReturnValue(0),
      transaction: jest.fn(),
      setSelection: jest.fn(),
      getSelection: jest.fn().mockReturnValue(''),
      replaceSelection: jest.fn(),
    };
  }

  it('calls toggleInlineTodoTag with the editor when kind is inline-todo', () => {
    const editor = buildMockEditor();

    toggleTag(editor as any, { kind: 'inline-todo' });

    expect(mockToggleInlineTodoTag).toHaveBeenCalledTimes(1);
    expect(mockToggleInlineTodoTag).toHaveBeenCalledWith(editor);
  });

  it('returns undefined and does not call toggleInlineTodoTag for an unsupported editor kind', () => {
    const editor = buildMockEditor();

    const result = toggleTag(editor as any, { kind: 'task' } as any);

    expect(result).toBeUndefined();
    expect(mockToggleInlineTodoTag).not.toHaveBeenCalled();
  });

  it('does not call toggleInlineTodoTag when input is a StylingContext', () => {
    const context = {
      sourceText: 'hello world',
      selectionStartOffset: 0,
      selectionEndOffset: 5,
      selectedText: 'hello',
    };
    const htmlTag = {
      tagName: 'b',
      domain: 'html' as const,
      openingMarkup: '<b>',
      closingMarkup: '</b>',
    };

    const result = toggleTag(context, htmlTag);

    expect(result).toBeDefined();
    expect(Array.isArray(result.replacements)).toBe(true);
    expect(typeof result.isNoOp).toBe('boolean');
    expect(mockToggleInlineTodoTag).not.toHaveBeenCalled();
  });
});
