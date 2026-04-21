import { removeTag } from './TagRemove';
import { removeActiveCallout as removeInnermostCallout } from '../../callout-apply/helpers/remove-active-callout/RemoveActiveCallout';
import { removeCalloutByKey } from '../../callout-apply/helpers/remove-callout-by-key/RemoveCalloutByKey';
import { removeActiveCheckbox as removeCheckbox } from '../../callout-apply/helpers/remove-active-checkbox/RemoveActiveCheckbox';

jest.mock('../../callout-apply/helpers/remove-active-callout/RemoveActiveCallout', () => ({
  removeActiveCallout: jest.fn(),
}));

jest.mock('../../callout-apply/helpers/remove-callout-by-key/RemoveCalloutByKey', () => ({
  removeCalloutByKey: jest.fn(),
}));

jest.mock('../../callout-apply/helpers/remove-active-checkbox/RemoveActiveCheckbox', () => ({
  removeActiveCheckbox: jest.fn(),
}));

describe('removeTag — editor overload', () => {
  const mockRemoveInnermostCallout = removeInnermostCallout as jest.Mock;
  const mockRemoveCalloutByKey = removeCalloutByKey as jest.Mock;
  const mockRemoveCheckbox = removeCheckbox as jest.Mock;

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

  it('calls removeInnermostCallout when kind is callout and calloutTitle is absent', () => {
    const editor = buildMockEditor();

    removeTag(editor as any, { kind: 'callout' });

    expect(mockRemoveInnermostCallout).toHaveBeenCalledWith(editor);
    expect(mockRemoveCalloutByKey).not.toHaveBeenCalled();
    expect(mockRemoveCheckbox).not.toHaveBeenCalled();
  });

  it('calls removeCalloutByKey with title when kind is callout and calloutTitle is defined', () => {
    const editor = buildMockEditor();

    removeTag(editor as any, { kind: 'callout', calloutTitle: 'Important' });

    expect(mockRemoveCalloutByKey).toHaveBeenCalledWith(editor, 'Important');
    expect(mockRemoveInnermostCallout).not.toHaveBeenCalled();
    expect(mockRemoveCheckbox).not.toHaveBeenCalled();
  });

  it('calls removeCheckbox when kind is checkbox', () => {
    const editor = buildMockEditor();

    removeTag(editor as any, { kind: 'checkbox' });

    expect(mockRemoveCheckbox).toHaveBeenCalledWith(editor);
    expect(mockRemoveInnermostCallout).not.toHaveBeenCalled();
    expect(mockRemoveCalloutByKey).not.toHaveBeenCalled();
  });

  it('returns undefined and calls no mocks for an unsupported kind', () => {
    const editor = buildMockEditor();

    // 'task' is not handled by the remove editor path
    const result = removeTag(editor as any, { kind: 'task' } as any);

    expect(result).toBeUndefined();
    expect(mockRemoveInnermostCallout).not.toHaveBeenCalled();
    expect(mockRemoveCalloutByKey).not.toHaveBeenCalled();
    expect(mockRemoveCheckbox).not.toHaveBeenCalled();
  });

  it('does not call any mocks when input is a StylingContext', () => {
    const context = {
      sourceText: 'hello',
      selectionStartOffset: 0,
      selectionEndOffset: 5,
      selectedText: 'hello',
    };
    const htmlTag = { tagName: 'b', domain: 'html' as const, openingMarkup: '<b>', closingMarkup: '</b>' };

    const result = removeTag(context, htmlTag);

    expect(result).toBeDefined();
    expect(Array.isArray(result.replacements)).toBe(true);
    expect(typeof result.isNoOp).toBe('boolean');
    expect(mockRemoveInnermostCallout).not.toHaveBeenCalled();
    expect(mockRemoveCalloutByKey).not.toHaveBeenCalled();
    expect(mockRemoveCheckbox).not.toHaveBeenCalled();
  });
});
