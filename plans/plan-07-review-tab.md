# Plan 07 — Review Tab

## Goal
Implement the Review tab — spellcheck, linting, translation, and all right-sidebar panel shortcuts (Backlinks, Outgoing Links, Local Graph, Properties, Tags Pane, Encrypt).

## React implementation note

All files in this tab are `.tsx`. Follow the same patterns established in Plans 03–04:
- Entry point: `src/tabs/review/ReviewTabPanel.tsx`
- Groups use `<GroupShell>`, buttons use `<RibbonButton>`, app via `useApp()`
- Optional plugin badges (Linter, Translate): `useState<boolean>` checking plugin availability in `useEffect`
- No `createDiv`, `createEl`, or `addEventListener` anywhere in this tab

## Reference design
Open `design-mockup-v2.html` — Tab 5 REVIEW. Groups left to right:
1. **Spelling** — Spellcheck (blue) + Lint Note (gray, plugin badge) + Translate (gray)
2. **Links & Notes** — Backlinks (blue) + Outgoing Links (blue) + Local Graph (teal)
3. **Properties** — Properties (purple) + Tags Pane (orange)
4. **Security** — Encrypt (red, plugin badge)

These are **panel reveal buttons** — each calls `app.commands.executeCommandById` to open/focus the right sidebar panel. Obsidian handles focus/reveal automatically.

## Button → Command mapping

| Button | Plugin | Command ID |
|---|---|---|
| Spellcheck | None | `editor:toggle-spellcheck` |
| Lint Note | `obsidian-linter` | `obsidian-linter:lint-file` |
| Translate | None | Open `https://translate.google.com/?text=[selection]` in default browser |
| Backlinks | None (core) | `backlink:open` |
| Outgoing Links | None (core) | `outgoing-links:open` |
| Local Graph | None (core) | `graph:open-local` |
| Properties | None (core) | `properties:open` |
| Tags Pane | None (core) | `tag-pane:open` |
| Encrypt | `meld-encrypt` | `meld-encrypt:meld-encrypt-note-in-place` |

## Translate implementation
```ts
const selection = app.workspace.activeEditor?.editor?.getSelection();
const query = encodeURIComponent(selection ?? '');
window.open(`https://translate.google.com/?sl=auto&tl=en&text=${query}&op=translate`);
```

## Panel reveal — how it works
Each of Backlinks, Outgoing Links, Local Graph, Properties, Tags Pane just calls the command ID. Obsidian automatically:
- If panel already open → focuses it
- If panel is in collapsed sidebar → expands sidebar and switches to that tab
- If panel is not open → opens it in the right sidebar

No custom logic needed — pure `app.commands.executeCommandById(id)`.

## Files to create

### `src/tabs/ReviewTab.ts`
```ts
export class ReviewTab {
  render(container: HTMLElement, app: App): void {
    container.empty();
    container.addClass('onr-tab-panel');
    container.setAttribute('data-panel', 'Review');

    this.buildSpellingGroup(container, app);
    this.buildLinksGroup(container, app);
    this.buildPropertiesGroup(container, app);
    this.buildSecurityGroup(container, app);
  }
}
```

### `src/styles/review.css`
No tab-specific overrides needed. Inherits all from shell.css.

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 08 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. Click the REVIEW tab. Take a screenshot of the browser showing the Review tab ribbon.
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Review"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-07-review.png' })
```
This is the visual target. The live result must match this.

### Check 1 — Review tab panel exists
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Review"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="Review"]')`
})
```
✅ Must return `true`.

### Check 2 — All 4 groups present with correct names
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="Review"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```
✅ Must return `["Spelling","Links & Notes","Properties","Security"]`.

### Check 3 — Backlinks panel opens
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('backlink:open')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-07-backlinks.png' })
```
✅ Right sidebar should open with Backlinks panel active.

### Check 4 — Properties panel opens
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('properties:open')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-07-properties.png' })
```
✅ Properties panel should appear in right sidebar.

### Check 5 — Spellcheck toggles
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const before = app.vault.getConfig('spellcheck');
    app.commands.executeCommandById('editor:toggle-spellcheck');
    const after = app.vault.getConfig('spellcheck');
    return { before, after, toggled: before !== after };
  }`
})
```
✅ `toggled` must be `true`.

### Check 6 — Plugin badges on Lint Note and Encrypt
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const badges = [...document.querySelectorAll('[data-panel="Review"] .onr-plugin-badge')];
    return badges.length;
  }`
})
```
✅ Must return `2` (one for Lint Note, one for Encrypt).

### Check 7 — Lint Note fires when linter installed, shows Notice when not
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const linterInstalled = !!(app as any).plugins.enabledPlugins.has('obsidian-linter');
    if (linterInstalled) {
      app.commands.executeCommandById('obsidian-linter:lint-file');
    }
    return linterInstalled ? 'LINTED' : 'NO_LINTER_PLUGIN';
  }`
})
```
✅ Returns either `'LINTED'` (if installed) or `'NO_LINTER_PLUGIN'` (if not — Notice should have appeared).

### Check 8 — No console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` related to `onenote-ribbon`.

### Check 9 — Live screenshot matches reference
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Review"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-07-review.png' })
```
Open `plans/screenshots/ref-07-review.png` and `plans/screenshots/live-07-review.png` side by side.
✅ Must match on:
- Spelling: 3 buttons — Spellcheck (blue), Lint Note (gray + plugin badge), Translate (gray)
- Links & Notes: 3 buttons — Backlinks (blue), Outgoing Links (blue), Local Graph (teal)
- Properties: 2 buttons — Properties (purple), Tags Pane (orange)
- Security: 1 button — Encrypt (red + plugin badge)
- Group separators visible between all 4 groups
❌ If different: identify the mismatching group and fix it.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (Review panel exists)
- [ ] Check 2 passes (all 4 groups with correct names)
- [ ] Check 3 passes (Backlinks panel opens)
- [ ] Check 4 passes (Properties panel opens)
- [ ] Check 5 passes (Spellcheck toggles)
- [ ] Check 6 passes (2 plugin badges visible)
- [ ] Check 7 passes (Lint Note behavior correct)
- [ ] Check 8 passes (zero console errors)
- [ ] Check 9 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.

---

## What changed & how to test

**Files added/changed:**
- `src/tabs/ReviewTab.ts` — new file, 4 groups
- `src/ribbon/RibbonShell.ts` — import and render ReviewTab panel
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Click the **Review** tab in the ribbon
2. Click **Backlinks** — right sidebar should open showing Backlinks panel
3. Click **Local Graph** — local graph view should open
4. Click **Properties** — Properties panel should appear in right sidebar
5. Click **Tags Pane** — Tags pane should open
6. Click **Spellcheck** — spellcheck should toggle on/off (visible red underlines in editor)
7. Select some text in a note, click **Translate** — Google Translate should open in browser with the selected text pre-filled
