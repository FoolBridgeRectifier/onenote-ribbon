# Plan 02 — Ribbon Shell

## Goal
Mount the full-width ribbon bar above the Obsidian workspace — purple tab bar with 7 tabs, white ribbon body, collapse/pin button. No button content yet, just the structural shell.

## Reference design
Open `design-mockup-v2.html` in browser. The tab bar is the purple strip at the top of each ribbon section. Match exactly:
- Tab bar height: 30px
- Purple: `#6B2CA6`
- Active tab: white bg, purple text, no bottom indicator
- Inactive tabs: white 88% opacity text
- Collapse button right-aligned: "▲ Collapse"
- Ribbon body: white, `min-height: 92px`, border-top `#e1dfdd`
- Box shadow: `0 1px 3px rgba(107,44,166,0.08), 0 2px 8px rgba(0,0,0,0.10)`

## Files to create/modify

### `src/ribbon/tabs.ts`
Central tab name list (shared by `RibbonShell`, `RibbonApp`, `TabBar`):
```ts
export const TABS = ['Home', 'Insert', 'Draw', 'History', 'Review', 'View', 'Help'] as const;
export type TabName = (typeof TABS)[number];
```

### `src/ribbon/RibbonShell.ts`
Responsible for:
- Creating the container DOM element and inserting it above the workspace
- Creating the React root and rendering `RibbonApp` inside it
- Providing the Obsidian `App` instance via `AppContext`
- Cleanup on `onunload` via `root.unmount()`

No `buildHTML()`, no `attachEvents()`, no manual DOM manipulation — all UI is React.

```ts
import { App } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { AppContext } from '../shared/context/AppContext';
import { RibbonApp } from './RibbonApp';

export class RibbonShell {
  private el: HTMLElement;
  private root: Root;

  constructor(private app: App) {}

  mount(): void {
    document.getElementById('onenote-ribbon-root')?.remove();

    this.el = document.createElement('div');
    this.el.id = 'onenote-ribbon-root';

    const hmc = document.querySelector('.horizontal-main-container');
    hmc?.parentElement?.insertBefore(this.el, hmc);

    const titlebar = document.querySelector('.titlebar') as HTMLElement | null;
    if (titlebar) {
      this.el.style.marginTop = `${titlebar.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.el);
    this.root.render(
      createElement(AppContext.Provider, { value: this.app },
        createElement(RibbonApp)
      )
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.el?.remove();
  }
}
```

### `src/shared/context/AppContext.ts`
React context that provides the Obsidian `App` instance to all components:
```ts
import { createContext, useContext } from 'react';
import { App } from 'obsidian';

export const AppContext = createContext<App>(null!);
export const useApp = () => useContext(AppContext);
```

### `src/ribbon/useRibbonState.ts`
Hook that owns the ribbon's UI state — replaces the old instance variables on `RibbonShell`:
```ts
import { useState } from 'react';
import { TabName } from './tabs';

export function useRibbonState() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  return { activeTab, setActiveTab, collapsed, setCollapsed, pinned, setPinned };
}
```

### `src/ribbon/TabBar.tsx`
React component for the purple tab bar:
```tsx
import { TABS, TabName } from './tabs';

interface Props {
  activeTab: TabName;
  collapsed: boolean;
  pinned: boolean;
  onTabClick: (t: TabName) => void;
  onToggleCollapse: () => void;
}

export function TabBar({ activeTab, collapsed, pinned, onTabClick, onToggleCollapse }: Props) {
  return (
    <div className="onr-tab-bar">
      {TABS.map(t => (
        <div key={t}
          className={`onr-tab${t === activeTab ? ' active' : ''}`}
          onClick={() => onTabClick(t)}>
          {t}
        </div>
      ))}
      <div className="onr-spacer" />
      <div className="onr-pin-btn" onClick={onToggleCollapse}>
        {pinned ? '📌' : ''} {collapsed ? '▼ Expand' : '▲ Collapse'}
      </div>
    </div>
  );
}
```

### `src/ribbon/RibbonApp.tsx`
Top-level React component. Owns ribbon state and renders `TabBar` + the active tab panel:
```tsx
import { useRibbonState } from './useRibbonState';
import { TabBar } from './TabBar';
import { HomeTabPanel } from '../tabs/home/HomeTabPanel';
import { InsertTabPanel } from '../tabs/insert/InsertTabPanel';

export function RibbonApp() {
  const { activeTab, setActiveTab, collapsed, setCollapsed, pinned, setPinned } = useRibbonState();

  return (
    <div className="onr-ribbon">
      <TabBar
        activeTab={activeTab}
        collapsed={collapsed}
        pinned={pinned}
        onTabClick={setActiveTab}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="onr-body">
          {activeTab === 'Home'   && <HomeTabPanel />}
          {activeTab === 'Insert' && <InsertTabPanel />}
          {/* other tabs: stub panels until implemented */}
        </div>
      )}
    </div>
  );
}
```

Tab switching and collapse are driven by `useState` — no manual `classList.add('active')` or `style.display = 'none'` needed.

### `src/styles/shell.css`
Exact CSS from `design-mockup-v2.html` for:
- `.ribbon-wrap` → `#onenote-ribbon-root`
- `.tab-bar` → `.onr-tab-bar`
- `.tab-bar .tab` → `.onr-tab`
- `.tab-bar .tab.active` → `.onr-tab.active`
- `.tab-bar .spacer` → `.onr-spacer`
- `.tab-bar .pin-btn` → `.onr-pin-btn`
- `.ribbon-body` → `.onr-body`
- All responsive rules
- Reduced motion rule

