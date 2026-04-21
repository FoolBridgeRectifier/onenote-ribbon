import { addTag } from './TagAdd';
import { applyCallout, applyTask } from '../../callout-apply/calloutApply';

jest.mock('../../callout-apply/calloutApply', () => ({
  applyCallout: jest.fn(),
  applyTask: jest.fn(),
}));

describe('addTag — editor overload', () => {
  const mockApplyCallout = applyCallout as jest.Mock;
  const mockApplyTask = applyTask as jest.Mock;

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

  it('calls applyCallout with calloutType and calloutTitle when kind is callout', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' });
    expect(mockApplyCallout).toHaveBeenCalledWith(editor, 'important', 'Important');
  });

  it('calls applyCallout with undefined title when calloutTitle is omitted', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'callout', calloutType: 'note' });
    expect(mockApplyCallout).toHaveBeenCalledWith(editor, 'note', undefined);
  });

  it('calls applyTask with taskPrefix when kind is task', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'task', taskPrefix: 'Todo:' });
    expect(mockApplyTask).toHaveBeenCalledWith(editor, 'Todo:');
  });

  it('calls applyTask with empty string when taskPrefix is omitted', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'task' });
    expect(mockApplyTask).toHaveBeenCalledWith(editor, '');
  });

  it('does not call applyCallout or applyTask for StylingContext input', () => {
    const context = { sourceText: 'hello', selectionStartOffset: 0, selectionEndOffset: 5, selectedText: 'hello' };
    const htmlTag = { tagName: 'b', domain: 'html' as const, openingMarkup: '<b>', closingMarkup: '</b>' };
    const result = addTag(context, htmlTag);
    expect(result).toBeDefined();
    expect(Array.isArray(result.replacements)).toBe(true);
    expect(typeof result.isNoOp).toBe('boolean');
    expect(mockApplyCallout).not.toHaveBeenCalled();
    expect(mockApplyTask).not.toHaveBeenCalled();
  });

  it('returns undefined when kind is not callout or task (unsupported editor operation)', () => {
    const editor = buildMockEditor();
    const result = addTag(editor as any, { kind: 'checkbox' } as any);
    expect(result).toBeUndefined();
    expect(mockApplyCallout).not.toHaveBeenCalled();
    expect(mockApplyTask).not.toHaveBeenCalled();
  });
});
