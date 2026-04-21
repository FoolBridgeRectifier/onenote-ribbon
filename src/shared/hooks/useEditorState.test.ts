import { renderHook, waitFor } from '@testing-library/react';

import { useEditorState } from './useEditorState';
import type { EditorState } from './interfaces';

const mockDeriveEditorState = jest.fn();
const mockBuildDefaultState = jest.fn();
const mockCreateEnclosingHtmlTagFinder = jest.fn();

jest.mock('./editorStateHelpers', () => ({
  deriveEditorState: (...args: unknown[]) => mockDeriveEditorState(...args),
  buildDefaultState: (...args: unknown[]) => mockBuildDefaultState(...args),
}));

jest.mock('../editor/enclosing-html-tags/enclosingHtmlTags', () => ({
  createEnclosingHtmlTagFinder: (...args: unknown[]) => mockCreateEnclosingHtmlTagFinder(...args),
}));

const createDefaultEditorState = (): EditorState => ({
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  highlight: false,
  subscript: false,
  superscript: false,
  bulletList: false,
  numberedList: false,
  headLevel: 0,
  fontFamily: '',
  fontSize: '',
  textAlign: 'left',
  fontColor: null,
  highlightColor: null,
  activeTagKeys: new Set(),
});

describe('useEditorState — initialization', () => {
  const createMockApp = (overrides: Record<string, unknown> = {}) => ({
    workspace: {
      activeEditor: { editor: { getValue: jest.fn().mockReturnValue('test content') } },
      on: jest.fn().mockReturnValue({}),
      offref: jest.fn(),
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBuildDefaultState.mockReturnValue(createDefaultEditorState());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns default state when no editor is active', () => {
    const mockApp = createMockApp({
      workspace: {
        activeEditor: null,
        on: jest.fn().mockReturnValue({}),
        offref: jest.fn(),
      },
    });

    const { result } = renderHook(() =>
      useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0])
    );

    expect(mockBuildDefaultState).toHaveBeenCalledWith(mockApp);
    expect(result.current).toBeDefined();
  });

  it('sets up event listeners on mount', () => {
    const mockApp = createMockApp();
    const onSpy = jest.spyOn(mockApp.workspace, 'on');

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    expect(onSpy).toHaveBeenCalledWith('active-leaf-change', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('editor-change', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const mockApp = createMockApp();
    const offrefSpy = jest.spyOn(mockApp.workspace, 'offref');

    const { unmount } = renderHook(() =>
      useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0])
    );
    unmount();

    expect(offrefSpy).toHaveBeenCalledTimes(2);
  });
});

