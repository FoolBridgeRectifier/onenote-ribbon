import { selectTagFromDropdown } from './helpers';
import type { TagDefinition } from '../../../../tabs/home/tags/interfaces';
import type { TagDropdownSelectContext } from './interfaces';
import { ACTIVE_TAG_KEY_TASK } from '../../styling-engine/tag-apply/constants';

const applyTagMock = jest.fn();
const removeActiveCalloutMock = jest.fn();
const removeActiveCheckboxMock = jest.fn();

jest.mock('../../styling-engine/tag-apply/TagApply', () => ({
  applyTag: (...args: unknown[]) => applyTagMock(...args),
}));

jest.mock('../../styling-engine/tag-apply/helpers', () => ({
  removeActiveCallout: (...args: unknown[]) => removeActiveCalloutMock(...args),
  removeActiveCheckbox: (...args: unknown[]) => removeActiveCheckboxMock(...args),
}));

/** Creates a minimal valid TagDefinition with optional overrides for testing. */
function buildTagDefinition(overrides: Partial<TagDefinition>): TagDefinition {
  return {
    label: 'Test Tag',
    swatchColor: '#000',
    icon: null,
    action: { type: 'callout', calloutType: 'note' },
    ...overrides,
  };
}

/** Creates a TagDropdownSelectContext with safe defaults and optional overrides. */
function buildContext(overrides: Partial<TagDropdownSelectContext>): TagDropdownSelectContext {
  return {
    getEditor: () => undefined,
    activeTagKeys: new Set(),
    canRemoveTag: false,
    executeCommand: jest.fn(),
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    ...overrides,
  };
}

describe('selectTagFromDropdown — isCustomizeTags path', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens the customize modal and closes the menu', () => {
    const tagDefinition = buildTagDefinition({ isCustomizeTags: true });
    const setCustomizeModalOpen = jest.fn();
    const setMoreMenuOpen = jest.fn();
    const context = buildContext({ setCustomizeModalOpen, setMoreMenuOpen });

    selectTagFromDropdown(tagDefinition, context);

    expect(setCustomizeModalOpen).toHaveBeenCalledWith(true);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
    expect(applyTagMock).not.toHaveBeenCalled();
  });
});

