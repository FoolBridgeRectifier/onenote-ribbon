import { renderHook } from '@testing-library/react';
import { useTagHandlers } from './UseTagHandlers';
import type { TagHandlersOptions } from './interfaces';

const addTagMock = jest.fn();
const removeTagMock = jest.fn();
const toggleTagMock = jest.fn();
const saveCustomTagsMock = jest.fn();
const selectTagFromDropdownMock = jest.fn();

jest.mock('../../../../shared/editor-v2/styling-engine/editor-integration/stylingEngine', () => ({
  addTag: (...args: unknown[]) => addTagMock(...args),
  removeTag: (...args: unknown[]) => removeTagMock(...args),
  toggleTag: (...args: unknown[]) => toggleTagMock(...args),
}));

jest.mock('../tag-storage/TagStorage', () => ({
  saveCustomTags: (...args: unknown[]) => saveCustomTagsMock(...args),
}));

jest.mock('./helpers', () => ({
  selectTagFromDropdown: (...args: unknown[]) => selectTagFromDropdownMock(...args),
  // Use the real applyCalloutToggle so handleImportant/handleQuestion tests remain meaningful
  applyCalloutToggle: jest.requireActual('./helpers').applyCalloutToggle,
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
  it('executes toggle checklist command when task is not active and cursor is on a plain line', () => {
    const executeCommandById = jest.fn();
    const mockEditor = {
      getCursor: () => ({ line: 0, ch: 0 }),
      getLine: () => 'A plain line of text',
    };
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();
    expect(executeCommandById).toHaveBeenCalledWith('editor:toggle-checklist-status');
  });

  it('calls applyTask when cursor is on a callout header with a title and task is not active', () => {
    const executeCommandById = jest.fn();
    const mockEditor = {
      getCursor: () => ({ line: 0, ch: 14 }),
      getLine: () => '> [!note] My Meeting Notes',
    };
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();
    expect(addTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'task', taskPrefix: '' });
    expect(executeCommandById).not.toHaveBeenCalled();
  });

  it('calls applyTask with empty prefix to replace existing task when task is already active', () => {
    const mockEditor = {
      getCursor: () => ({ line: 0, ch: 5 }),
      getLine: () => '- [ ] Some existing task',
    };
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['__task__']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();
    expect(addTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'task', taskPrefix: '' });
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
    expect(addTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' });
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
    expect(removeTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'callout', calloutTitle: 'Important' });
    expect(addTagMock).not.toHaveBeenCalled();
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
    expect(addTagMock).not.toHaveBeenCalled();
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
    expect(addTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'callout', calloutType: 'question', calloutTitle: 'Question' });
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
    expect(removeTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'callout', calloutTitle: 'Question' });
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
    expect(toggleTagMock).toHaveBeenCalledWith(mockEditor, { kind: 'inline-todo' });
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
    expect(toggleTagMock).not.toHaveBeenCalled();
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