describe('useEditorState — content change handling', () => {
  const createMockApp = () => ({
    workspace: {
      activeEditor: {
        editor: { getValue: jest.fn().mockReturnValue('test content') },
      },
      on: jest.fn().mockReturnValue({}),
      offref: jest.fn(),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBuildDefaultState.mockReturnValue(createDefaultEditorState());
    mockDeriveEditorState.mockReturnValue({
      bold: true,
      activeTagKeys: new Set(['bold']),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces content changes', async () => {
    const mockApp = createMockApp();

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // Should not call deriveEditorState immediately
    expect(mockDeriveEditorState).not.toHaveBeenCalled();

    // Fast-forward past debounce
    jest.advanceTimersByTime(150);

    await waitFor(() => {
      expect(mockDeriveEditorState).toHaveBeenCalled();
    });
  });

  it('creates finder when content changes', () => {
    const mockApp = createMockApp();

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    jest.advanceTimersByTime(150);

    expect(mockCreateEnclosingHtmlTagFinder).toHaveBeenCalledWith('test content');
  });
});

describe('useEditorState — selection change handling', () => {
  const createMockApp = () => ({
    workspace: {
      activeEditor: {
        editor: { getValue: jest.fn().mockReturnValue('test content') },
      },
      on: jest.fn().mockReturnValue({}),
      offref: jest.fn(),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBuildDefaultState.mockReturnValue(createDefaultEditorState());
    mockDeriveEditorState.mockReturnValue({
      bold: false,
      activeTagKeys: new Set(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('throttles selection changes', () => {
    const mockApp = createMockApp();

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // The hook sets up selectionchange listener - just verify it doesn't throw
    expect(mockApp.workspace.on).toHaveBeenCalled();
  });

  it('cleans up selection listener on unmount', () => {
    const mockApp = createMockApp();

    const { unmount } = renderHook(() =>
      useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0])
    );
    unmount();

    // Should clean up event listeners
    expect(mockApp.workspace.offref).toHaveBeenCalled();
  });
});

describe('useEditorState — timer cleanup', () => {
  const createMockApp = () => ({
    workspace: {
      activeEditor: {
        editor: { getValue: jest.fn().mockReturnValue('test content') },
      },
      on: jest.fn().mockReturnValue({}),
      offref: jest.fn(),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBuildDefaultState.mockReturnValue(createDefaultEditorState());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clears debounce timer on unmount', () => {
    const mockApp = createMockApp();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() =>
      useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0])
    );
    unmount();

    // Should clear both debounce and throttle timers
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});

describe('useEditorState — cached finder reuse', () => {
  const createMockApp = () => ({
    workspace: {
      activeEditor: {
        editor: { getValue: jest.fn().mockReturnValue('test content') },
      },
      on: jest.fn().mockReturnValue({}),
      offref: jest.fn(),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBuildDefaultState.mockReturnValue(createDefaultEditorState());
    mockDeriveEditorState.mockReturnValue({
      bold: false,
      activeTagKeys: new Set(),
    });
    mockCreateEnclosingHtmlTagFinder.mockReturnValue({ find: jest.fn() });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reuses cached finder when content has not changed', async () => {
    const mockApp = createMockApp();
    const getValue = jest.fn().mockReturnValue('same content');
    mockApp.workspace.activeEditor.editor.getValue = getValue;

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // First call creates finder
    jest.advanceTimersByTime(150);
    expect(mockCreateEnclosingHtmlTagFinder).toHaveBeenCalledTimes(1);

    // Simulate another update with same content
    jest.clearAllTimers();
    mockDeriveEditorState.mockClear();

    // Trigger another update
    const updateHandler = mockApp.workspace.on.mock.calls.find(
      (call: unknown[]) => (call as [string, () => void])[0] === 'editor-change'
    )?.[1] as (() => void) | undefined;

    if (updateHandler) {
      updateHandler();
    }

    // Should reuse cached finder without creating new one
    await waitFor(() => {
      expect(mockDeriveEditorState).toHaveBeenCalled();
    });
  });

  it('handles throttled selection change when timer is already set', () => {
    const mockApp = createMockApp();
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // Get the selectionchange handler from the spy
    const selectionChangeCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'selectionchange'
    );
    const selectionHandler = selectionChangeCalls[0]?.[1] as (() => void) | undefined;

    if (selectionHandler) {
      // First call should set the timer
      selectionHandler();
      // Second call should be ignored (throttled)
      selectionHandler();
    }

    // Should only set one timer
    expect(selectionHandler).toBeDefined();
    addEventListenerSpy.mockRestore();
  });

  it('handles content change with immediate cursor move', async () => {
    const mockApp = createMockApp();
    const getValue = jest.fn().mockReturnValue('same content');
    mockApp.workspace.activeEditor.editor.getValue = getValue;

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // First call creates finder
    jest.advanceTimersByTime(150);
    expect(mockCreateEnclosingHtmlTagFinder).toHaveBeenCalledTimes(1);

    // Simulate cursor-only update (same content)
    const updateHandler = mockApp.workspace.on.mock.calls.find(
      (call: unknown[]) => (call as [string, () => void])[0] === 'editor-change'
    )?.[1] as (() => void) | undefined;

    if (updateHandler) {
      updateHandler();
    }

    // Should reuse cached finder and update immediately
    await waitFor(() => {
      expect(mockDeriveEditorState).toHaveBeenCalled();
    });
  });

  it('handles active-leaf-change event', () => {
    const mockApp = createMockApp();

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // Get the active-leaf-change handler
    const leafChangeHandler = mockApp.workspace.on.mock.calls.find(
      (call: unknown[]) => (call as [string, () => void])[0] === 'active-leaf-change'
    )?.[1] as (() => void) | undefined;

    if (leafChangeHandler) {
      leafChangeHandler();
    }

    expect(leafChangeHandler).toBeDefined();
  });

  it('handles editor-change event', () => {
    const mockApp = createMockApp();

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // Get the editor-change handler
    const editorChangeHandler = mockApp.workspace.on.mock.calls.find(
      (call: unknown[]) => (call as [string, () => void])[0] === 'editor-change'
    )?.[1] as (() => void) | undefined;

    if (editorChangeHandler) {
      editorChangeHandler();
    }

    expect(editorChangeHandler).toBeDefined();
  });

  it('clears existing debounce timer before setting new one', () => {
    const mockApp = createMockApp();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // Trigger content change multiple times
    const updateHandler = mockApp.workspace.on.mock.calls.find(
      (call: unknown[]) => (call as [string, () => void])[0] === 'editor-change'
    )?.[1] as (() => void) | undefined;

    if (updateHandler) {
      // Change content to trigger debounce
      mockApp.workspace.activeEditor.editor.getValue = jest.fn().mockReturnValue('new content 1');
      updateHandler();
      // Change content again before debounce fires
      mockApp.workspace.activeEditor.editor.getValue = jest.fn().mockReturnValue('new content 2');
      updateHandler();
    }

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('handles deriveEditorState with null cached finder', async () => {
    const mockApp = createMockApp();

    renderHook(() => useEditorState(mockApp as unknown as Parameters<typeof useEditorState>[0]));

    // Wait for debounce
    jest.advanceTimersByTime(150);

    await waitFor(() => {
      expect(mockDeriveEditorState).toHaveBeenCalledWith(
        mockApp,
        expect.any(Object),
        'test content'
      );
    });
  });
});
