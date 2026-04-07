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

### `src/ribbon/RibbonShell.ts`
Responsible for:
- Creating the ribbon DOM element
- Mounting it above `.mod-root` (the main workspace column)
- Tab switching (clicking a tab sets `data-active-tab` on the container)
- Collapse/expand toggle (sets `data-collapsed` attribute, ribbon body height animates to 0)
- Pin toggle (pinned = ribbon stays open; unpinned = auto-collapses on editor focus)
- Cleanup on `onunload`

```ts
export const TABS = ['Home', 'Insert', 'Draw', 'History', 'Review', 'View', 'Help'] as const;
export type TabName = typeof TABS[number];

export class RibbonShell {
  private el: HTMLElement;
  private activeTab: TabName = 'Home';
  private collapsed = false;
  private pinned = true;

  constructor(private app: App) {}

  mount(): HTMLElement {
    // Remove any existing ribbon
    document.getElementById('onenote-ribbon-root')?.remove();

    this.el = document.createElement('div');
    this.el.id = 'onenote-ribbon-root';
    this.el.setAttribute('data-active-tab', this.activeTab);

    this.el.innerHTML = this.buildHTML();
    this.attachEvents();

    // Insert above .mod-root
    const modRoot = document.querySelector('.mod-root');
    modRoot?.parentElement?.insertBefore(this.el, modRoot);

    return this.el;
  }

  unmount() {
    this.el?.remove();
  }

  private buildHTML(): string {
    const tabs = TABS.map(t =>
      `<div class="onr-tab ${t === this.activeTab ? 'active' : ''}" data-tab="${t}">${t}</div>`
    ).join('');

    return `
      <div class="onr-tab-bar">
        ${tabs}
        <div class="onr-spacer"></div>
        <div class="onr-pin-btn">${this.pinned ? '📌' : ''} ${this.collapsed ? '▼ Expand' : '▲ Collapse'}</div>
      </div>
      <div class="onr-body" data-tab-content="Home">
        <!-- tab content injected by each tab module -->
      </div>
    `;
  }

  private attachEvents() {
    this.el.querySelectorAll('.onr-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = tab.getAttribute('data-tab') as TabName;
        this.el.setAttribute('data-active-tab', this.activeTab);
        this.el.querySelectorAll('.onr-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.el.querySelectorAll('.onr-tab-panel').forEach(p => {
          (p as HTMLElement).style.display =
            p.getAttribute('data-panel') === this.activeTab ? '' : 'none';
        });
      });
    });

    this.el.querySelector('.onr-pin-btn')?.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      const body = this.el.querySelector('.onr-body') as HTMLElement;
      body.style.display = this.collapsed ? 'none' : '';
      (this.el.querySelector('.onr-pin-btn') as HTMLElement).textContent =
        this.collapsed ? '▼ Expand' : '▲ Collapse';
    });
  }
}
```

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
