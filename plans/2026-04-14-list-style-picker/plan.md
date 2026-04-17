# List Style Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract bullet/numbered list buttons from `BasicTextGroup` into a dedicated `ListButtons` component with split-button caret dropdowns that open a Bullet Library or Number Library style picker — each library shows OneNote-style presets that inject global CSS cascade rules into the vault reading view.

**Architecture:** A new `PluginContext` passes the Obsidian `Plugin` instance into React so the `useListStyleInjection` hook can persist the chosen preset (bullet + number) via `plugin.saveData/loadData`. CSS is injected as a `<style id="onr-list-style">` tag in `document.head`, targeting `.markdown-preview-view` and `.markdown-rendered` selectors for all-notes global scope. The `ListButtons` component sits inside `BasicTextGroup` row 1 and replaces the inline bullet/number/outdent/indent block; it exposes split-button toggle + caret, which open `BulletLibrary` / `NumberLibrary` dropdowns rendered via the existing `Dropdown` portal.

**Tech Stack:** React 18, TypeScript strict, Jest + RTL, existing `Dropdown` component, `RibbonButton`, `AppContext` pattern extended with `PluginContext`.

---

## File Map

**Created:**
- `src/shared/context/PluginContext.ts` — React context exposing `Plugin` instance; `usePlugin()` hook
- `src/shared/hooks/useListStyleInjection.ts` — loads settings, manages `<style>` injection, exposes setters
- `src/shared/hooks/useListStyleInjection.test.ts` — unit tests for the hook
- `src/tabs/home/basic-text/list-buttons/constants.ts` — all bullet + number preset data
- `src/tabs/home/basic-text/list-buttons/interfaces.ts` — `BulletPreset`, `NumberPreset`, `ListStyleSettings` types
- `src/tabs/home/basic-text/list-buttons/ListButtons.tsx` — split-button component, wires libraries
- `src/tabs/home/basic-text/list-buttons/list-buttons.css` — split button + active styles
- `src/tabs/home/basic-text/list-buttons/ListButtons.test.tsx` — RTL integration tests
- `src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.tsx` — grid dropdown
- `src/tabs/home/basic-text/list-buttons/bullet-library/bullet-library.css`
- `src/tabs/home/basic-text/list-buttons/bullet-library/constants.ts`
- `src/tabs/home/basic-text/list-buttons/bullet-library/interfaces.ts`
- `src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.test.tsx`
- `src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.tsx` — grid dropdown
- `src/tabs/home/basic-text/list-buttons/number-library/number-library.css`
- `src/tabs/home/basic-text/list-buttons/number-library/constants.ts`
- `src/tabs/home/basic-text/list-buttons/number-library/interfaces.ts`
- `src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.test.tsx`

**Modified:**
- `src/main.ts` — pass `this` (plugin) to `RibbonShell`
- `src/ribbon/RibbonShell.ts` — accept plugin param, provide via `PluginContext`
- `src/tabs/home/basic-text/BasicTextGroup.tsx` — remove inline list block, import `ListButtons`
- `src/tabs/home/basic-text/basic-text-group.css` — remove `.onr-list-caret` rule
- `src/test-utils/mockApp.ts` — add `MockPlugin` interface + `createMockPlugin` factory
- `src/test-utils/renderWithApp.tsx` — accept optional `plugin` param, provide `PluginContext`
- `src/tabs/home/__snapshots__/HomeTabPanel.test.tsx.snap` — regenerate after component change

---

## Task 1: PluginContext + MockPlugin

**Files:**
- Create: `src/shared/context/PluginContext.ts`
- Modify: `src/test-utils/mockApp.ts`
- Modify: `src/test-utils/renderWithApp.tsx`

### Why
Components need `plugin.loadData()` / `plugin.saveData()` for settings persistence. Follows the same pattern as `AppContext`.

- [ ] **Step 1: Create PluginContext**

Create `src/shared/context/PluginContext.ts`:

```ts
import { createContext, useContext } from 'react';
import { Plugin } from 'obsidian';

export const PluginContext = createContext<Plugin>(null!);
export const usePlugin = () => useContext(PluginContext);
```

- [ ] **Step 2: Add MockPlugin to mockApp.ts**

In `src/test-utils/mockApp.ts`, append after the existing exports:

```ts
export interface MockPlugin {
  loadData: jest.Mock<Promise<unknown>, []>;
  saveData: jest.Mock<Promise<void>, [unknown]>;
}

/**
 * Creates a mock Obsidian Plugin with stubbed loadData / saveData.
 *
 * @param initialData  Data that loadData will resolve with on first call.
 */
export function createMockPlugin(initialData: unknown = {}): MockPlugin {
  let storedData = initialData;

  return {
    loadData: jest.fn(() => Promise.resolve(storedData)),
    saveData: jest.fn((newData: unknown) => {
      storedData = newData;
      return Promise.resolve();
    }),
  };
}
```

- [ ] **Step 3: Update renderWithApp to accept optional plugin**

Replace `src/test-utils/renderWithApp.tsx`:

```tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppContext } from '../shared/context/AppContext';
import { PluginContext } from '../shared/context/PluginContext';
import type { MockApp, MockPlugin } from './mockApp';

type RenderWithAppOptions = Omit<RenderOptions, 'wrapper'> & {
  plugin?: MockPlugin;
};

export function renderWithApp(
  component: React.ReactElement,
  app: MockApp,
  options?: RenderWithAppOptions,
) {
  const { plugin, ...renderOptions } = options ?? {};

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const appProvided = (
      <AppContext.Provider value={app as any}>
        {children}
      </AppContext.Provider>
    );

    if (plugin) {
      return (
        <PluginContext.Provider value={plugin as any}>
          {appProvided}
        </PluginContext.Provider>
      );
    }

    return appProvided;
  };

  return render(component, { wrapper, ...renderOptions });
}
```

- [ ] **Step 4: Run tests — must still pass (no regressions)**

```
cmd /c "npm test"
```

Expected: 523 passed, 0 failed

- [ ] **Step 5: Update main.ts to pass plugin to RibbonShell**

Replace `src/main.ts`:

```ts
import { Plugin } from 'obsidian';
import { RibbonShell } from './ribbon/RibbonShell';

export default class OneNoteRibbonPlugin extends Plugin {
  private shell!: RibbonShell;

  async onload() {
    this.shell = new RibbonShell(this.app, this);
    this.shell.mount();
  }

  onunload() {
    this.shell.unmount();
  }
}
```

- [ ] **Step 6: Update RibbonShell to provide PluginContext**

In `src/ribbon/RibbonShell.ts`, add the import and update the constructor + render call:

