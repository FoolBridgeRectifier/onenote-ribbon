import { selectTagFromDropdown, applyCalloutToggle } from './helpers';
import type { TagDefinition } from '../interfaces';
import type { TagDropdownSelectContext } from './interfaces';
import { ACTIVE_TAG_KEY_TASK } from '../constants';

const addTagMock = jest.fn();
const removeTagMock = jest.fn();

jest.mock('../../../../shared/editor-v2/styling-engine/editor-integration/stylingEngine', () => ({
  addTag: (...args: unknown[]) => addTagMock(...args),
  removeTag: (...args: unknown[]) => removeTagMock(...args),
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
    expect(addTagMock).not.toHaveBeenCalled();
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
    expect(removeTagMock).not.toHaveBeenCalled();
  });

  it('calls removeInnermostCallout and closes menu when canRemoveTag is true', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isRemoveTag: true }),
      buildContext({ canRemoveTag: true, getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'callout' });
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
    expect(removeTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'callout', calloutTitle: 'Important' });
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — active task replace', () => {
  it('calls applyTask with empty prefix when plain todo command is active (replaces instead of removing)', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'command', commandId: 'editor:toggle-checklist-status' }, calloutKey: ACTIVE_TAG_KEY_TASK }),
      buildContext({ activeTagKeys: new Set([ACTIVE_TAG_KEY_TASK]), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(addTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'task', taskPrefix: '' });
    expect(removeTagMock).not.toHaveBeenCalled();
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('calls addTag with same prefix when task-with-prefix is already active (replaces instead of removing)', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'task', taskPrefix: 'Discuss:' }, calloutKey: 'task-prefix:Discuss:' }),
      buildContext({ activeTagKeys: new Set(['task-prefix:Discuss:']), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(addTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'task', taskPrefix: 'Discuss:' });
    expect(removeTagMock).not.toHaveBeenCalled();
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
    expect(addTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'callout', calloutType: 'tip', calloutTitle: 'Idea' });
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('calls addTag with taskPrefix for task actions', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'task', taskPrefix: 'Discuss:' }, calloutKey: 'task-prefix:Discuss:' }),
      buildContext({ activeTagKeys: new Set(), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(addTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'task', taskPrefix: 'Discuss:' });
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
    expect(addTagMock).not.toHaveBeenCalled();
  });
});

describe('applyCalloutToggle', () => {
  it('calls addTag when the callout key is not active', () => {
    const fakeEditor = {};
    applyCalloutToggle(
      () => fakeEditor as never,
      new Set(),
      'Important',
      'important'
    );
    expect(addTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' });
    expect(removeTagMock).not.toHaveBeenCalled();
  });

  it('calls removeTag when the callout key is already active', () => {
    const fakeEditor = {};
    applyCalloutToggle(
      () => fakeEditor as never,
      new Set(['Important']),
      'Important',
      'important'
    );
    expect(removeTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'callout', calloutTitle: 'Important' });
    expect(addTagMock).not.toHaveBeenCalled();
  });

  it('calls neither addTag nor removeTag when getEditor returns undefined', () => {
    applyCalloutToggle(
      () => undefined,
      new Set(),
      'Question',
      'question'
    );
    expect(addTagMock).not.toHaveBeenCalled();
    expect(removeTagMock).not.toHaveBeenCalled();
  });

  it('uses the calloutKey as calloutTitle and calloutType as the type argument', () => {
    const fakeEditor = {};
    applyCalloutToggle(
      () => fakeEditor as never,
      new Set(),
      'Question',
      'question'
    );
    expect(addTagMock).toHaveBeenCalledWith(fakeEditor, { kind: 'callout', calloutType: 'question', calloutTitle: 'Question' });
  });
});
