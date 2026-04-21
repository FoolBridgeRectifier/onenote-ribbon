import { renderHook } from '@testing-library/react';
import { useTagHandlers } from './UseTagHandlers';
import type { TagHandlersOptions } from './interfaces';

const applyCalloutMock = jest.fn();
const removeCalloutByKeyMock = jest.fn();
const removeCheckboxMock = jest.fn();
const toggleInlineTodoMock = jest.fn();
const saveCustomTagsMock = jest.fn();
const selectTagFromDropdownMock = jest.fn();

jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  applyCallout: (...args: unknown[]) => applyCalloutMock(...args),
  removeCalloutByKey: (...args: unknown[]) => removeCalloutByKeyMock(...args),
  removeCheckbox: (...args: unknown[]) => removeCheckboxMock(...args),
  toggleInlineTodo: (...args: unknown[]) => toggleInlineTodoMock(...args),
}));

jest.mock('../tag-storage/TagStorage', () => ({
  saveCustomTags: (...args: unknown[]) => saveCustomTagsMock(...args),
}));

jest.mock('./helpers', () => ({
  selectTagFromDropdown: (...args: unknown[]) => selectTagFromDropdownMock(...args),
}));

function buildOptions(overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions {
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
}

beforeEach(() => jest.clearAllMocks());

describe('useTagHandlers — initialization', () => {
  it('returns all expected handler functions', () => {
    const { result } = renderHook(() => useTagHandlers(buildOptions()));
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
  it('executes toggle checklist command when task is not active', () => {
    const executeCommandById = jest.fn();
    const options = buildOptions({
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

  it('calls removeCheckbox when task is already active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['__task__']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();
    expect(removeCheckboxMock).toHaveBeenCalledWith(mockEditor);
  });
});

describe('useTagHandlers — handleImportant', () => {
  it('calls applyCallout with important type when Important is not active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();
    expect(applyCalloutMock).toHaveBeenCalledWith(mockEditor, 'important', 'Important');
  });

  it('calls removeCalloutByKey("Important") when Important is active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['Important']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();
    expect(removeCalloutByKeyMock).toHaveBeenCalledWith(mockEditor, 'Important');
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });

  it('does nothing when no active editor', () => {
    const options = buildOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });
    const { result } = renderHook(() => useTagHandlers(options));
    expect(() => result.current.handleImportant()).not.toThrow();
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleQuestion', () => {
  it('calls applyCallout with question type when Question is not active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();
    expect(applyCalloutMock).toHaveBeenCalledWith(mockEditor, 'question', 'Question');
  });

  it('calls removeCalloutByKey("Question") when Question is active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['Question']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();
    expect(removeCalloutByKeyMock).toHaveBeenCalledWith(mockEditor, 'Question');
  });
});

describe('useTagHandlers — handleToDoTag', () => {
  it('calls toggleInlineTodo when editor is active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleToDoTag();
    expect(toggleInlineTodoMock).toHaveBeenCalledWith(mockEditor);
  });

  it('does nothing when no editor is active', () => {
    const options = buildOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleToDoTag();
    expect(toggleInlineTodoMock).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleCustomTagsChange', () => {
  it('saves and updates custom tags', () => {
    const setCustomTags = jest.fn();
    const options = buildOptions({ setCustomTags });
    const { result } = renderHook(() => useTagHandlers(options));
    const updatedTags = [{ label: 'Tag A', color: '#ff0000' }] as never;
    result.current.handleCustomTagsChange(updatedTags);
    expect(saveCustomTagsMock).toHaveBeenCalledWith(updatedTags);
    expect(setCustomTags).toHaveBeenCalledWith(updatedTags);
  });
});