```ts
import { App, Plugin } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { AppContext } from '../shared/context/AppContext';
import { PluginContext } from '../shared/context/PluginContext';
import { RibbonApp } from './RibbonApp';

export class RibbonShell {
  private rootElement!: HTMLElement;
  private root!: Root;

  constructor(private app: App, private plugin: Plugin) {}

  mount(): void {
    document.getElementById('onenote-ribbon-root')?.remove();

    this.rootElement = document.createElement('div');
    this.rootElement.id = 'onenote-ribbon-root';

    const horizontalMainContainer = document.querySelector(
      '.horizontal-main-container',
    );
    horizontalMainContainer?.parentElement?.insertBefore(
      this.rootElement,
      horizontalMainContainer,
    );

    const titlebarElement = document.querySelector(
      '.titlebar',
    ) as HTMLElement | null;
    if (titlebarElement) {
      this.rootElement.style.marginTop = `${titlebarElement.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.rootElement);
    this.root.render(
      createElement(
        PluginContext.Provider,
        { value: this.plugin },
        createElement(
          AppContext.Provider,
          { value: this.app },
          createElement(RibbonApp),
        ),
      ),
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.rootElement?.remove();
  }
}
```

- [ ] **Step 7: Run tests — must still pass**

```
cmd /c "npm test"
```

Expected: 523 passed, 0 failed

- [ ] **Step 8: Commit**

```
git add src/shared/context/PluginContext.ts src/test-utils/mockApp.ts src/test-utils/renderWithApp.tsx src/main.ts src/ribbon/RibbonShell.ts
git commit -m "feat: add PluginContext for plugin.loadData/saveData access in React tree"
```

---

## Task 2: List button interfaces and constants (preset data)

**Files:**
- Create: `src/tabs/home/basic-text/list-buttons/interfaces.ts`
- Create: `src/tabs/home/basic-text/list-buttons/constants.ts`

### Why
Centralises all preset data. No constants or types may live inside component files per CONVENTIONS.

- [ ] **Step 1: Create interfaces.ts**

Create `src/tabs/home/basic-text/list-buttons/interfaces.ts`:

```ts
/** Defines one bullet style preset: four symbols for nesting levels 1-4. */
export interface BulletPreset {
  /** Stable identifier used in stored settings. */
  id: string;
  /** Human-readable label shown in the library grid. */
  label: string;
  /**
   * Four Unicode symbols, one per nesting depth (L1→L4).
   * Use an empty array to represent "None" (remove overrides).
   */
  levels: [string, string, string, string] | [];
}

/** Defines one numbered list style preset. */
export interface NumberPreset {
  /** Stable identifier used in stored settings. */
  id: string;
  /** Human-readable label shown in the library grid. */
  label: string;
  /**
   * CSS `content` expression for the `::marker` pseudo-element.
   * Set to empty string to represent "None" (remove overrides).
   * Examples:
   *   'counter(list-item, decimal) ".  "'
   *   '"(" counter(list-item, lower-alpha) ")  "'
   */
  markerContent: string;
  /**
   * Optional CSS `list-style-type` property value.
   * When provided, this is used INSTEAD of a custom `markerContent`.
   * Prefer this for the simple period-suffix presets — it honours
   * Obsidian's own counter-reset handling correctly.
   */
  cssListStyleType?: string;
}

/** Persisted plugin settings for list style preferences. */
export interface ListStyleSettings {
  bulletPresetId: string;
  numberPresetId: string;
}

/** Value exposed by the useListStyleInjection hook. */
export interface ListStyleContextValue {
  bulletPresetId: string;
  numberPresetId: string;
  setBulletPreset: (presetId: string) => void;
  setNumberPreset: (presetId: string) => void;
}
```

- [ ] **Step 2: Create constants.ts**

Create `src/tabs/home/basic-text/list-buttons/constants.ts`:

```ts
import type { BulletPreset, NumberPreset } from './interfaces';

/** CSS selector targeting reading-view list items at a given nesting depth. */
export const READING_VIEW_SCOPES = [
  '.markdown-preview-view',
  '.markdown-rendered',
] as const;

/** ID used when no override is active for bullet style. */
export const BULLET_PRESET_NONE_ID = 'none';

/** ID used when no override is active for number style. */
export const NUMBER_PRESET_NONE_ID = 'none';

/** Default settings applied on first load (no overrides). */
export const DEFAULT_LIST_STYLE_SETTINGS = {
  bulletPresetId: BULLET_PRESET_NONE_ID,
  numberPresetId: NUMBER_PRESET_NONE_ID,
} as const;

/**
 * All bullet presets, ordered as they appear in the library grid (None first).
 * Each preset defines Unicode symbols for 4 nesting levels (L1 → L4).
 */
export const BULLET_PRESETS: BulletPreset[] = [
  { id: 'none',      label: 'None',      levels: [] },
  { id: 'classic',   label: 'Classic',   levels: ['●', '○', '■', '□'] },
  { id: 'diamond',   label: 'Diamond',   levels: ['◆', '◇', '●', '○'] },
  { id: 'arrow',     label: 'Arrow',     levels: ['→', '▸', '–', '·'] },
  { id: 'star',      label: 'Star',      levels: ['✦', '◇', '◆', '○'] },
  { id: 'square',    label: 'Square',    levels: ['■', '□', '●', '○'] },
  { id: 'dash',      label: 'Dash',      levels: ['—', '–', '·', '·'] },
  { id: 'checkmark', label: 'Check',     levels: ['✓', '●', '○', '■'] },
];

/**
 * All number presets, ordered as they appear in the library grid (None first).
 * For period-suffix styles we use `cssListStyleType` to let the browser handle
 * counter generation. For paren/wrapped variants we supply inline `markerContent`.
 */
export const NUMBER_PRESETS: NumberPreset[] = [
  // Row 1: None + period-suffix styles
  { id: 'none',                 label: 'None',           markerContent: '' },
  { id: 'decimal-period',       label: '1. 2. 3.',       markerContent: '', cssListStyleType: 'decimal' },
  { id: 'lower-alpha-period',   label: 'a. b. c.',       markerContent: '', cssListStyleType: 'lower-alpha' },
  { id: 'upper-alpha-period',   label: 'A. B. C.',       markerContent: '', cssListStyleType: 'upper-alpha' },

  // Row 2: roman period + paren variants
  { id: 'lower-roman-period',   label: 'i. ii. iii.',    markerContent: '', cssListStyleType: 'lower-roman' },
  { id: 'upper-roman-period',   label: 'I. II. III.',    markerContent: '', cssListStyleType: 'upper-roman' },
  { id: 'decimal-paren',        label: '1) 2) 3)',        markerContent: 'counter(list-item, decimal) ")  "' },
  { id: 'lower-alpha-paren',    label: 'a) b) c)',        markerContent: 'counter(list-item, lower-alpha) ")  "' },

  // Row 3
  { id: 'upper-alpha-paren',    label: 'A) B) C)',        markerContent: 'counter(list-item, upper-alpha) ")  "' },
  { id: 'lower-roman-paren',    label: 'i) ii) iii)',     markerContent: 'counter(list-item, lower-roman) ")  "' },
  { id: 'upper-roman-paren',    label: 'I) II) III)',     markerContent: 'counter(list-item, upper-roman) ")  "' },
  { id: 'decimal-wrapped',      label: '(1) (2) (3)',     markerContent: '"(" counter(list-item, decimal) ")  "' },

  // Row 4
  { id: 'lower-alpha-wrapped',  label: '(a) (b) (c)',    markerContent: '"(" counter(list-item, lower-alpha) ")  "' },
  { id: 'upper-alpha-wrapped',  label: '(A) (B) (C)',    markerContent: '"(" counter(list-item, upper-alpha) ")  "' },
  { id: 'lower-roman-wrapped',  label: '(i) (ii) (iii)', markerContent: '"(" counter(list-item, lower-roman) ")  "' },
  { id: 'upper-roman-wrapped',  label: '(I) (II) (III)', markerContent: '"(" counter(list-item, upper-roman) ")  "' },
];

/** `data-cmd` values used on the split-button sub-regions for test targeting. */
export const LIST_BTN_CMD_BULLET_TOGGLE  = 'bullet-list-toggle';
export const LIST_BTN_CMD_BULLET_CARET   = 'bullet-list-caret';
export const LIST_BTN_CMD_NUMBER_TOGGLE  = 'number-list-toggle';
export const LIST_BTN_CMD_NUMBER_CARET   = 'number-list-caret';
export const LIST_BTN_CMD_OUTDENT        = 'outdent';
export const LIST_BTN_CMD_INDENT         = 'indent';

