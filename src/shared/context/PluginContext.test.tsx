import { renderHook } from '@testing-library/react';
import { PluginContext, usePlugin } from './PluginContext';
import type { Plugin } from 'obsidian';

describe('usePlugin', () => {
  it('throws when called outside a PluginContext.Provider', () => {
    // Suppress the expected console.error from React's error boundary during throw
    const originalConsoleError = console.error;
    console.error = jest.fn();

    expect(() => renderHook(() => usePlugin())).toThrow(
      'usePlugin must be used within PluginContext.Provider'
    );

    console.error = originalConsoleError;
  });

  it('returns the plugin when called inside a PluginContext.Provider', () => {
    const mockPlugin = { id: 'test-plugin' } as unknown as Plugin;

    const { result } = renderHook(() => usePlugin(), {
      wrapper: ({ children }) => (
        <PluginContext.Provider value={mockPlugin}>{children}</PluginContext.Provider>
      ),
    });

    expect(result.current).toBe(mockPlugin);
  });
});