describe('selectTagFromDropdown — isRemoveTag path', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does nothing when canRemoveTag is false', () => {
    const tagDefinition = buildTagDefinition({ isRemoveTag: true });
    const setMoreMenuOpen = jest.fn();
    const context = buildContext({ canRemoveTag: false, setMoreMenuOpen });

    selectTagFromDropdown(tagDefinition, context);

    expect(setMoreMenuOpen).not.toHaveBeenCalled();
    expect(removeActiveCalloutMock).not.toHaveBeenCalled();
  });

  it('removes the active callout and closes the menu when canRemoveTag is true and editor is active', () => {
    const tagDefinition = buildTagDefinition({ isRemoveTag: true });
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    const context = buildContext({
      canRemoveTag: true,
      getEditor: () => fakeEditor as never,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(removeActiveCalloutMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('closes the menu without removing callout when canRemoveTag is true but no active editor', () => {
    const tagDefinition = buildTagDefinition({ isRemoveTag: true });
    const setMoreMenuOpen = jest.fn();
    const context = buildContext({
      canRemoveTag: true,
      getEditor: () => undefined,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(removeActiveCalloutMock).not.toHaveBeenCalled();
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — isDisabled path', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does nothing when the tag is disabled', () => {
    const tagDefinition = buildTagDefinition({ isDisabled: true });
    const setMoreMenuOpen = jest.fn();
    const context = buildContext({ setMoreMenuOpen });

    selectTagFromDropdown(tagDefinition, context);

    expect(setMoreMenuOpen).not.toHaveBeenCalled();
    expect(applyTagMock).not.toHaveBeenCalled();
    expect(removeActiveCalloutMock).not.toHaveBeenCalled();
  });
});

describe('selectTagFromDropdown — active callout toggle-off', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes the active callout when calloutKey is active and action type is callout', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    const tagDefinition = buildTagDefinition({
      action: { type: 'callout', calloutType: 'important' },
      calloutKey: 'Important',
    });
    const context = buildContext({
      activeTagKeys: new Set(['Important']),
      getEditor: () => fakeEditor as never,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(removeActiveCalloutMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
    expect(applyTagMock).not.toHaveBeenCalled();
  });

  it('does not toggle off when calloutKey is not in activeTagKeys', () => {
    const fakeEditor = {};
    const tagDefinition = buildTagDefinition({
      action: { type: 'callout', calloutType: 'important' },
      calloutKey: 'Important',
    });
    const context = buildContext({
      activeTagKeys: new Set(),
      getEditor: () => fakeEditor as never,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(removeActiveCalloutMock).not.toHaveBeenCalled();
    expect(applyTagMock).toHaveBeenCalled();
  });

  it('treats undefined calloutKey as not active — falls through to applyTag', () => {
    const fakeEditor = {};
    const tagDefinition = buildTagDefinition({
      action: { type: 'callout', calloutType: 'tip' },
      calloutKey: undefined,
    });
    const context = buildContext({
      activeTagKeys: new Set(['tip']),
      getEditor: () => fakeEditor as never,
    });

    selectTagFromDropdown(tagDefinition, context);

    // calloutKey is undefined so isCurrentlyActive is false → applies tag
    expect(applyTagMock).toHaveBeenCalled();
    expect(removeActiveCalloutMock).not.toHaveBeenCalled();
  });
});

describe('selectTagFromDropdown — active task toggle-off', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes the active checkbox when calloutKey is active and action type is task', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    const tagDefinition = buildTagDefinition({
      action: { type: 'task', taskPrefix: '' },
      calloutKey: ACTIVE_TAG_KEY_TASK,
    });
    const context = buildContext({
      activeTagKeys: new Set([ACTIVE_TAG_KEY_TASK]),
      getEditor: () => fakeEditor as never,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(removeActiveCheckboxMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
    expect(applyTagMock).not.toHaveBeenCalled();
  });

  it('removes the active checkbox for a command action with ACTIVE_TAG_KEY_TASK calloutKey', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    const tagDefinition = buildTagDefinition({
      action: { type: 'command', commandId: 'editor:toggle-checklist-status' },
      calloutKey: ACTIVE_TAG_KEY_TASK,
    });
    const context = buildContext({
      activeTagKeys: new Set([ACTIVE_TAG_KEY_TASK]),
      getEditor: () => fakeEditor as never,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(removeActiveCheckboxMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
    expect(applyTagMock).not.toHaveBeenCalled();
  });
});

describe('selectTagFromDropdown — applyTag path', () => {
  beforeEach(() => jest.clearAllMocks());

  it('applies the tag and closes the menu when no active tag matches', () => {
    const action = { type: 'callout' as const, calloutType: 'note' };
    const fakeEditor = {};
    const executeCommand = jest.fn();
    const setMoreMenuOpen = jest.fn();
    const tagDefinition = buildTagDefinition({ action, calloutKey: 'note' });
    const context = buildContext({
      activeTagKeys: new Set(),
      getEditor: () => fakeEditor as never,
      executeCommand,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(applyTagMock).toHaveBeenCalledWith(fakeEditor, action, executeCommand);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('closes the menu without calling applyTag when no editor is active', () => {
    const tagDefinition = buildTagDefinition({
      action: { type: 'callout', calloutType: 'note' },
    });
    const setMoreMenuOpen = jest.fn();
    const context = buildContext({
      getEditor: () => undefined,
      setMoreMenuOpen,
    });

    selectTagFromDropdown(tagDefinition, context);

    expect(applyTagMock).not.toHaveBeenCalled();
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});
