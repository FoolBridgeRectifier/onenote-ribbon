# Plan 05 — Draw Tab

## Goal
Implement the Draw tab with Canvas and Excalidraw launchers, canvas tool buttons, drawing tool buttons, and graceful plugin-not-installed handling.

## Reference design
Open `design-mockup-v2.html` — Tab 3 DRAW. Groups left to right:
1. **Launch** — New Canvas (blue) + Excalidraw (purple, plugin badge) + Ink Draw (teal, plugin badge)
2. **Canvas** — Add Card + Add Note + Group
3. **Drawing Tools** — Select + Pen + Shape + Eraser
4. **Mode** — Pan + Ruler + Full Page

Plugin badge visual: small `plugin` label in blue `#dce6f8` background, seen in mockup below Excalidraw and Ink Draw buttons.

## Plugin detection
Before calling any plugin command, check if it is installed and enabled:
```ts
function isPluginEnabled(app: App, pluginId: string): boolean {
  return !!(app as any).plugins.enabledPlugins.has(pluginId);
}
```

If not enabled: show an Obsidian `Notice` with "Install [Plugin Name] to use this feature" and open the community plugins search.

## Button → Command mapping

| Button | Plugin Required | Command / Action |
|---|---|---|
| New Canvas | None (core) | `app.commands.executeCommandById('canvas:new-file')` |
| Excalidraw | `obsidian-excalidraw-plugin` | `app.commands.executeCommandById('obsidian-excalidraw-plugin:excalidraw-create-new')` |
| Ink Draw | `obsidian-ink` | `app.commands.executeCommandById('obsidian-ink:new-drawing')` |
| Add Card | None (core) | Open canvas file if active, then dispatch canvas add-node action |
| Add Note | None (core) | Open canvas, add note node |
| Group | None (core) | Canvas group selected nodes |
| Select | `obsidian-excalidraw-plugin` | Switch excalidraw to select mode |
| Pen | `obsidian-excalidraw-plugin` | Switch to freedraw mode |
| Shape | `obsidian-excalidraw-plugin` | Switch to shape mode |
| Eraser | `obsidian-excalidraw-plugin` | Switch to eraser mode |
| Pan | `obsidian-excalidraw-plugin` | Switch to pan mode |
| Ruler | None | Toggle canvas grid via `app.vault.setConfig('canvasShowGrid', true)` |
| Full Page | None | `app.commands.executeCommandById('app:toggle-fullscreen')` |

## Files to create

### `src/tabs/DrawTab.ts`
```ts
export class DrawTab {
  render(container: HTMLElement, app: App): void {
    container.empty();
    container.addClass('onr-tab-panel');
    container.setAttribute('data-panel', 'Draw');

    this.buildLaunchGroup(container, app);
    this.buildCanvasGroup(container, app);
    this.buildDrawingGroup(container, app);
    this.buildModeGroup(container, app);
  }

  private withPlugin(app: App, pluginId: string, pluginName: string, fn: () => void) {
    if (isPluginEnabled(app, pluginId)) {
      fn();
    } else {
      new Notice(`Install "${pluginName}" to use this feature`);
      app.setting.open();
      app.setting.openTabById('community-plugins');
    }
  }
}
```

### `src/styles/draw.css`
- Plugin badge style (already in tokens, just needs `.onr-plugin-badge` class)
- Disabled-look for plugin-required buttons when plugin not installed (opacity 0.6 + dashed border)

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 06 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. Click the DRAW tab. Take a screenshot of the browser showing the Draw tab ribbon.
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Draw"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-05-draw.png' })
```
This is the visual target. The live result must match this.

### Check 1 — Draw tab panel exists
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Draw"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="Draw"]')`
})
```
✅ Must return `true`.

### Check 2 — All 4 groups present with correct names
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="Draw"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```
✅ Must return `["Launch","Canvas","Drawing Tools","Mode"]`.

### Check 3 — Plugin badges visible on Excalidraw and Ink Draw
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const badges = [...document.querySelectorAll('[data-panel="Draw"] .onr-plugin-badge')];
    return badges.length;
  }`
})
```
✅ Must return `2` (one for Excalidraw, one for Ink Draw).

### Check 4 — New Canvas button works (core command)
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('canvas:new-file')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-05-canvas.png' })
```
✅ A new untitled canvas should open in the workspace.

### Check 5 — Plugin-not-installed shows Notice
If Excalidraw is NOT installed:
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const excalidrawInstalled = !!(app as any).plugins.enabledPlugins.has('obsidian-excalidraw-plugin');
    if (!excalidrawInstalled) {
      document.querySelector('[data-command="excalidraw-create"]')?.click();
    }
    return excalidrawInstalled ? 'INSTALLED_SKIP' : 'CLICKED';
  }`
})
```
```
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-05-notice.png' })
```
✅ If not installed: Notice toast should appear. Community plugins modal may open.
✅ If installed: skip this check (returns `'INSTALLED_SKIP'`).

### Check 6 — Launch group has 3 buttons
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const launch = document.querySelector('[data-panel="Draw"] [data-group="Launch"]');
    return launch?.querySelectorAll('.onr-btn').length;
  }`
})
```
✅ Must return `3`.

### Check 7 — No console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` related to `onenote-ribbon`.

### Check 8 — Live screenshot matches reference
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Draw"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-05-draw.png' })
```
Open `plans/screenshots/ref-05-draw.png` and `plans/screenshots/live-05-draw.png` side by side.
✅ Must match on:
- Launch group: 3 buttons, Excalidraw and Ink Draw have plugin badges below them
- Excalidraw badge shows purple icon, Ink Draw shows teal icon
- Canvas group: 3 buttons
- Drawing Tools: 4 buttons
- Mode: 3 buttons
- All buttons same height (60px)
❌ If different: identify the mismatching element and fix it.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (Draw panel exists)
- [ ] Check 2 passes (all 4 groups with correct names)
- [ ] Check 3 passes (2 plugin badges visible)
- [ ] Check 4 passes (New Canvas opens a canvas file)
- [ ] Check 5 passes (plugin-not-installed Notice appears when Excalidraw missing)
- [ ] Check 6 passes (Launch group has 3 buttons)
- [ ] Check 7 passes (zero console errors)
- [ ] Check 8 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.

---

## What changed & how to test

**Files added/changed:**
- `src/tabs/DrawTab.ts` — new file, 4 groups with plugin-detection logic
- `src/ribbon/RibbonShell.ts` — import and render DrawTab panel
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Click the **Draw** tab in the ribbon
2. Click **New Canvas** — a new untitled `.canvas` file should open
3. Click **Excalidraw** (if not installed) — a Notice toast should appear: *"Install Excalidraw to use this feature"* and Community Plugins should open
4. Click **Excalidraw** (if installed) — a new Excalidraw drawing should open
5. Confirm Excalidraw and Ink Draw buttons show a small plugin badge below their label