Key values (copy exactly from mockup):
```css
#onenote-ribbon-root {
  width: 100%;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.onr-tab-bar {
  background: var(--ribbon-purple); /* #6B2CA6 */
  height: 30px;
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  scrollbar-width: none;
}
.onr-tab {
  padding: 0 16px;
  font-size: 11px;
  color: rgba(255,255,255,0.88);
  cursor: pointer;
  white-space: nowrap;
  border-right: 1px solid rgba(255,255,255,0.12);
  transition: background 150ms ease-out;
}
.onr-tab.active {
  background: #ffffff;
  color: #6B2CA6;
  font-weight: 600;
}
.onr-body {
  background: #ffffff;
  border-top: 1px solid #e1dfdd;
  min-height: 92px;
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  padding: 4px 4px 0;
  box-shadow: 0 1px 3px rgba(107,44,166,0.08), 0 2px 8px rgba(0,0,0,0.10);
}
```

### `src/main.ts` — update
```ts
import { Plugin } from 'obsidian';
import { RibbonShell } from './ribbon/RibbonShell';

export default class OneNoteRibbonPlugin extends Plugin {
  private shell: RibbonShell;

  async onload() {
    this.shell = new RibbonShell(this.app);
    this.shell.mount();
  }

  onunload() {
    this.shell.unmount();
  }
}
```

### `styles.css`
Import all CSS modules:
```css
@import 'src/styles/tokens.css';
@import 'src/styles/shell.css';
```

## Steps
1. Create `src/ribbon/RibbonShell.ts` and `src/styles/shell.css`
2. Update `src/main.ts`
3. Update `esbuild.config.mjs` to also copy `styles.css` output
4. `npm run build`
5. Reload Obsidian plugin

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 03 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. The reference is the **purple tab bar + white ribbon body** visible at the top of any tab section.
```
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-02-shell.png' })
```
Save this as the baseline. The live result must match this visual.

### Check 1 — Ribbon DOM exists
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.getElementById('onenote-ribbon-root')`
})
```
✅ Must return `true`.
❌ If `false`: plugin did not mount the ribbon — check console for errors, rebuild.

### Check 2 — All 7 tabs present
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const tabs = [...document.querySelectorAll('.onr-tab')].map(t => t.textContent?.trim());
    return JSON.stringify(tabs);
  }`
})
```
✅ Must return `["Home","Insert","Draw","History","Review","View","Help"]`.

### Check 3 — Tab bar color is purple #6B2CA6
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => getComputedStyle(document.querySelector('.onr-tab-bar')).backgroundColor`
})
```
✅ Must return `rgb(107, 44, 166)`.
❌ If wrong color: CSS tokens not loaded — verify `styles.css` is bundled.

### Check 4 — Active tab styling (Home active by default)
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const homeTab = document.querySelector('.onr-tab[data-tab="Home"]');
    return {
      hasActive: homeTab?.classList.contains('active'),
      bg: getComputedStyle(homeTab).backgroundColor,
      color: getComputedStyle(homeTab).color
    };
  }`
})
```
✅ Must return `{ hasActive: true, bg: "rgb(255, 255, 255)", color: "rgb(107, 44, 166)" }`.

### Check 5 — Tab switching works
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Insert"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const insert = document.querySelector('.onr-tab[data-tab="Insert"]');
    const home = document.querySelector('.onr-tab[data-tab="Home"]');
    return {
      insertActive: insert?.classList.contains('active'),
      homeActive: home?.classList.contains('active')
    };
  }`
})
```
✅ Must return `{ insertActive: true, homeActive: false }`.
```
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-02-tab-switch.png' })
```

### Check 6 — Collapse works
```
mcp__obsidian-devtools__click({ uid: '.onr-pin-btn' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const body = document.querySelector('.onr-body');
    return getComputedStyle(body).display;
  }`
})
```
✅ Must return `"none"` (body hidden).
```
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-02-collapsed.png' })
```
❌ If body still visible: collapse button handler not attached.

### Check 7 — Ribbon positioned above workspace
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const ribbon = document.getElementById('onenote-ribbon-root');
    const modRoot = document.querySelector('.mod-root');
    if (!ribbon || !modRoot) return 'MISSING';
    const ribbonBottom = ribbon.getBoundingClientRect().bottom;
    const modRootTop = modRoot.getBoundingClientRect().top;
    return { ribbonBottom, modRootTop, correct: ribbonBottom <= modRootTop + 5 };
  }`
})
```
✅ `correct` must be `true` — ribbon is above, not overlapping the workspace.

### Check 8 — No console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` related to `onenote-ribbon`.

### Check 9 — Live screenshot matches reference
Click Home tab to restore default state, expand ribbon:
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Home"]' })
mcp__obsidian-devtools__click({ uid: '.onr-pin-btn' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-02-shell.png' })
```
Open `plans/screenshots/ref-02-shell.png` and `plans/screenshots/live-02-shell.png` side by side.
✅ Must match on:
- Tab bar height ~30px, purple background
- Active tab (Home) is white with purple text, no bottom bar/indicator
- Inactive tabs are semi-transparent white text
- Ribbon body is white below the tab bar
- Box shadow visible below ribbon body
❌ If different: identify which property mismatches and fix the CSS.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (ribbon DOM exists)
- [ ] Check 2 passes (all 7 tabs present with correct names)
- [ ] Check 3 passes (tab bar is purple #6B2CA6)
- [ ] Check 4 passes (Home tab active by default, white bg, purple text)
- [ ] Check 5 passes (tab switching works)
- [ ] Check 6 passes (collapse hides body)
- [ ] Check 7 passes (ribbon above workspace, not overlapping)
- [ ] Check 8 passes (zero console errors)
- [ ] Check 9 passes (live screenshot matches reference)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.
