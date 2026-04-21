import { act, renderHook } from '@testing-library/react';
import type { App } from 'obsidian';
import { createAppWithEditor } from '../../test-utils/mockApp';
import {
  addTagInEditor,
  copyFormatFromEditor,
} from '../editor/styling-engine/editor-integration/helpers';
import type { CopiedFormat } from '../editor/styling-engine/interfaces';
import { useFormatPainter } from './useFormatPainter';

jest.mock('../editor/styling-engine/editor-integration/helpers', () => ({
  copyFormatFromEditor: jest.fn(),
  addTagInEditor: jest.fn(),
}));

const mockedCopyFormatFromEditor = copyFormatFromEditor as jest.MockedFunction<
  typeof copyFormatFromEditor
>;
const mockedAddTagInEditor = addTagInEditor as jest.MockedFunction<typeof addTagInEditor>;

const copiedFormatFixture: CopiedFormat = {
  tagDefinitions: [
    {
      tagName: 'b',
      domain: 'html',
      openingMarkup: '<b>',
      closingMarkup: '</b>',
    },
  ],
  domain: 'html',
};

function addEditorContainerToDocument(): HTMLDivElement {
  const editorContainerElement = document.createElement('div');
  editorContainerElement.className = 'cm-editor';
  document.body.appendChild(editorContainerElement);
  return editorContainerElement;
}

describe('useFormatPainter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedCopyFormatFromEditor.mockReset();
    mockedAddTagInEditor.mockReset();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('arms immediately on single click and returns to idle after one editor apply', () => {
    const editorContainerElement = addEditorContainerToDocument();
    const { app, editor } = createAppWithEditor('hello world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleSingleClick(1);
    });

    expect(result.current.state.mode).toBe('armed');

    act(() => {
      editorContainerElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      jest.advanceTimersByTime(100);
    });

    expect(mockedAddTagInEditor).toHaveBeenCalledTimes(1);
    expect(result.current.state.mode).toBe('idle');
  });

  it('locks on double click without firing single-click arming behavior', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleSingleClick(1);
    });

    expect(result.current.state.mode).toBe('armed');

    act(() => {
      // Browser click sequence: first click(detail=1), second click(detail=2), then dblclick.
      result.current.handleSingleClick(2);
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('locked');
    expect(mockedCopyFormatFromEditor).toHaveBeenCalledTimes(1);
  });

  it('stays locked and applies formatting on each editor click', () => {
    const editorContainerElement = addEditorContainerToDocument();
    const { app, editor } = createAppWithEditor('first second');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('locked');

    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    act(() => {
      editorContainerElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      jest.advanceTimersByTime(100);
    });

    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 12 });

    act(() => {
      editorContainerElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      jest.advanceTimersByTime(100);
    });

    expect(mockedAddTagInEditor).toHaveBeenCalledTimes(2);
    expect(result.current.state.mode).toBe('locked');
  });

  it('cancels locked mode on Escape', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('locked');

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.state.mode).toBe('idle');
  });

  it('does not activate when there is no format to copy', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(null);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleSingleClick(1);
    });

    expect(result.current.state.mode).toBe('idle');

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('idle');
  });

  it('handles noop outcome on single click with clickCount > 1', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    // Click count > 1 should result in noop
    act(() => {
      result.current.handleSingleClick(2);
    });

    // Should stay idle since clickCount > 1 results in noop
    expect(result.current.state.mode).toBe('idle');
  });

  it('handles cancel outcome on single click when already armed', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    // First arm the painter
    act(() => {
      result.current.handleSingleClick(1);
    });
    expect(result.current.state.mode).toBe('armed');

    // Second single click should cancel
    act(() => {
      result.current.handleSingleClick(1);
    });
    expect(result.current.state.mode).toBe('idle');
  });

  it('handles promote-to-locked outcome when double clicking while armed', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    // First arm the painter
    act(() => {
      result.current.handleSingleClick(1);
    });
    expect(result.current.state.mode).toBe('armed');

    // Double click should promote to locked without copying format again
    act(() => {
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('locked');
    // Should only copy format once (during single click)
    expect(mockedCopyFormatFromEditor).toHaveBeenCalledTimes(1);
  });

  it('handles cancel outcome on double click when already locked', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    // First lock the painter
    act(() => {
      result.current.handleDoubleClick();
    });
    expect(result.current.state.mode).toBe('locked');

    // Second double click should cancel
    act(() => {
      result.current.handleDoubleClick();
    });
    expect(result.current.state.mode).toBe('idle');
  });

  it('handles empty tagDefinitions when copying format', () => {
    const { app } = createAppWithEditor('hello world');

    // Return format with empty tag definitions
    mockedCopyFormatFromEditor.mockReturnValue({
      tagDefinitions: [],
      domain: 'html',
    });

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleSingleClick(1);
    });

    // Should stay idle since there are no tags to apply
    expect(result.current.state.mode).toBe('idle');
  });

  it('handles empty tagDefinitions on double click', () => {
    const { app } = createAppWithEditor('hello world');

    // Return format with empty tag definitions
    mockedCopyFormatFromEditor.mockReturnValue({
      tagDefinitions: [],
      domain: 'html',
    });

    const { result } = renderHook(() => useFormatPainter(app as unknown as App));

    act(() => {
      result.current.handleDoubleClick();
    });

    // Should stay idle since there are no tags to apply
    expect(result.current.state.mode).toBe('idle');
  });
});
