import { act, renderHook } from '@testing-library/react';
import type { App } from 'obsidian';

import { createAppWithEditor } from '../../../../test-utils/mockApp';
import { ACTIVE_TAG_KEY_TASK } from '../constants';
import { useActiveTagKeys } from './UseActiveTagKeys';

describe('useActiveTagKeys', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns an empty Set when no editor is active', () => {
    const { app } = createAppWithEditor('');
    app.workspace.activeEditor = null;

    const { result } = renderHook(() =>
      useActiveTagKeys(app as unknown as App),
    );

    expect(result.current.size).toBe(0);
  });

  it('detects a callout type from the initial editor content', () => {
    const { app, editor } = createAppWithEditor('> [!important]\n> Body');
    editor.setCursor({ line: 1, ch: 0 });

    const { result } = renderHook(() =>
      useActiveTagKeys(app as unknown as App),
    );

    expect(result.current.has('important')).toBe(true);
  });

  it('updates when the editor-change event fires', () => {
    const { app, editor } = createAppWithEditor('Just text');

    const { result } = renderHook(() =>
      useActiveTagKeys(app as unknown as App),
    );

    expect(result.current.has(ACTIVE_TAG_KEY_TASK)).toBe(false);

    act(() => {
      editor.setValue('- [ ] A task');
      editor.setCursor({ line: 0, ch: 0 });
      app.workspace.trigger('editor-change');
    });

    expect(result.current.has(ACTIVE_TAG_KEY_TASK)).toBe(true);
  });

  it('updates when the active-leaf-change event fires', () => {
    const { app, editor } = createAppWithEditor('');

    const { result } = renderHook(() =>
      useActiveTagKeys(app as unknown as App),
    );

    act(() => {
      editor.setValue('> [!tip]\n> Body');
      editor.setCursor({ line: 0, ch: 0 });
      app.workspace.trigger('active-leaf-change');
    });

    expect(result.current.has('tip')).toBe(true);
  });

  it('throttles selectionchange events', () => {
    const { app, editor } = createAppWithEditor('Just text');

    const { result } = renderHook(() =>
      useActiveTagKeys(app as unknown as App),
    );

    act(() => {
      editor.setValue('> [!warning]\n> Content');
      editor.setCursor({ line: 1, ch: 0 });
      // Dispatch selectionchange — should NOT update immediately (throttled)
      document.dispatchEvent(new Event('selectionchange'));
    });

    // Not yet updated before throttle timer fires
    expect(result.current.has('warning')).toBe(false);

    act(() => {
      jest.advanceTimersByTime(80);
    });

    expect(result.current.has('warning')).toBe(true);
  });
});
