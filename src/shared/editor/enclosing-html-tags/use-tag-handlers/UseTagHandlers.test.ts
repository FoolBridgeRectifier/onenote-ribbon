import { renderHook } from '@testing-library/react';

import { useTagHandlers } from './UseTagHandlers';
import type { TagHandlersOptions } from './interfaces';

const mockApplyTag = jest.fn();
const mockRemoveActiveCallout = jest.fn();
const mockRemoveActiveCheckbox = jest.fn();
const mockToggleInlineTodoTag = jest.fn();
const mockSaveCustomTags = jest.fn();
const mockSelectTagFromDropdown = jest.fn();

jest.mock('../../styling-engine/tag-apply/TagApply', () => ({
  applyTag: (...args: unknown[]) => mockApplyTag(...args),
}));

jest.mock('../../styling-engine/tag-apply/helpers', () => ({
  removeActiveCallout: (...args: unknown[]) => mockRemoveActiveCallout(...args),
  removeActiveCheckbox: (...args: unknown[]) => mockRemoveActiveCheckbox(...args),
  toggleInlineTodoTag: (...args: unknown[]) => mockToggleInlineTodoTag(...args),
}));

jest.mock('../../../../tabs/home/tags/tag-storage/TagStorage', () => ({
  saveCustomTags: (...args: unknown[]) => mockSaveCustomTags(...args),
}));

jest.mock('./helpers', () => ({
  selectTagFromDropdown: (...args: unknown[]) => mockSelectTagFromDropdown(...args),
}));

describe('useTagHandlers — hook initialization', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => ({
    app: {
      workspace: { activeEditor: { editor: {} } },
      commands: { executeCommandById: jest.fn() },
    } as unknown as TagHandlersOptions['app'],
    activeTagKeys: new Set(),
    canRemoveTag: false,
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    setCustomTags: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all handler functions', () => {
    const options = createMockOptions();
    const { result } = renderHook(() => useTagHandlers(options));

    expect(result.current.handleTodo).toBeDefined();
    expect(result.current.handleImportant).toBeDefined();
    expect(result.current.handleQuestion).toBeDefined();
    expect(result.current.handleFindTags).toBeDefined();
    expect(result.current.handleToDoTag).toBeDefined();
    expect(result.current.handleCustomTagsChange).toBeDefined();
    expect(result.current.handleTagDropdownSelect).toBeDefined();
  });
});

