import { act, renderHook } from '@testing-library/react';
import type { App } from 'obsidian';
import { createAppWithEditor } from '../../test-utils/mockApp';
import {
  addTagInEditor,
  copyFormatFromEditor,
} from '../editor/styling-engine/editorIntegration';
import type { CopiedFormat } from '../editor/styling-engine/interfaces';
import { useFormatPainter } from './useFormatPainter';

jest.mock('../editor/styling-engine/editorIntegration', () => ({
  copyFormatFromEditor: jest.fn(),
  addTagInEditor: jest.fn(),
}));

const mockedCopyFormatFromEditor = copyFormatFromEditor as jest.MockedFunction<
  typeof copyFormatFromEditor
>;
const mockedAddTagInEditor = addTagInEditor as jest.MockedFunction<
  typeof addTagInEditor
>;

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

    const { result } = renderHook(() =>
      useFormatPainter(app as unknown as App),
    );

    act(() => {
      result.current.handleSingleClick(1);
    });

    expect(result.current.state.mode).toBe('armed');

    act(() => {
      editorContainerElement.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      jest.advanceTimersByTime(100);
    });

    expect(mockedAddTagInEditor).toHaveBeenCalledTimes(1);
    expect(result.current.state.mode).toBe('idle');
  });

  it('locks on double click without firing single-click arming behavior', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() =>
      useFormatPainter(app as unknown as App),
    );

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

    const { result } = renderHook(() =>
      useFormatPainter(app as unknown as App),
    );

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('locked');

    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    act(() => {
      editorContainerElement.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      jest.advanceTimersByTime(100);
    });

    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 12 });

    act(() => {
      editorContainerElement.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      jest.advanceTimersByTime(100);
    });

    expect(mockedAddTagInEditor).toHaveBeenCalledTimes(2);
    expect(result.current.state.mode).toBe('locked');
  });

  it('cancels locked mode on Escape', () => {
    const { app } = createAppWithEditor('hello world');

    mockedCopyFormatFromEditor.mockReturnValue(copiedFormatFixture);

    const { result } = renderHook(() =>
      useFormatPainter(app as unknown as App),
    );

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

    const { result } = renderHook(() =>
      useFormatPainter(app as unknown as App),
    );

    act(() => {
      result.current.handleSingleClick(1);
    });

    expect(result.current.state.mode).toBe('idle');

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(result.current.state.mode).toBe('idle');
  });
});
