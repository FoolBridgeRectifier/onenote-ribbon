# Plan 06 — History Tab

## Goal
Implement the History tab — recent files navigation, trash, Obsidian Git integration (with graceful fallback), and file recovery.

## React implementation note

All files in this tab are `.tsx`. Follow the same patterns established in Plans 03–04:
- Entry point: `src/tabs/history/HistoryTabPanel.tsx`
- Groups use `<GroupShell>`, buttons use `<RibbonButton>`, app via `useApp()`
- Git availability check: `useState<boolean>` + `useEffect` reading `app.plugins.plugins['obsidian-git']`
- Recent files list: `useState<TFile[]>` populated in `useEffect` from `app.workspace.getLastOpenFiles()`
- No `createDiv`, `createEl`, or `addEventListener` anywhere in this tab

## Reference design
Open `design-mockup-v2.html` — Tab 4 HISTORY. Groups left to right:
1. **Navigation** — Recent Files (gray) + Nav Back (gray) + Nav Forward (gray) + Open Trash (red)
2. **Git & Versions** — File History (purple, Git badge) + Vault History (purple, Git badge) + Commit (green, Git badge) + Push (blue, Git badge) + Pull (teal, Git badge) + Diff View (gray, Git badge)
3. **Recovery** — File Recovery (orange) + Snap Backup (green)

Git badge looks identical to plugin badge from Draw tab — small blue chip `plugin` → for history tab use `Git` text instead.

## Plugin detection
```ts
const GIT_PLUGIN_ID = 'obsidian-git';
```
If Obsidian Git not installed: Git group buttons show with reduced opacity (0.5) and tooltip "Requires Obsidian Git plugin". Clicking shows Notice + opens community plugins.

## Button → Command mapping

| Button | Plugin | Command / Action |
|---|---|---|
| Recent Files | None | `app.commands.executeCommandById('switcher:open')` — opens Quick Switcher (shows recent) |
| Nav Back | None | `app.commands.executeCommandById('app:go-back')` |
| Nav Forward | None | `app.commands.executeCommandById('app:go-forward')` |
| Open Trash | None | `app.vault.adapter.open(app.vault.configDir + '/.trash')` or reveal in system |
| File History | `obsidian-git` | `app.commands.executeCommandById('obsidian-git:open-history-for-file')` |
| Vault History | `obsidian-git` | `app.commands.executeCommandById('obsidian-git:open-history')` |
| Commit | `obsidian-git` | `app.commands.executeCommandById('obsidian-git:commit')` |
| Push | `obsidian-git` | `app.commands.executeCommandById('obsidian-git:push')` |
| Pull | `obsidian-git` | `app.commands.executeCommandById('obsidian-git:pull')` |
| Diff View | `obsidian-git` | `app.commands.executeCommandById('obsidian-git:open-diff')` |
| File Recovery | None (core) | `app.commands.executeCommandById('file-recovery:open')` |
| Snap Backup | None | `app.commands.executeCommandById('file-recovery:save')` — manual snapshot |

## Files to create

### `src/tabs/HistoryTab.ts`
```ts
export class HistoryTab {
  render(container: HTMLElement, app: App): void {
    container.empty();
    container.addClass('onr-tab-panel');
    container.setAttribute('data-panel', 'History');

    this.buildNavigationGroup(container, app);
    this.buildGitGroup(container, app);
    this.buildRecoveryGroup(container, app);
  }

  private buildGitGroup(container: HTMLElement, app: App) {
    const gitEnabled = isPluginEnabled(app, 'obsidian-git');
    // Render all 6 buttons; if !gitEnabled add .onr-btn-disabled class
    // and show "Git" badge on each button
  }
}
```

### `src/styles/history.css`
- `.onr-git-badge` — same style as plugin badge but text says "Git"
- `.onr-btn-disabled` — `opacity: 0.5; cursor: not-allowed;`

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 07 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. Click the HISTORY tab. Take a screenshot of the browser showing the History tab ribbon.
```
mcp__obsidian-devtools__click({ uid: '[data-tab="History"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-06-history.png' })
```
This is the visual target. The live result must match this.