/** DOM id for the injected list-style `<style>` element. */
export const LIST_STYLE_ELEMENT_ID = 'onr-list-style';
```

- [ ] **Step 3: Run tests — no regressions**

```
cmd /c "npm test"
```

Expected: 523 passed, 0 failed

- [ ] **Step 4: Commit**

```
git add src/tabs/home/basic-text/list-buttons/interfaces.ts src/tabs/home/basic-text/list-buttons/constants.ts
git commit -m "feat: add list-buttons interfaces and preset constants"
```

---

## Task 3: useListStyleInjection hook

**Files:**
- Create: `src/shared/hooks/useListStyleInjection.ts`
- Create: `src/shared/hooks/useListStyleInjection.test.ts`

### Why
Centralises CSS injection and settings persistence in a testable hook. Components only call `setBulletPreset` / `setNumberPreset`.

- [ ] **Step 1: Write the failing test**

Create `src/shared/hooks/useListStyleInjection.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { useListStyleInjection } from './useListStyleInjection';
import { createMockPlugin } from '../../test-utils/mockApp';
import { PluginContext } from '../context/PluginContext';
import React from 'react';
import {
  BULLET_PRESETS,
  NUMBER_PRESETS,
  LIST_STYLE_ELEMENT_ID,
  DEFAULT_LIST_STYLE_SETTINGS,
} from '../../tabs/home/basic-text/list-buttons/constants';

function wrapWithPlugin(plugin: ReturnType<typeof createMockPlugin>) {
  return ({ children }: { children: React.ReactNode }) => (
    <PluginContext.Provider value={plugin as any}>{children}</PluginContext.Provider>
  );
}

