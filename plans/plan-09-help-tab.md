# Plan 09 — Help Tab

## Goal
Implement the Help tab — external links, settings shortcut, sandbox, and feedback.

## Reference design
Open `design-mockup-v2.html` — Tab 7 HELP. Groups left to right:
1. **Help** — Help Docs (blue) + Community Forum (gray) + GitHub (gray) + About (gray)
2. **System** — Settings (purple) + Sandbox (gray) + Feedback (orange)

Smallest tab — 7 buttons total across 2 groups.

## Button → Command/Action mapping

| Button | Icon | Action |
|---|---|---|
| Help Docs | `life-buoy` | `window.open('https://help.obsidian.md')` |
| Community Forum | `message-circle` | `window.open('https://forum.obsidian.md')` |
| GitHub | `github` | `window.open('https://github.com/obsidianmd/obsidian-releases')` |
| About | `info` | Custom modal showing plugin name, version, author, Obsidian version |
| Settings | `settings` | `app.commands.executeCommandById('app:open-settings')` |
| Sandbox | `monitor` | `app.commands.executeCommandById('app:show-sandbox-window')` |
| Feedback | `mail` | `window.open('https://github.com/[your-plugin-repo]/issues/new')` |

## About modal content
```
OneNote Ribbon for Obsidian
Version: [from manifest.json]
Obsidian: [app.version]

A faithful OneNote-style ribbon UI for Obsidian.

[Close]
```

## Files to create

### `src/tabs/HelpTab.ts`
```ts
export class HelpTab {
  render(container: HTMLElement, app: App, plugin: Plugin): void {
    container.empty();
    container.addClass('onr-tab-panel');
    container.setAttribute('data-panel', 'Help');

    this.buildHelpGroup(container, app, plugin);
    this.buildSystemGroup(container, app, plugin);
  }

  private showAboutModal(app: App, plugin: Plugin) {
    const modal = new Modal(app);
    modal.titleEl.setText('OneNote Ribbon');
    modal.contentEl.createEl('p', { text: `Version: ${plugin.manifest.version}` });
    modal.contentEl.createEl('p', { text: `Obsidian: ${(app as any).version}` });
    modal.contentEl.createEl('p', { text: 'A faithful OneNote-style ribbon UI for Obsidian.' });
    modal.open();
  }
}
```

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 10 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. Click the HELP tab. Take a screenshot of the browser showing the Help tab ribbon.
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Help"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-09-help.png' })
```
This is the visual target. The live result must match this.

### Check 1 — Help tab panel exists
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Help"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="Help"]')`
})
```
✅ Must return `true`.

### Check 2 — Both groups present with correct names
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="Help"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```
✅ Must return `["Help","System"]`.

### Check 3 — Help group has 4 buttons
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const help = document.querySelector('[data-panel="Help"] [data-group="Help"]');
    return help?.querySelectorAll('.onr-btn').length;
  }`
})
```
✅ Must return `4` (Help Docs, Community Forum, GitHub, About).

### Check 4 — System group has 3 buttons
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const system = document.querySelector('[data-panel="Help"] [data-group="System"]');
    return system?.querySelectorAll('.onr-btn').length;
  }`
})
```
✅ Must return `3` (Settings, Sandbox, Feedback).

### Check 5 — Settings button opens settings modal
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('app:open-settings')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-09-settings.png' })
```
✅ Obsidian Settings modal should open.

### Check 6 — About modal shows version info
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    document.querySelector('[data-command="about"]')?.click();
    return !!document.querySelector('.modal-container');
  }`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-09-about.png' })
```
✅ Must return `true` — modal is visible.
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => document.querySelector('.modal-container')?.textContent`
})
```
✅ Modal text must include `"Version:"` and `"Obsidian:"`.

### Check 7 — No console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` related to `onenote-ribbon`.

### Check 8 — Live screenshot matches reference
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Help"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-09-help.png' })
```
Open `plans/screenshots/ref-09-help.png` and `plans/screenshots/live-09-help.png` side by side.
✅ Must match on:
- Help group: 4 buttons — Help Docs (blue icon), Community Forum, GitHub, About
- System group: 3 buttons — Settings (purple icon), Sandbox, Feedback (orange icon)
- Single separator between Help and System groups
- All 7 buttons same height (60px)
❌ If different: identify the mismatching element and fix it.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (Help panel exists)
- [ ] Check 2 passes (both groups "Help" and "System")
- [ ] Check 3 passes (Help group has 4 buttons)
- [ ] Check 4 passes (System group has 3 buttons)
- [ ] Check 5 passes (Settings opens modal)
- [ ] Check 6 passes (About modal shows version + Obsidian info)
- [ ] Check 7 passes (zero console errors)
- [ ] Check 8 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.

---

## What changed & how to test

**Files added/changed:**
- `src/tabs/HelpTab.ts` — new file, 2 groups
- `src/ribbon/RibbonShell.ts` — import and render HelpTab panel
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Click the **Help** tab in the ribbon
2. Click **Help Docs** — `https://help.obsidian.md` should open in browser
3. Click **GitHub** — Obsidian releases GitHub page should open in browser
4. Click **About** — a modal should appear showing plugin version and Obsidian version
5. Click **Settings** — Obsidian Settings modal should open
6. Click **Feedback** — the plugin's GitHub issues page should open in browser