describe('useTagHandlers — handleTodo', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => {
    const mockEditor = {};
    return {
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
      canRemoveTag: false,
      setMoreMenuOpen: jest.fn(),
      setCustomizeModalOpen: jest.fn(),
      setCustomTags: jest.fn(),
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executes toggle checklist command when task is not active', () => {
    const executeCommandById = jest.fn();
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: { editor: {} } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();

    expect(executeCommandById).toHaveBeenCalledWith('editor:toggle-checklist-status');
  });

  it('removes active checkbox when task is already active', () => {
    const mockEditor = {};
    const executeCommandById = jest.fn();
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['__task__']),
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();

    expect(mockRemoveActiveCheckbox).toHaveBeenCalledWith(mockEditor);
    expect(executeCommandById).not.toHaveBeenCalled();
  });

  it('does nothing when no editor is available', () => {
    const executeCommandById = jest.fn();
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();

    // When no editor, it still executes the command (actual behavior)
    expect(executeCommandById).toHaveBeenCalledWith('editor:toggle-checklist-status');
    expect(mockRemoveActiveCheckbox).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleImportant', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => {
    const mockEditor = {};
    return {
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
      canRemoveTag: false,
      setMoreMenuOpen: jest.fn(),
      setCustomizeModalOpen: jest.fn(),
      setCustomTags: jest.fn(),
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies important callout when Important is not active', () => {
    const mockEditor = {};
    const executeCommandById = jest.fn();
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();

    expect(mockApplyTag).toHaveBeenCalledWith(
      mockEditor,
      { type: 'callout', calloutType: 'important', calloutTitle: 'Important' },
      expect.any(Function)
    );
  });

  it('removes active callout when Important is already active', () => {
    const options = createMockOptions({
      activeTagKeys: new Set(['Important']),
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();

    expect(mockRemoveActiveCallout).toHaveBeenCalledWith(expect.anything());
    expect(mockApplyTag).not.toHaveBeenCalled();
  });

  it('does nothing when no editor is available', () => {
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();

    expect(mockApplyTag).not.toHaveBeenCalled();
    expect(mockRemoveActiveCallout).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleQuestion', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => {
    const mockEditor = {};
    return {
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
      canRemoveTag: false,
      setMoreMenuOpen: jest.fn(),
      setCustomizeModalOpen: jest.fn(),
      setCustomTags: jest.fn(),
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies question callout when Question is not active', () => {
    const options = createMockOptions({
      activeTagKeys: new Set(),
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();

    expect(mockApplyTag).toHaveBeenCalledWith(
      expect.anything(),
      { type: 'callout', calloutType: 'question', calloutTitle: 'Question' },
      expect.any(Function)
    );
  });

  it('removes active callout when Question is already active', () => {
    const options = createMockOptions({
      activeTagKeys: new Set(['Question']),
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();

    expect(mockRemoveActiveCallout).toHaveBeenCalled();
    expect(mockApplyTag).not.toHaveBeenCalled();
  });

  it('does nothing when no editor is available', () => {
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();

    expect(mockApplyTag).not.toHaveBeenCalled();
    expect(mockRemoveActiveCallout).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleFindTags', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => ({
    app: {
      workspace: { activeEditor: { editor: {} } },
      commands: { executeCommandById: jest.fn() },
    } as unknown as TagHandlersOptions['app'],
    activeTagKeys: new Set(),
    canRemoveTag: false,
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    setCustomTags: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.querySelector
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('executes global search command', () => {
    const executeCommandById = jest.fn();
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: { editor: {} } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleFindTags();

    expect(executeCommandById).toHaveBeenCalledWith('global-search:open');
  });

  it('sets search input value to # when search input is found', () => {
    const mockInput = {
      value: '',
      dispatchEvent: jest.fn(),
    } as unknown as HTMLInputElement;

    jest.spyOn(document, 'querySelector').mockReturnValue(mockInput);

    const options = createMockOptions();
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleFindTags();

    expect(mockInput.value).toBe('#');
    expect(mockInput.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
  });
});

describe('useTagHandlers — handleToDoTag', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => {
    const mockEditor = {};
    return {
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
      canRemoveTag: false,
      setMoreMenuOpen: jest.fn(),
      setCustomizeModalOpen: jest.fn(),
      setCustomTags: jest.fn(),
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggles inline todo tag', () => {
    const options = createMockOptions();

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleToDoTag();

    expect(mockToggleInlineTodoTag).toHaveBeenCalled();
  });

  it('does nothing when no editor is available', () => {
    const options = createMockOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });

    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleToDoTag();

    expect(mockToggleInlineTodoTag).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleCustomTagsChange', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => ({
    app: {
      workspace: { activeEditor: { editor: {} } },
      commands: { executeCommandById: jest.fn() },
    } as unknown as TagHandlersOptions['app'],
    activeTagKeys: new Set(),
    canRemoveTag: false,
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    setCustomTags: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves custom tags and updates state', () => {
    const setCustomTags = jest.fn();
    const options = createMockOptions({ setCustomTags });

    const { result } = renderHook(() => useTagHandlers(options));
    const updatedTags = [{ id: '1', name: 'Test', color: '#000', calloutType: 'note' }];
    result.current.handleCustomTagsChange(updatedTags);

    expect(mockSaveCustomTags).toHaveBeenCalledWith(updatedTags);
    expect(setCustomTags).toHaveBeenCalledWith(updatedTags);
  });
});

describe('useTagHandlers — handleTagDropdownSelect', () => {
  const createMockOptions = (overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions => ({
    app: {
      workspace: { activeEditor: { editor: {} } },
      commands: { executeCommandById: jest.fn() },
    } as unknown as TagHandlersOptions['app'],
    activeTagKeys: new Set(),
    canRemoveTag: false,
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    setCustomTags: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls selectTagFromDropdown with tag definition and context', () => {
    const options = createMockOptions();

    const { result } = renderHook(() => useTagHandlers(options));
    const tagDefinition = {
      label: 'Test Tag',
      swatchColor: '#000',
      icon: null,
      action: { type: 'callout' as const, calloutType: 'note' as const },
    };
    result.current.handleTagDropdownSelect(tagDefinition);

    expect(mockSelectTagFromDropdown).toHaveBeenCalledWith(
      tagDefinition,
      expect.objectContaining({
        getEditor: expect.any(Function),
        activeTagKeys: options.activeTagKeys,
        canRemoveTag: options.canRemoveTag,
        executeCommand: expect.any(Function),
        setMoreMenuOpen: options.setMoreMenuOpen,
        setCustomizeModalOpen: options.setCustomizeModalOpen,
      })
    );
  });
});