### Check 1 — History tab panel exists
```
mcp__obsidian-devtools__click({ uid: '[data-tab="History"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="History"]')`
})
```
✅ Must return `true`.

### Check 2 — All 3 groups present with correct names
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="History"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```
✅ Must return `["Navigation","Git & Versions","Recovery"]`.

### Check 3 — Navigation group has 4 buttons
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const nav = document.querySelector('[data-panel="History"] [data-group="Navigation"]');
    return nav?.querySelectorAll('.onr-btn').length;
  }`
})
```
✅ Must return `4` (Recent Files, Nav Back, Nav Forward, Open Trash).

### Check 4 — Git group shows disabled state when plugin absent
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const gitInstalled = !!(app as any).plugins.enabledPlugins.has('obsidian-git');
    const gitBtns = [...document.querySelectorAll('[data-panel="History"] [data-requires-plugin="obsidian-git"]')];
    return {
      gitInstalled,
      btnCount: gitBtns.length,
      allDisabled: gitBtns.every(b => b.classList.contains('onr-btn-disabled'))
    };
  }`
})
```
✅ If `gitInstalled` is `false`: `allDisabled` must be `true` and `btnCount` must be `6`.
✅ If `gitInstalled` is `true`: `allDisabled` must be `false`.

### Check 5 — Git badges visible on Git group buttons
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const badges = [...document.querySelectorAll('[data-panel="History"] .onr-git-badge')];
    return badges.length;
  }`
})
```
✅ Must return `6` (one Git badge per Git group button).

### Check 6 — Nav Back fires
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    app.commands.executeCommandById('app:go-back');
    return 'FIRED';
  }`
})
```
✅ Must return `'FIRED'` without errors.

### Check 7 — File Recovery opens
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('file-recovery:open')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-06-recovery.png' })
```
✅ File Recovery modal should open.

### Check 8 — No console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` related to `onenote-ribbon`.

### Check 9 — Live screenshot matches reference
```
mcp__obsidian-devtools__click({ uid: '[data-tab="History"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-06-history.png' })
```
Open `plans/screenshots/ref-06-history.png` and `plans/screenshots/live-06-history.png` side by side.
✅ Must match on:
- Navigation: 4 buttons, Open Trash has red icon
- Git & Versions: 6 buttons each with a "Git" badge chip
- Git buttons appear with reduced opacity if obsidian-git not installed
- Recovery: 2 buttons (File Recovery orange, Snap Backup green)
- All groups separated by vertical dividers
❌ If different: identify the mismatching group and fix it.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (History panel exists)
- [ ] Check 2 passes (all 3 groups with correct names)
- [ ] Check 3 passes (Navigation group has 4 buttons)
- [ ] Check 4 passes (Git buttons disabled when plugin absent)
- [ ] Check 5 passes (6 Git badges visible)
- [ ] Check 6 passes (Nav Back fires without errors)
- [ ] Check 7 passes (File Recovery opens modal)
- [ ] Check 8 passes (zero console errors)
- [ ] Check 9 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.

---

## What changed & how to test

**Files added/changed:**
- `src/tabs/HistoryTab.ts` — new file, 3 groups with Obsidian Git detection
- `src/ribbon/RibbonShell.ts` — import and render HistoryTab panel
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Click the **History** tab in the ribbon
2. Click **Recent Files** — Quick Switcher should open showing recent files
3. Click **Nav Back** — should navigate to the previously open file
4. Click **File Recovery** — File Recovery modal should open
5. If Obsidian Git is NOT installed: all Git group buttons (File History, Vault History, Commit, Push, Pull, Diff View) should appear faded (opacity 0.5) with a "Git" badge
6. If Obsidian Git IS installed: Git buttons should be fully opaque and functional
