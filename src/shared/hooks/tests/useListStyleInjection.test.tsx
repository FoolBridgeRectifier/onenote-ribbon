import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Plugin } from 'obsidian';

import { PluginContext } from '../../context/PluginContext';
import { createMockPlugin, MockPlugin } from '../../../test-utils/mockApp';
import { useListStyleInjection } from '../useListStyleInjection';
import {
  DEFAULT_LIST_STYLE_SETTINGS,
  LIST_STYLE_ELEMENT_ID,
} from '../../../tabs/home/basic-text/list-buttons/constants';

// ============================================================
// Test harness
// ============================================================

/** Wraps children in PluginContext.Provider for renderHook usage. */
function createPluginWrapper(mockPlugin: MockPlugin) {
  return ({ children }: { children: React.ReactNode }) => (
    <PluginContext.Provider value={mockPlugin as unknown as Plugin}>
      {children}
    </PluginContext.Provider>
  );
}

/** Renders the hook with a given plugin mock and flushes the async load effect. */
async function renderAndFlush(mockPlugin: MockPlugin) {
  const hookResult = renderHook(() => useListStyleInjection(), {
    wrapper: createPluginWrapper(mockPlugin),
  });

  // Flush the microtask queue so loadData() resolves and state updates settle
  await act(async () => {});

  return hookResult;
}

// ============================================================
// Teardown
// ============================================================

afterEach(() => {
  // Remove the injected style element between tests to prevent bleed-through
  const injectedStyleElement = document.getElementById(LIST_STYLE_ELEMENT_ID);
  if (injectedStyleElement) injectedStyleElement.remove();
});

// ============================================================
// a) Initial load
// ============================================================

describe('useListStyleInjection — initial load', () => {
  it('returns saved preset IDs when loadData resolves with full settings', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'decimal-period' });
    const { result } = await renderAndFlush(mockPlugin);

    expect(result.current.bulletPresetId).toBe('classic');
    expect(result.current.numberPresetId).toBe('decimal-period');
  });

  it('falls back to DEFAULT_LIST_STYLE_SETTINGS when loadData resolves with null', async () => {
    const mockPlugin = createMockPlugin(null);
    const { result } = await renderAndFlush(mockPlugin);

    expect(result.current.bulletPresetId).toBe(DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId);
    expect(result.current.numberPresetId).toBe(DEFAULT_LIST_STYLE_SETTINGS.numberPresetId);
  });

  it('merges partial settings with defaults when only bulletPresetId is present', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic' });
    const { result } = await renderAndFlush(mockPlugin);

    expect(result.current.bulletPresetId).toBe('classic');
    expect(result.current.numberPresetId).toBe(DEFAULT_LIST_STYLE_SETTINGS.numberPresetId);
  });
});

// ============================================================
// b) CSS injection on mount
// ============================================================

describe('useListStyleInjection — CSS injection on mount', () => {
  it('injects a <style id="onr-list-style"> into document.head after mounting with classic bullets', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    await renderAndFlush(mockPlugin);

    const styleElement = document.getElementById(LIST_STYLE_ELEMENT_ID);
    expect(styleElement).not.toBeNull();
    expect(styleElement!.tagName.toLowerCase()).toBe('style');
  });

  it('injected CSS contains the L1 classic symbol (●) for .markdown-preview-view scope', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    await renderAndFlush(mockPlugin);

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).toContain('●');
    expect(cssText).toContain('.markdown-preview-view');
  });

  it('injected CSS contains the L2 classic symbol (○) for .markdown-preview-view scope', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    await renderAndFlush(mockPlugin);

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).toContain('○');
  });

  it('injected CSS does NOT contain bullet symbols when bulletPresetId is "none"', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'none' });
    await renderAndFlush(mockPlugin);

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).not.toContain('●');
    expect(cssText).not.toContain('○');
  });

  it('injected CSS contains list-style-type: decimal when numberPresetId is "decimal-period"', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'decimal-period' });
    await renderAndFlush(mockPlugin);

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).toContain('list-style-type: decimal');
  });

  it('injected CSS contains the counter(list-item, decimal) expression when numberPresetId is "decimal-paren"', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'decimal-paren' });
    await renderAndFlush(mockPlugin);

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).toContain('counter(list-item, decimal)');
  });
});

// ============================================================
// c) setBulletPreset
// ============================================================

describe('useListStyleInjection — setBulletPreset', () => {
  it('updates the returned bulletPresetId to the new preset ID', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setBulletPreset('diamond');
    });

    expect(result.current.bulletPresetId).toBe('diamond');
  });

  it('updates the injected CSS to contain the L1 diamond symbol (◆)', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setBulletPreset('diamond');
    });

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).toContain('◆');
  });

  it('calls plugin.saveData with the new bulletPresetId and current numberPresetId', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'decimal-period' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setBulletPreset('diamond');
    });

    expect(mockPlugin.saveData).toHaveBeenCalledWith({
      bulletPresetId: 'diamond',
      numberPresetId: 'decimal-period',
    });
  });

  it('removes bullet CSS (no ◆ or ●) when setBulletPreset is called with "none"', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setBulletPreset('none');
    });

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).not.toContain('◆');
    expect(cssText).not.toContain('●');
  });
});

// ============================================================
// d) setNumberPreset
// ============================================================

describe('useListStyleInjection — setNumberPreset', () => {
  it('updates the returned numberPresetId to the new preset ID', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'none' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setNumberPreset('decimal-period');
    });

    expect(result.current.numberPresetId).toBe('decimal-period');
  });

  it('injects list-style-type: decimal in the CSS after setNumberPreset("decimal-period")', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'none' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setNumberPreset('decimal-period');
    });

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).toContain('list-style-type: decimal');
  });

  it('removes number CSS when setNumberPreset is called with "none"', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'decimal-period' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setNumberPreset('none');
    });

    const cssText = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(cssText).not.toContain('list-style-type: decimal');
  });

  it('calls plugin.saveData with the new numberPresetId and current bulletPresetId', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });
    const { result } = await renderAndFlush(mockPlugin);

    act(() => {
      result.current.setNumberPreset('decimal-period');
    });

    expect(mockPlugin.saveData).toHaveBeenCalledWith({
      bulletPresetId: 'classic',
      numberPresetId: 'decimal-period',
    });
  });
});

// ============================================================
// e) Persistence not triggered on initial load
// ============================================================

describe('useListStyleInjection — persistence on initial load', () => {
  it('does NOT call plugin.saveData when only mounted (no setter called)', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'decimal-period' });
    await renderAndFlush(mockPlugin);

    expect(mockPlugin.saveData).not.toHaveBeenCalled();
  });

  it('does NOT call plugin.saveData when loadData resolves with null (fallback applied)', async () => {
    const mockPlugin = createMockPlugin(null);
    await renderAndFlush(mockPlugin);

    expect(mockPlugin.saveData).not.toHaveBeenCalled();
  });
});
