import { selectTagFromDropdown } from './helpers';
import type { TagDefinition } from '../interfaces';
import type { TagDropdownSelectContext } from './interfaces';
import { ACTIVE_TAG_KEY_TASK } from '../constants';

const applyCalloutMock = jest.fn();
const applyTaskMock = jest.fn();
const removeInnermostCalloutMock = jest.fn();
const removeCalloutByKeyMock = jest.fn();
const removeCheckboxMock = jest.fn();

jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  applyCallout: (...args: unknown[]) => applyCalloutMock(...args),
  applyTask: (...args: unknown[]) => applyTaskMock(...args),
  removeInnermostCallout: (...args: unknown[]) => removeInnermostCalloutMock(...args),
  removeCalloutByKey: (...args: unknown[]) => removeCalloutByKeyMock(...args),
  removeCheckbox: (...args: unknown[]) => removeCheckboxMock(...args),
}));

function buildTagDefinition(overrides: Partial<TagDefinition>): TagDefinition {
  return {
    label: 'Test Tag',
    swatchColor: '#000',
    icon: null,
    action: { type: 'callout', calloutType: 'note' },
    ...overrides,
  };
}

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

beforeEach(() => jest.clearAllMocks());

describe('selectTagFromDropdown — isCustomizeTags path', () => {
  it('opens the customize modal and closes the menu', () => {
    const setCustomizeModalOpen = jest.fn();
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isCustomizeTags: true }),
      buildContext({ setCustomizeModalOpen, setMoreMenuOpen })
    );
    expect(setCustomizeModalOpen).toHaveBeenCalledWith(true);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });
});

describe('selectTagFromDropdown — isRemoveTag path', () => {
  it('does nothing when canRemoveTag is false', () => {
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isRemoveTag: true }),
      buildContext({ canRemoveTag: false, setMoreMenuOpen })
    );
    expect(setMoreMenuOpen).not.toHaveBeenCalled();
    expect(removeInnermostCalloutMock).not.toHaveBeenCalled();
  });

  it('calls removeInnermostCallout and closes menu when canRemoveTag is true', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isRemoveTag: true }),
      buildContext({ canRemoveTag: true, getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeInnermostCalloutMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — active callout toggle-off', () => {
  it('calls removeCalloutByKey with the calloutKey when callout is active', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'callout', calloutType: 'important', calloutTitle: 'Important' }, calloutKey: 'Important' }),
      buildContext({ activeTagKeys: new Set(['Important']), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeCalloutByKeyMock).toHaveBeenCalledWith(fakeEditor, 'Important');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — active task toggle-off', () => {
  it('calls removeCheckbox when task is active', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'command', commandId: 'editor:toggle-checklist-status' }, calloutKey: ACTIVE_TAG_KEY_TASK }),
      buildContext({ activeTagKeys: new Set([ACTIVE_TAG_KEY_TASK]), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeCheckboxMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — apply new callout', () => {
  it('calls applyCallout with type and title and closes menu', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Idea' }, calloutKey: 'Idea' }),
      buildContext({ activeTagKeys: new Set(), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(applyCalloutMock).toHaveBeenCalledWith(fakeEditor, 'tip', 'Idea');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('calls applyTask with taskPrefix for task actions', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'task', taskPrefix: 'Discuss:' }, calloutKey: 'task-prefix:Discuss:' }),
      buildContext({ activeTagKeys: new Set(), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(applyTaskMock).toHaveBeenCalledWith(fakeEditor, 'Discuss:');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('calls executeCommand for command actions', () => {
    const executeCommand = jest.fn();
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'command', commandId: 'some-command' } }),
      buildContext({ executeCommand, setMoreMenuOpen })
    );
    expect(executeCommand).toHaveBeenCalledWith('some-command');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — isDisabled path', () => {
  it('does nothing when tag is disabled', () => {
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isDisabled: true }),
      buildContext({ setMoreMenuOpen })
    );
    expect(setMoreMenuOpen).not.toHaveBeenCalled();
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });
});
