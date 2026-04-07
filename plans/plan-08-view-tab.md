# Plan 08 — View Tab

## Goal
Implement the View tab — mode toggles, graph view, sidebar toggles, zoom controls, and window management.

## Reference design
Open `design-mockup-v2.html` — Tab 6 VIEW. Groups left to right:
1. **Views** — Editing Mode (blue, active-looking) + Reading Mode + Focus Mode (purple) + Fullscreen
2. **Graph** — Graph View (teal, single button)
3. **Sidebars** — Toggle Left + Toggle Right
4. **Zoom & Layout** — Zoom Out + 100% + Zoom In + Readable Width + Hide Title
5. **Window** — Split Vertical + Split Horizontal + New Window + Quick Note (green) + Stacked Tabs

Note: Editing Mode button should appear active/highlighted when editor is in editing mode (not reading mode). Use `.onr-btn-active` class toggled on workspace layout change event.

## Button → Command mapping

| Button | Command ID | Notes |
|---|---|---|
| Editing Mode | `markdown:toggle-preview` | Toggle to source/live preview |
| Reading Mode | `markdown:toggle-preview` | Same command — toggles to reading |
| Focus Mode | custom | Hide both sidebars via `app:toggle-left-sidebar` + `app:toggle-right-sidebar` |
| Fullscreen | `app:toggle-fullscreen` | — |
| Graph View | `graph:open` | — |
| Toggle Left | `app:toggle-left-sidebar` | — |
| Toggle Right | `app:toggle-right-sidebar` | — |
| Zoom Out | `app:zoom-out` | — |
| 100% | `app:reset-zoom` | — |
| Zoom In | `app:zoom-in` | — |
| Readable Width | `app:toggle-readable-line-length` | — |
| Hide Title | `app:toggle-inline-title` | — |
| Split Vertical | `workspace:split-vertical` | — |
| Split Horizontal | `workspace:split-horizontal` | — |
| New Window | `workspace:open-in-new-window` | — |
| Quick Note | `daily-notes` | Open today's daily note |
| Stacked Tabs | `workspace:toggle-stacked-tabs` | — |

## Active state tracking
```ts
// In ViewTab constructor, register event for active leaf change
plugin.registerEvent(
  app.workspace.on('active-leaf-change', () => this.updateActiveStates())
);

updateActiveStates() {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  const isReading = view?.getMode() === 'preview';
  editingBtn.classList.toggle('onr-btn-active', !isReading);
  readingBtn.classList.toggle('onr-btn-active', isReading);
}
```

## Files to create

### `src/tabs/ViewTab.ts`
```ts
export class ViewTab {
  render(container: HTMLElement, app: App, plugin: Plugin): void {
    container.empty();
    container.addClass('onr-tab-panel');
    container.setAttribute('data-panel', 'View');

    this.buildViewsGroup(container, app, plugin);
    this.buildGraphGroup(container, app);
    this.buildSidebarsGroup(container, app);
    this.buildZoomGroup(container, app);
    this.buildWindowGroup(container, app);
  }
}
```

### `src/styles/view.css`
```css
/* Active state for mode buttons */
.onr-btn-active {
  background: var(--btn-active-bg) !important;
  border-color: var(--btn-active-border) !important;
}
.onr-btn-active svg { color: var(--icon-blue); }
```

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 09 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. Click the VIEW tab. Take a screenshot of the browser showing the View tab ribbon.
```
mcp__obsidian-devtools__click({ uid: '[data-tab="View"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-08-view.png' })
```
This is the visual target. The live result must match this.

### Check 1 — View tab panel exists
```
mcp__obsidian-devtools__click({ uid: '[data-tab="View"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="View"]')`
})
```
✅ Must return `true`.

### Check 2 — All 5 groups present with correct names
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="View"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```
✅ Must return `["Views","Graph","Sidebars","Zoom & Layout","Window"]`.

### Check 3 — Editing Mode button active by default
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const editBtn = document.querySelector('[data-panel="View"] [data-command="editing-mode"]');
    return editBtn?.classList.contains('onr-btn-active');
  }`
})
```
✅ Must return `true` (when a markdown file is open in editing mode).

### Check 4 — Reading mode toggle updates active state
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('markdown:toggle-preview')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-08-reading.png' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const readBtn = document.querySelector('[data-panel="View"] [data-command="reading-mode"]');
    return readBtn?.classList.contains('onr-btn-active');
  }`
})
```
✅ Must return `true` — Reading Mode button is now active.

### Check 5 — Left sidebar toggle
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('app:toggle-left-sidebar')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-08-sidebar.png' })
```
✅ Left sidebar should collapse.

### Check 6 — Zoom In works
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const before = app.vault.getConfig('baseFontSize');
    app.commands.executeCommandById('app:zoom-in');
    const after = app.vault.getConfig('baseFontSize');
    return { before, after, increased: after > before };
  }`
})
```
✅ `increased` must be `true`.

### Check 7 — Split vertical creates two panes
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('workspace:split-vertical')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-08-split.png' })
```
✅ Workspace should show two editor panes side by side.

### Check 8 — No console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` related to `onenote-ribbon`.

### Check 9 — Live screenshot matches reference
```
mcp__obsidian-devtools__click({ uid: '[data-tab="View"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-08-view.png' })
```
Open `plans/screenshots/ref-08-view.png` and `plans/screenshots/live-08-view.png` side by side.
✅ Must match on:
- Views: 4 buttons — Editing Mode shows active (blue bg), Focus Mode purple icon
- Graph: single Graph View button (teal icon)
- Sidebars: 2 buttons
- Zoom & Layout: 5 buttons including 100% reset
- Window: 5 buttons including Quick Note (green)
- All groups separated by vertical dividers
❌ If different: identify the mismatching group and fix it.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (View panel exists)
- [ ] Check 2 passes (all 5 groups with correct names)
- [ ] Check 3 passes (Editing Mode active by default)
- [ ] Check 4 passes (Reading mode toggle updates active state)
- [ ] Check 5 passes (left sidebar toggle works)
- [ ] Check 6 passes (Zoom In increases font size)
- [ ] Check 7 passes (Split Vertical creates two panes)
- [ ] Check 8 passes (zero console errors)
- [ ] Check 9 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.

---

## What changed & how to test

**Files added/changed:**
- `src/tabs/ViewTab.ts` — new file, 5 groups with active-state tracking
- `src/ribbon/RibbonShell.ts` — import and render ViewTab panel
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Click the **View** tab in the ribbon
2. With a markdown note open: **Editing Mode** button should appear highlighted (blue background)
3. Click **Reading Mode** — editor switches to reading/preview; Reading Mode button should now be highlighted instead
4. Click **Toggle Left** — left sidebar should collapse/expand
5. Click **Zoom In** then **100%** — font size should increase then reset
6. Click **Graph View** — full vault graph should open
7. Click **Split Vertical** — editor should split into two panes side by side
8. Click **Quick Note** — today's daily note should open (requires Daily Notes core plugin)