describe('useListStyleInjection', () => {
  beforeEach(() => {
    document.getElementById(LIST_STYLE_ELEMENT_ID)?.remove();
  });

  it('returns default preset ids before settings load', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    expect(result.current.bulletPresetId).toBe(DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId);
    expect(result.current.numberPresetId).toBe(DEFAULT_LIST_STYLE_SETTINGS.numberPresetId);
  });

  it('injects style element into document.head on mount', async () => {
    const mockPlugin = createMockPlugin({});
    renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {});

    const styleElement = document.getElementById(LIST_STYLE_ELEMENT_ID);
    expect(styleElement).not.toBeNull();
  });

  it('loads persisted bullet presetId on mount', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'classic', numberPresetId: 'none' });

    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {});

    expect(result.current.bulletPresetId).toBe('classic');
  });

  it('loads persisted number presetId on mount', async () => {
    const mockPlugin = createMockPlugin({ bulletPresetId: 'none', numberPresetId: 'decimal-period' });

    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {});

    expect(result.current.numberPresetId).toBe('decimal-period');
  });

  it('injects bullet CSS when setBulletPreset is called with a non-none preset', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {
      result.current.setBulletPreset('classic');
    });

    const styleElement = document.getElementById(LIST_STYLE_ELEMENT_ID);
    expect(styleElement?.textContent).toContain('●');
  });

  it('injects different bullet symbols per level for a preset', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    const diamondPreset = BULLET_PRESETS.find((preset) => preset.id === 'diamond')!;

    await act(async () => {
      result.current.setBulletPreset('diamond');
    });

    const styleContent = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent!;
    diamondPreset.levels.forEach((symbol) => {
      expect(styleContent).toContain(symbol);
    });
  });

  it('clears bullet CSS when setBulletPreset is called with "none"', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => { result.current.setBulletPreset('classic'); });
    await act(async () => { result.current.setBulletPreset('none'); });

    const styleContent = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(styleContent).not.toContain('::marker');
  });

  it('injects number CSS when setNumberPreset is called with a non-none preset', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {
      result.current.setNumberPreset('decimal-paren');
    });

    const styleContent = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent!;
    expect(styleContent).toContain('decimal');
    expect(styleContent).toContain('")"');
  });

  it('clears number CSS when setNumberPreset is called with "none"', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => { result.current.setNumberPreset('decimal-period'); });
    await act(async () => { result.current.setNumberPreset('none'); });

    const styleContent = document.getElementById(LIST_STYLE_ELEMENT_ID)!.textContent ?? '';
    expect(styleContent).not.toContain('ol');
  });

  it('persists selected bullet preset to plugin settings', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {
      result.current.setBulletPreset('star');
    });

    expect(mockPlugin.saveData).toHaveBeenCalledWith(
      expect.objectContaining({ bulletPresetId: 'star' }),
    );
  });

  it('persists selected number preset to plugin settings', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => {
      result.current.setNumberPreset('lower-alpha-period');
    });

    expect(mockPlugin.saveData).toHaveBeenCalledWith(
      expect.objectContaining({ numberPresetId: 'lower-alpha-period' }),
    );
  });

  it('returns updated presetId after setBulletPreset', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => { result.current.setBulletPreset('checkmark'); });

    expect(result.current.bulletPresetId).toBe('checkmark');
  });

  it('returns updated presetId after setNumberPreset', async () => {
    const mockPlugin = createMockPlugin({});
    const { result } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => { result.current.setNumberPreset('upper-alpha-wrapped'); });

    expect(result.current.numberPresetId).toBe('upper-alpha-wrapped');
  });

  it('does not remove injected style element on unmount', async () => {
    const mockPlugin = createMockPlugin({});
    const { result, unmount } = renderHook(() => useListStyleInjection(), {
      wrapper: wrapWithPlugin(mockPlugin),
    });

    await act(async () => { result.current.setBulletPreset('classic'); });
    unmount();

    const styleElement = document.getElementById(LIST_STYLE_ELEMENT_ID);
    expect(styleElement).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
cmd /c "npm test -- src/shared/hooks/useListStyleInjection.test.ts"
```

Expected: FAIL — `Cannot find module './useListStyleInjection'`

- [ ] **Step 3: Implement useListStyleInjection**

Create `src/shared/hooks/useListStyleInjection.ts`:

```ts
import { useState, useEffect, useRef } from 'react';
import { usePlugin } from '../context/PluginContext';
import {
  BULLET_PRESETS,
  NUMBER_PRESETS,
  LIST_STYLE_ELEMENT_ID,
  DEFAULT_LIST_STYLE_SETTINGS,
  READING_VIEW_SCOPES,
} from '../../tabs/home/basic-text/list-buttons/constants';
import type { BulletPreset, NumberPreset, ListStyleSettings, ListStyleContextValue } from '../../tabs/home/basic-text/list-buttons/interfaces';

/** Generates CSS that overrides bullet markers per nesting depth for the reading view. */
function generateBulletCss(bulletPreset: BulletPreset): string {
  if (bulletPreset.levels.length === 0) return '';

  const scopeString = READING_VIEW_SCOPES.join(', ');

  // Nesting selectors targeting ul depth 1 through 4.
  const nestingSelectors = [
    `ul > li::marker`,
    `ul ul > li::marker`,
    `ul ul ul > li::marker`,
    `ul ul ul ul > li::marker`,
  ];

  return bulletPreset.levels
    .map((symbol, index) => {
      const selector = nestingSelectors[index];
      return READING_VIEW_SCOPES
        .map((scope) => `${scope} ${selector}`)
        .join(',\n') + ` { content: "${symbol}  "; }`;
    })
    .join('\n');
}

/** Generates CSS that overrides numbered list marker content for the reading view. */
function generateNumberCss(numberPreset: NumberPreset): string {
  if (numberPreset.markerContent === '' && !numberPreset.cssListStyleType) return '';

  const scopeSelectors = {
    listItem: READING_VIEW_SCOPES.map((scope) => `${scope} ol li`).join(',\n'),
    marker:   READING_VIEW_SCOPES.map((scope) => `${scope} ol li::marker`).join(',\n'),
  };

  if (numberPreset.cssListStyleType) {
    // Simple list-style-type; browser generates the marker automatically.
    return `${scopeSelectors.listItem} { list-style-type: ${numberPreset.cssListStyleType}; }`;
  }

  // Reset list-style-type to none, then provide fully custom marker content.
  return [
    `${scopeSelectors.listItem} { list-style-type: none; }`,
    `${scopeSelectors.marker} { content: ${numberPreset.markerContent}; }`,
  ].join('\n');
}

/** Returns the existing style element or creates and appends a new one. */
function getOrCreateStyleElement(): HTMLStyleElement {
  const existing = document.getElementById(LIST_STYLE_ELEMENT_ID);
  if (existing instanceof HTMLStyleElement) return existing;

  const styleElement = document.createElement('style');
  styleElement.id = LIST_STYLE_ELEMENT_ID;
  document.head.appendChild(styleElement);
  return styleElement;
}

/** Updates the injected style element with freshly generated CSS for both preset types. */
function updateStyleElement(bulletPresetId: string, numberPresetId: string): void {
  const bulletPreset = BULLET_PRESETS.find((preset) => preset.id === bulletPresetId)
    ?? BULLET_PRESETS[0];
  const numberPreset = NUMBER_PRESETS.find((preset) => preset.id === numberPresetId)
    ?? NUMBER_PRESETS[0];

  const bulletCss = generateBulletCss(bulletPreset);
  const numberCss = generateNumberCss(numberPreset);

  const styleElement = getOrCreateStyleElement();
  styleElement.textContent = [bulletCss, numberCss].filter(Boolean).join('\n');
}

/**
 * Loads and persists list style preferences, injecting global CSS into document.head.
 * The injected <style> tag is intentionally NOT removed on unmount so the reading-view
 * styles survive tab switches within the ribbon.
 */
export function useListStyleInjection(): ListStyleContextValue {
  const plugin = usePlugin();

  const [bulletPresetId, setBulletPresetId] = useState<string>(
    DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId,
  );
  const [numberPresetId, setNumberPresetId] = useState<string>(
    DEFAULT_LIST_STYLE_SETTINGS.numberPresetId,
  );

  // Track current values in a ref so the save callback always writes the latest pair.
  const currentSettingsRef = useRef<ListStyleSettings>({
    bulletPresetId: DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId,
    numberPresetId: DEFAULT_LIST_STYLE_SETTINGS.numberPresetId,
  });

  // Load persisted settings once on mount and apply them.
  useEffect(() => {
    plugin.loadData().then((rawData) => {
      const data = rawData as Partial<ListStyleSettings> | null;
      const loadedBulletPresetId = data?.bulletPresetId ?? DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId;
      const loadedNumberPresetId = data?.numberPresetId ?? DEFAULT_LIST_STYLE_SETTINGS.numberPresetId;

      setBulletPresetId(loadedBulletPresetId);
      setNumberPresetId(loadedNumberPresetId);
      currentSettingsRef.current = { bulletPresetId: loadedBulletPresetId, numberPresetId: loadedNumberPresetId };

      updateStyleElement(loadedBulletPresetId, loadedNumberPresetId);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setBulletPreset = (newBulletPresetId: string) => {
    setBulletPresetId(newBulletPresetId);
    currentSettingsRef.current = { ...currentSettingsRef.current, bulletPresetId: newBulletPresetId };
    updateStyleElement(newBulletPresetId, currentSettingsRef.current.numberPresetId);
    plugin.saveData(currentSettingsRef.current);
  };

  const setNumberPreset = (newNumberPresetId: string) => {
    setNumberPresetId(newNumberPresetId);
    currentSettingsRef.current = { ...currentSettingsRef.current, numberPresetId: newNumberPresetId };
    updateStyleElement(currentSettingsRef.current.bulletPresetId, newNumberPresetId);
    plugin.saveData(currentSettingsRef.current);
  };

  return { bulletPresetId, numberPresetId, setBulletPreset, setNumberPreset };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
cmd /c "npm test -- src/shared/hooks/useListStyleInjection.test.ts"
```

Expected: all 13 tests pass

- [ ] **Step 5: Run full suite**

```
cmd /c "npm test"
```

Expected: all prior tests + 13 new = 536 passed, 0 failed

- [ ] **Step 6: Commit**

```
git add src/shared/hooks/useListStyleInjection.ts src/shared/hooks/useListStyleInjection.test.ts
git commit -m "feat: add useListStyleInjection hook with CSS injection and settings persistence"
```

---

## Task 4: BulletLibrary component

**Files:**
- Create: `src/tabs/home/basic-text/list-buttons/bullet-library/interfaces.ts`
- Create: `src/tabs/home/basic-text/list-buttons/bullet-library/constants.ts`
- Create: `src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.tsx`
- Create: `src/tabs/home/basic-text/list-buttons/bullet-library/bullet-library.css`
- Create: `src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.test.tsx`

### Why
Renders the grid-based bullet preset picker, opened from the list-button caret. Follows the established Dropdown pattern.

- [ ] **Step 1: Create bullet-library constants.ts and interfaces.ts**

Create `src/tabs/home/basic-text/list-buttons/bullet-library/interfaces.ts`:

```ts
/** Props accepted by the BulletLibrary component. */
export interface BulletLibraryProps {
  /** The DOM element that triggered the dropdown (used for positioning). */
  anchor: HTMLElement | null;
  /** The currently active preset id. */
  activePresetId: string;
  /** Called when the user selects a preset. */
  onSelectPreset: (presetId: string) => void;
  /** Called when the dropdown should close (click-outside or selection). */
  onClose: () => void;
}
```

Create `src/tabs/home/basic-text/list-buttons/bullet-library/constants.ts`:

```ts
/** Grid dimensions for the bullet library layout. */
export const BULLET_LIBRARY_COLUMNS = 4;

/** Header text rendered above the grid. */
export const BULLET_LIBRARY_HEADING = 'Bullet Library';
```

- [ ] **Step 2: Write the failing test**

Create `src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BulletLibrary } from './BulletLibrary';
import { BULLET_PRESETS } from '../constants';

function renderBulletLibrary(
  anchor: HTMLElement,
  activePresetId = 'none',
  onSelectPreset = jest.fn(),
  onClose = jest.fn(),
) {
  return render(
    <BulletLibrary
      anchor={anchor}
      activePresetId={activePresetId}
      onSelectPreset={onSelectPreset}
      onClose={onClose}
    />,
  );
}

describe('BulletLibrary (integration)', () => {
  let anchorElement: HTMLElement;

  beforeEach(() => {
    anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);
  });

  afterEach(() => {
    anchorElement.remove();
  });

  it('renders null when anchor is null', () => {
    const { container } = render(
      <BulletLibrary anchor={null} activePresetId="none" onSelectPreset={jest.fn()} onClose={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading', () => {
    renderBulletLibrary(anchorElement);
    expect(screen.getByText('Bullet Library')).toBeInTheDocument();
  });

  it('renders a cell for every bullet preset', () => {
    renderBulletLibrary(anchorElement);
    BULLET_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    });
  });

  it('renders "None" cell', () => {
    renderBulletLibrary(anchorElement);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('marks the active preset cell with onr-active class', () => {
    renderBulletLibrary(anchorElement, 'classic');
    const classicCell = screen.getByText('Classic').closest('[data-cmd]');
    expect(classicCell).toHaveClass('onr-active');
  });

  it('calls onSelectPreset with the preset id when a cell is clicked', () => {
    const onSelectPreset = jest.fn();
    renderBulletLibrary(anchorElement, 'none', onSelectPreset);

    act(() => {
      fireEvent.click(screen.getByText('Diamond'));
    });

    expect(onSelectPreset).toHaveBeenCalledWith('diamond');
  });

  it('calls onClose after selecting a preset', () => {
    const onSelectPreset = jest.fn();
    const onClose = jest.fn();
    renderBulletLibrary(anchorElement, 'none', onSelectPreset, onClose);

    act(() => {
      fireEvent.click(screen.getByText('Classic'));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('shows level symbols for presets with levels', () => {
    renderBulletLibrary(anchorElement);
    // Classic shows ● as L1 symbol
    const classicLevelSymbol = screen.getAllByText('●')[0];
    expect(classicLevelSymbol).toBeInTheDocument();
  });

  it('snapshot: open state', () => {
    const { container } = renderBulletLibrary(anchorElement);
    expect(container).toMatchSnapshot();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```
cmd /c "npm test -- src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.test.tsx"
```

Expected: FAIL — `Cannot find module './BulletLibrary'`

- [ ] **Step 4: Create bullet-library.css**

Create `src/tabs/home/basic-text/list-buttons/bullet-library/bullet-library.css`:

```css
/* Container for the bullet library dropdown */
.onr-bullet-library {
  padding: 8px;
  min-width: 280px;
}

/* Heading row */
.onr-bullet-library-heading {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--btn-hover-border);
}

/* Grid of preset cells */
.onr-bullet-library-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

/* Individual preset cell */
.onr-bullet-library-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
  min-height: 52px;
}

.onr-bullet-library-cell:hover {
  background: var(--btn-hover-bg);
  border-color: var(--btn-hover-border);
}

.onr-bullet-library-cell.onr-active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

/* Level symbols row inside each cell */
.onr-bullet-library-levels {
  display: flex;
  gap: 3px;
  font-size: 12px;
  line-height: 1;
}

/* Indented level symbol — shifts right proportionally to depth */
.onr-bullet-library-level {
  display: inline-block;
  font-size: 11px;
}

/* Cell label (preset name) */
.onr-bullet-library-label {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
}
```

- [ ] **Step 5: Create BulletLibrary.tsx**

Create `src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.tsx`:

```tsx
import React from 'react';
import './bullet-library.css';
import { Dropdown } from '../../../../../shared/components/dropdown/Dropdown';
import { BULLET_PRESETS } from '../constants';
import { BULLET_LIBRARY_HEADING } from './constants';
import type { BulletLibraryProps } from './interfaces';

export function BulletLibrary({
  anchor,
  activePresetId,
  onSelectPreset,
  onClose,
}: BulletLibraryProps) {
  const handleCellClick = (presetId: string) => {
    onSelectPreset(presetId);
    onClose();
  };

  return (
    <Dropdown anchor={anchor} onClose={onClose} className="onr-bullet-library">
      <div className="onr-bullet-library-heading">{BULLET_LIBRARY_HEADING}</div>
      <div className="onr-bullet-library-grid">
        {BULLET_PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId;
          const cellClass = `onr-bullet-library-cell${isActive ? ' onr-active' : ''}`;

          return (
            <div
              key={preset.id}
              className={cellClass}
              data-cmd={`bullet-preset-${preset.id}`}
              onClick={() => handleCellClick(preset.id)}
              onMouseDown={(event) => {
                // Prevent editor blur when clicking ribbon dropdown items.
                event.preventDefault();
              }}
            >
              {preset.levels.length > 0 ? (
                <div className="onr-bullet-library-levels">
                  {preset.levels.map((symbol, index) => (
                    <span
                      key={index}
                      className="onr-bullet-library-level"
                      style={{ marginLeft: index * 2 }}
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="onr-bullet-library-levels">—</span>
              )}
              <span className="onr-bullet-library-label">{preset.label}</span>
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```
cmd /c "npm test -- src/tabs/home/basic-text/list-buttons/bullet-library/BulletLibrary.test.tsx"
```

Expected: all 9 tests pass

- [ ] **Step 7: Run full suite**

```
cmd /c "npm test"
```

Expected: all passing, 0 failed

- [ ] **Step 8: Commit**

```
git add src/tabs/home/basic-text/list-buttons/bullet-library/
git commit -m "feat: add BulletLibrary grid dropdown component"
```

---

## Task 5: NumberLibrary component

**Files:**
- Create: `src/tabs/home/basic-text/list-buttons/number-library/interfaces.ts`
- Create: `src/tabs/home/basic-text/list-buttons/number-library/constants.ts`
- Create: `src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.tsx`
- Create: `src/tabs/home/basic-text/list-buttons/number-library/number-library.css`
- Create: `src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.test.tsx`

- [ ] **Step 1: Create number-library constants.ts and interfaces.ts**

Create `src/tabs/home/basic-text/list-buttons/number-library/interfaces.ts`:

```ts
/** Props accepted by the NumberLibrary component. */
export interface NumberLibraryProps {
  /** The DOM element that triggered the dropdown (used for positioning). */
  anchor: HTMLElement | null;
  /** The currently active preset id. */
  activePresetId: string;
  /** Called when the user selects a preset. */
  onSelectPreset: (presetId: string) => void;
  /** Called when the dropdown should close. */
  onClose: () => void;
}
```

Create `src/tabs/home/basic-text/list-buttons/number-library/constants.ts`:

```ts
/** Grid dimensions for the number library layout. */
export const NUMBER_LIBRARY_COLUMNS = 4;

/** Header text rendered above the grid. */
export const NUMBER_LIBRARY_HEADING = 'Numbering Library';
```

- [ ] **Step 2: Write the failing test**

Create `src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NumberLibrary } from './NumberLibrary';
import { NUMBER_PRESETS } from '../constants';

function renderNumberLibrary(
  anchor: HTMLElement,
  activePresetId = 'none',
  onSelectPreset = jest.fn(),
  onClose = jest.fn(),
) {
  return render(
    <NumberLibrary
      anchor={anchor}
      activePresetId={activePresetId}
      onSelectPreset={onSelectPreset}
      onClose={onClose}
    />,
  );
}

describe('NumberLibrary (integration)', () => {
  let anchorElement: HTMLElement;

  beforeEach(() => {
    anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);
  });

  afterEach(() => {
    anchorElement.remove();
  });

  it('renders null when anchor is null', () => {
    const { container } = render(
      <NumberLibrary anchor={null} activePresetId="none" onSelectPreset={jest.fn()} onClose={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading', () => {
    renderNumberLibrary(anchorElement);
    expect(screen.getByText('Numbering Library')).toBeInTheDocument();
  });

  it('renders a cell for every number preset', () => {
    renderNumberLibrary(anchorElement);
    NUMBER_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    });
  });

  it('marks the active preset cell with onr-active class', () => {
    renderNumberLibrary(anchorElement, 'decimal-period');
    const decimalCell = screen.getByText('1. 2. 3.').closest('[data-cmd]');
    expect(decimalCell).toHaveClass('onr-active');
  });

  it('calls onSelectPreset with preset id on cell click', () => {
    const onSelectPreset = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset);

    act(() => {
      fireEvent.click(screen.getByText('a. b. c.'));
    });

    expect(onSelectPreset).toHaveBeenCalledWith('lower-alpha-period');
  });

  it('calls onClose after selecting a preset', () => {
    const onSelectPreset = jest.fn();
    const onClose = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset, onClose);

    act(() => {
      fireEvent.click(screen.getByText('1) 2) 3)'));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('snapshot: open state', () => {
    const { container } = renderNumberLibrary(anchorElement);
    expect(container).toMatchSnapshot();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```
cmd /c "npm test -- src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.test.tsx"
```

Expected: FAIL — `Cannot find module './NumberLibrary'`

- [ ] **Step 4: Create number-library.css**

Create `src/tabs/home/basic-text/list-buttons/number-library/number-library.css`:

```css
/* Container for the numbering library dropdown */
.onr-number-library {
  padding: 8px;
  min-width: 280px;
}

.onr-number-library-heading {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--btn-hover-border);
}

.onr-number-library-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.onr-number-library-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
  min-height: 44px;
}

.onr-number-library-cell:hover {
  background: var(--btn-hover-bg);
  border-color: var(--btn-hover-border);
}

.onr-number-library-cell.onr-active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

.onr-number-library-label {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  white-space: nowrap;
}
```

- [ ] **Step 5: Create NumberLibrary.tsx**

Create `src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.tsx`:

```tsx
import React from 'react';
import './number-library.css';
import { Dropdown } from '../../../../../shared/components/dropdown/Dropdown';
import { NUMBER_PRESETS } from '../constants';
import { NUMBER_LIBRARY_HEADING } from './constants';
import type { NumberLibraryProps } from './interfaces';

export function NumberLibrary({
  anchor,
  activePresetId,
  onSelectPreset,
  onClose,
}: NumberLibraryProps) {
  const handleCellClick = (presetId: string) => {
    onSelectPreset(presetId);
    onClose();
  };

  return (
    <Dropdown anchor={anchor} onClose={onClose} className="onr-number-library">
      <div className="onr-number-library-heading">{NUMBER_LIBRARY_HEADING}</div>
      <div className="onr-number-library-grid">
        {NUMBER_PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId;
          const cellClass = `onr-number-library-cell${isActive ? ' onr-active' : ''}`;

          return (
            <div
              key={preset.id}
              className={cellClass}
              data-cmd={`number-preset-${preset.id}`}
              onClick={() => handleCellClick(preset.id)}
              onMouseDown={(event) => {
                // Prevent editor blur when clicking ribbon dropdown items.
                event.preventDefault();
              }}
            >
              <span className="onr-number-library-label">{preset.label}</span>
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```
cmd /c "npm test -- src/tabs/home/basic-text/list-buttons/number-library/NumberLibrary.test.tsx"
```

Expected: all 7 tests pass

- [ ] **Step 7: Run full suite**

```
cmd /c "npm test"
```

Expected: all passing, 0 failed

- [ ] **Step 8: Commit**

```
git add src/tabs/home/basic-text/list-buttons/number-library/
git commit -m "feat: add NumberLibrary grid dropdown component"
```

---

## Task 6: ListButtons component

**Files:**
- Create: `src/tabs/home/basic-text/list-buttons/ListButtons.tsx`
- Create: `src/tabs/home/basic-text/list-buttons/list-buttons.css`
- Create: `src/tabs/home/basic-text/list-buttons/ListButtons.test.tsx`

### Why
`ListButtons` is the split-button entry point. It owns the open/close state for both libraries, calls `useListStyleInjection`, and dispatches Obsidian commands for list toggle/indent/outdent.

- [ ] **Step 1: Write the failing test**

Create `src/tabs/home/basic-text/list-buttons/ListButtons.test.tsx`:

```tsx
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { ListButtons } from './ListButtons';
import { createMockApp, createMockPlugin } from '../../../../test-utils/mockApp';
import { renderWithApp } from '../../../../test-utils/renderWithApp';
import { MockEditor } from '../../../../test-utils/MockEditor';
import {
  LIST_BTN_CMD_BULLET_TOGGLE,
  LIST_BTN_CMD_BULLET_CARET,
  LIST_BTN_CMD_NUMBER_TOGGLE,
  LIST_BTN_CMD_NUMBER_CARET,
  LIST_BTN_CMD_OUTDENT,
  LIST_BTN_CMD_INDENT,
} from './constants';

function renderListButtons(editorState = {}) {
  const editor = new MockEditor('');
  const app = createMockApp(editor);
  const mockPlugin = createMockPlugin({});

  renderWithApp(
    <ListButtons editorState={{ bulletList: false, numberedList: false, ...editorState } as any} />,
    app,
    { plugin: mockPlugin },
  );

  return { app, editor, mockPlugin };
}

describe('ListButtons (integration)', () => {
  it('renders bullet-list toggle button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)).toBeInTheDocument();
  });

  it('renders bullet-list caret button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_CARET}"]`)).toBeInTheDocument();
  });

  it('renders number-list toggle button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_TOGGLE}"]`)).toBeInTheDocument();
  });

  it('renders number-list caret button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_CARET}"]`)).toBeInTheDocument();
  });

  it('renders outdent button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_OUTDENT}"]`)).toBeInTheDocument();
  });

  it('renders indent button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_INDENT}"]`)).toBeInTheDocument();
  });

  it('toggle bullet-list calls editor:toggle-bullet-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)!);
    expect((app.commands as any)._called).toContain('editor:toggle-bullet-list');
  });

  it('toggle number-list calls editor:toggle-numbered-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_TOGGLE}"]`)!);
    expect((app.commands as any)._called).toContain('editor:toggle-numbered-list');
  });

  it('outdent calls editor:unindent-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_OUTDENT}"]`)!);
    expect((app.commands as any)._called).toContain('editor:unindent-list');
  });

  it('indent calls editor:indent-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_INDENT}"]`)!);
    expect((app.commands as any)._called).toContain('editor:indent-list');
  });

  it('bullet-list toggle button has onr-active class when bulletList is true', () => {
    renderListButtons({ bulletList: true });
    const toggleBtn = document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)!;
    expect(toggleBtn).toHaveClass('onr-active');
  });

  it('number-list toggle button has onr-active class when numberedList is true', () => {
    renderListButtons({ numberedList: true });
    const toggleBtn = document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_TOGGLE}"]`)!;
    expect(toggleBtn).toHaveClass('onr-active');
  });

  it('bullet caret click opens BulletLibrary', () => {
    renderListButtons();
    act(() => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_CARET}"]`)!);
    });
    expect(screen.getByText('Bullet Library')).toBeInTheDocument();
  });

  it('number caret click opens NumberLibrary', () => {
    renderListButtons();
    act(() => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_CARET}"]`)!);
    });
    expect(screen.getByText('Numbering Library')).toBeInTheDocument();
  });

  it('BulletLibrary closes when a preset is selected', () => {
    renderListButtons();

    act(() => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_CARET}"]`)!);
    });

    act(() => {
      fireEvent.click(screen.getByText('Classic'));
    });

    expect(screen.queryByText('Bullet Library')).toBeNull();
  });

  it('NumberLibrary closes when a preset is selected', () => {
    renderListButtons();

    act(() => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_CARET}"]`)!);
    });

    act(() => {
      fireEvent.click(screen.getByText('1. 2. 3.'));
    });

    expect(screen.queryByText('Numbering Library')).toBeNull();
  });

  it('does not throw when bullet toggle is clicked with no active editor', () => {
    const app = createMockApp();
    const mockPlugin = createMockPlugin({});
    renderWithApp(
      <ListButtons editorState={{ bulletList: false, numberedList: false } as any} />,
      app,
      { plugin: mockPlugin },
    );

    expect(() =>
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)!),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
cmd /c "npm test -- src/tabs/home/basic-text/list-buttons/ListButtons.test.tsx"
```

Expected: FAIL — `Cannot find module './ListButtons'`

- [ ] **Step 3: Create list-buttons.css**

Create `src/tabs/home/basic-text/list-buttons/list-buttons.css`:

```css
/* Wrapper that groups the two sub-buttons as a single unit */
.onr-list-split-btn {
  display: flex;
  align-items: stretch;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  overflow: hidden;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.onr-list-split-btn:hover {
  background: var(--btn-hover-bg);
  border-color: var(--btn-hover-border);
}

/* Main (icon) region of the split button */
.onr-list-split-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  cursor: pointer;
  user-select: none;
  border-radius: 0;
  border: none;
  background: transparent;
  min-height: 24px;
}

.onr-list-split-main:hover {
  background: var(--btn-hover-bg);
}

.onr-list-split-main.onr-active {
  background: var(--btn-active-bg);
}

/* Thin divider between the icon and caret regions */
.onr-list-split-divider {
  width: 1px;
  background: var(--btn-hover-border);
  margin: 3px 0;
  flex-shrink: 0;
}

/* Caret region — narrow, shows ▾ */
.onr-list-split-caret {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 7px;
  padding: 2px 1px;
  background: transparent;
}

.onr-list-split-caret:hover {
  background: var(--btn-hover-bg);
}
```

- [ ] **Step 4: Create ListButtons.tsx**

Create `src/tabs/home/basic-text/list-buttons/ListButtons.tsx`:

```tsx
import { useRef, useState } from 'react';
import './list-buttons.css';
import { useApp } from '../../../../shared/context/AppContext';
import { BulletListIcon } from '../../../../assets/icons';
import { NumberedListIcon } from '../../../../assets/icons';
import { OutdentIcon } from '../../../../assets/icons';
import { IndentIcon } from '../../../../assets/icons';
import { BulletLibrary } from './bullet-library/BulletLibrary';
import { NumberLibrary } from './number-library/NumberLibrary';
import { useListStyleInjection } from '../../../../shared/hooks/useListStyleInjection';
import type { EditorState } from '../../../../shared/hooks/useEditorState';
import {
  LIST_BTN_CMD_BULLET_TOGGLE,
  LIST_BTN_CMD_BULLET_CARET,
  LIST_BTN_CMD_NUMBER_TOGGLE,
  LIST_BTN_CMD_NUMBER_CARET,
  LIST_BTN_CMD_OUTDENT,
  LIST_BTN_CMD_INDENT,
} from './constants';

interface ListButtonsProps {
  editorState: Pick<EditorState, 'bulletList' | 'numberedList'>;
}

export function ListButtons({ editorState }: ListButtonsProps) {
  const app = useApp();

  const bulletAnchorRef = useRef<HTMLDivElement>(null);
  const numberAnchorRef = useRef<HTMLDivElement>(null);

  const [bulletLibraryOpen, setBulletLibraryOpen] = useState(false);
  const [numberLibraryOpen, setNumberLibraryOpen] = useState(false);

  const { bulletPresetId, numberPresetId, setBulletPreset, setNumberPreset } =
    useListStyleInjection();

  // Prevents editor from losing focus when clicking ribbon buttons.
  const preventEditorBlur = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleBulletToggle = () => {
    (app as any).commands.executeCommandById('editor:toggle-bullet-list');
  };

  const handleBulletCaretClick = () => {
    setNumberLibraryOpen(false);
    setBulletLibraryOpen((isOpen) => !isOpen);
  };

  const handleNumberToggle = () => {
    (app as any).commands.executeCommandById('editor:toggle-numbered-list');
  };

  const handleNumberCaretClick = () => {
    setBulletLibraryOpen(false);
    setNumberLibraryOpen((isOpen) => !isOpen);
  };

  const handleOutdent = () => {
    (app as any).commands.executeCommandById('editor:unindent-list');
  };

  const handleIndent = () => {
    (app as any).commands.executeCommandById('editor:indent-list');
  };

  return (
    <>
      {/* Bullet list split button */}
      <div className="onr-list-split-btn" ref={bulletAnchorRef}>
        <div
          className={`onr-list-split-main${editorState.bulletList ? ' onr-active' : ''}`}
          data-cmd={LIST_BTN_CMD_BULLET_TOGGLE}
          title="Bullet list"
          onClick={handleBulletToggle}
          onMouseDown={preventEditorBlur}
        >
          <BulletListIcon className="onr-icon-sm" />
        </div>
        <div className="onr-list-split-divider" />
        <div
          className="onr-list-split-caret"
          data-cmd={LIST_BTN_CMD_BULLET_CARET}
          title="Bullet list styles"
          onClick={handleBulletCaretClick}
          onMouseDown={preventEditorBlur}
        >
          ▾
        </div>
      </div>

      {/* Number list split button */}
      <div className="onr-list-split-btn" ref={numberAnchorRef}>
        <div
          className={`onr-list-split-main${editorState.numberedList ? ' onr-active' : ''}`}
          data-cmd={LIST_BTN_CMD_NUMBER_TOGGLE}
          title="Numbered list"
          onClick={handleNumberToggle}
          onMouseDown={preventEditorBlur}
        >
          <NumberedListIcon className="onr-icon-sm" />
        </div>
        <div className="onr-list-split-divider" />
        <div
          className="onr-list-split-caret"
          data-cmd={LIST_BTN_CMD_NUMBER_CARET}
          title="Numbering styles"
          onClick={handleNumberCaretClick}
          onMouseDown={preventEditorBlur}
        >
          ▾
        </div>
      </div>

      {/* Outdent button */}
      <div
        className="onr-btn-sm"
        data-cmd={LIST_BTN_CMD_OUTDENT}
        title="Decrease indent"
        onClick={handleOutdent}
        onMouseDown={preventEditorBlur}
      >
        <OutdentIcon className="onr-icon-sm" />
      </div>

      {/* Indent button */}
      <div
        className="onr-btn-sm"
        data-cmd={LIST_BTN_CMD_INDENT}
        title="Increase indent"
        onClick={handleIndent}
        onMouseDown={preventEditorBlur}
      >
        <IndentIcon className="onr-icon-sm" />
      </div>

      {/* Bullet Library dropdown (portal) */}
      {bulletLibraryOpen && (
        <BulletLibrary
          anchor={bulletAnchorRef.current}
          activePresetId={bulletPresetId}
          onSelectPreset={setBulletPreset}
          onClose={() => setBulletLibraryOpen(false)}
        />
      )}

      {/* Number Library dropdown (portal) */}
      {numberLibraryOpen && (
        <NumberLibrary
          anchor={numberAnchorRef.current}
          activePresetId={numberPresetId}
          onSelectPreset={setNumberPreset}
          onClose={() => setNumberLibraryOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```
cmd /c "npm test -- src/tabs/home/basic-text/list-buttons/ListButtons.test.tsx"
```

Expected: all 18 tests pass

- [ ] **Step 6: Run full suite**

```
cmd /c "npm test"
```

Expected: all passing, 0 failed

- [ ] **Step 7: Commit**

```
git add src/tabs/home/basic-text/list-buttons/ListButtons.tsx src/tabs/home/basic-text/list-buttons/list-buttons.css src/tabs/home/basic-text/list-buttons/ListButtons.test.tsx
git commit -m "feat: add ListButtons component with split-button caret and library dropdowns"
```

---

## Task 7: Integrate ListButtons into BasicTextGroup

**Files:**
- Modify: `src/tabs/home/basic-text/BasicTextGroup.tsx`
- Modify: `src/tabs/home/basic-text/basic-text-group.css`

### Why
Remove the inline list button block from `BasicTextGroup` and delegate to the new `ListButtons` component. The CSS rule for `.onr-list-caret` is now unused and should be removed.

- [ ] **Step 1: Update BasicTextGroup.tsx**

In `src/tabs/home/basic-text/BasicTextGroup.tsx`:

Remove the following imports (no longer needed directly):
```ts
import {
  BulletListIcon,
  IndentIcon,
  NumberedListIcon,
  OutdentIcon,
} from '../../../assets/icons';
```

Add the `ListButtons` import:
```ts
import { ListButtons } from './list-buttons/ListButtons';
```

Remove the four handler functions `handleBulletList`, `handleNumberedList`, `handleOutdent`, `handleIndent`.

In the JSX row 1, replace:
```tsx
          {/* Bullet list */}
          <RibbonButton
            className="onr-format-btn"
            title="Bullet list"
            active={editorState.bulletList}
            onClick={handleBulletList}
            data-cmd="bullet-list"
          >
            <BulletListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </RibbonButton>

          {/* Numbered list */}
          <RibbonButton
            className="onr-format-btn"
            title="Numbered list"
            active={editorState.numberedList}
            onClick={handleNumberedList}
            data-cmd="numbered-list"
          >
            <NumberedListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </RibbonButton>

          {/* Outdent */}
          <RibbonButton
            className="onr-format-btn"
            icon={<OutdentIcon className="onr-icon-sm" />}
            title="Decrease indent"
            onClick={handleOutdent}
            data-cmd="outdent"
          />

          {/* Indent */}
          <RibbonButton
            className="onr-format-btn"
            icon={<IndentIcon className="onr-icon-sm" />}
            title="Increase indent"
            onClick={handleIndent}
            data-cmd="indent"
          />
```

with:
```tsx
          <ListButtons editorState={editorState} />
```

The full result for `src/tabs/home/basic-text/BasicTextGroup.tsx` after the edit:

```tsx
import './basic-text-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import {
  ClearFormattingIcon,
  ClearInlineIcon,
} from '../../../assets/icons';
import {
  toggleTagInEditor,
  removeAllTagsInEditor,
} from '../../../shared/editor/styling-engine/editorIntegration';
import {
  UNDERLINE_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  STRIKETHROUGH_MD_TAG,
} from '../../../shared/editor/styling-engine/constants';
import { useEditorState } from '../../../shared/hooks/useEditorState';
import { FontPicker } from './font-picker/FontPicker';
import { HighlightTextColor } from './highlight-text-color/HighlightTextColor';
import { ScriptButtons } from './script-buttons/ScriptButtons';
import { AlignButton } from './align-button/AlignButton';
import { ListButtons } from './list-buttons/ListButtons';

export function BasicTextGroup() {
  const app = useApp();
  const editorState = useEditorState(app);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBold = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, BOLD_MD_TAG);
  };

  const handleItalic = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, ITALIC_MD_TAG);
  };

  const handleUnderline = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, UNDERLINE_TAG);
  };

  const handleStrikethrough = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, STRIKETHROUGH_MD_TAG);
  };

  const handleDeleteElement = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceSelection('');
  };

  const handleClearAllFormatting = () => {
    const editor = getEditor();
    if (!editor) return;
    removeAllTagsInEditor(editor, { preserveLinePrefix: false });
  };

  return (
    <GroupShell name="Basic Text">
      <div className="onr-basic-text-inner">
        {/* Row 1: Font, size, list buttons (split with caret), indent, clear */}
        <div className="onr-basic-text-row1">
          <FontPicker editorState={editorState} />

          <ListButtons editorState={editorState} />

          {/* Clear formatting */}
          <RibbonButton
            className="onr-format-btn"
            icon={<ClearFormattingIcon className="onr-icon-sm" />}
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
          />
        </div>

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Delete element */}
        <div className="onr-basic-text-row2">
          {/* Bold */}
          <RibbonButton
            className="onr-format-btn onr-format-bold"
            title="Bold"
            active={editorState.bold}
            onClick={handleBold}
            data-cmd="bold"
          >
            B
          </RibbonButton>

          {/* Italic */}
          <RibbonButton
            className="onr-format-btn onr-format-italic"
            title="Italic"
            active={editorState.italic}
            onClick={handleItalic}
            data-cmd="italic"
          >
            I
          </RibbonButton>

          {/* Underline */}
          <RibbonButton
            className="onr-format-btn onr-format-underline"
            title="Underline"
            active={editorState.underline}
            onClick={handleUnderline}
            data-cmd="underline"
          >
            U
          </RibbonButton>

          {/* Strikethrough */}
          <RibbonButton
            className="onr-format-btn"
            title="Strikethrough"
            active={editorState.strikethrough}
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
          >
            <s className="onr-strikethrough-text">ab</s>
          </RibbonButton>

          <ScriptButtons
            subscript={editorState.subscript}
            superscript={editorState.superscript}
          />

          <div className="onr-divider" />

          <HighlightTextColor editorState={editorState} />

          <div className="onr-divider" />

          <AlignButton editorState={editorState} />

          {/* Delete element */}
          <RibbonButton
            className="onr-delete-element-btn"
            icon={<ClearInlineIcon className="onr-icon-sm" />}
            title="Delete element"
            onClick={handleDeleteElement}
            data-cmd="delete-element"
          />
        </div>
      </div>
    </GroupShell>
  );
}
```

- [ ] **Step 2: Remove unused .onr-list-caret CSS rule**

In `src/tabs/home/basic-text/basic-text-group.css`, remove these lines:

```css
/* Small caret indicator on list buttons */
.onr-list-caret {
  font-size: 7px;
}
```

- [ ] **Step 3: Run full suite**

```
cmd /c "npm test"
```

Expected: all passing, 0 failed. If the HomeTabPanel snapshot fails (only snapshot mismatch, not logic), proceed to Task 8.

- [ ] **Step 4: Commit**

```
git add src/tabs/home/basic-text/BasicTextGroup.tsx src/tabs/home/basic-text/basic-text-group.css
git commit -m "refactor: replace inline list buttons in BasicTextGroup with ListButtons component"
```

---

## Task 8: Update HomeTabPanel snapshots

**Files:**
- Modify: `src/tabs/home/__snapshots__/HomeTabPanel.test.tsx.snap`

### Why
The snapshot records the rendered HTML of the Home tab. Since the list buttons have changed structure (split buttons instead of single `RibbonButton`), the snapshot must be regenerated.

- [ ] **Step 1: Update snapshots**

```
cmd /c "npm test -- src/tabs/home/HomeTabPanel.test.tsx -u"
```

Expected: snapshots updated, 0 failed

- [ ] **Step 2: Run full suite one final time**

```
cmd /c "npm test"
```

Expected: all tests pass (count ≥ 550), 0 failed

- [ ] **Step 3: Commit**

```
git add src/tabs/home/__snapshots__/HomeTabPanel.test.tsx.snap
git commit -m "chore: update HomeTabPanel snapshots after ListButtons refactor"
```

---

## Self-Review Checklist

- [x] **PluginContext** covers persistence requirement (Tasks 1, 3)
- [x] **useListStyleInjection** covers CSS injection, all-notes scope, persistence (Task 3)
- [x] **BulletLibrary** covers 8 bullet presets, cascading per-depth symbols, caret-triggered dropdown (Task 4)
- [x] **NumberLibrary** covers 16 CSS-native number presets, caret-triggered dropdown (Task 5)
- [x] **ListButtons** covers split button, outdent/indent extraction, no-editor guard (Task 6)
- [x] **BasicTextGroup** refactor removes inline list block, no regressions (Task 7)
- [x] **Snapshots** updated (Task 8)
- [x] Every feature folder has `constants.ts` + `interfaces.ts`
- [x] All test files colocated with their source
- [x] No `console.log` in production code
- [x] No abbreviations in identifiers
- [x] CSS classes use `onr-` prefix throughout
- [x] No `>` symbol in bullet presets (blockquote is reserved by Obsidian)
- [x] Style element intentionally NOT cleaned up on unmount (survives tab switches)
