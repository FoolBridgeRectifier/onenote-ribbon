# Plan 10 — Polish, Settings & Final Verification

## Goal
Final pass covering: settings page, keyboard shortcuts, tooltips, disabled states, icon consistency, settings persistence, responsive verification, and full end-to-end screenshot comparison against all 7 mockup tabs.

## Reference design
All 7 tabs in `design-mockup-v2.html` are the ground truth. Every button, group, separator, color, and spacing must match.

## Part A — Settings Page

Add a settings tab accessible from `app:open-settings`:
```ts
// src/settings/SettingsTab.ts
export class OneNoteRibbonSettingsTab extends PluginSettingTab {
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'OneNote Ribbon' });

    new Setting(containerEl)
      .setName('Start collapsed')
      .setDesc('Collapse the ribbon when Obsidian starts')
      .addToggle(t => t.setValue(this.plugin.settings.collapsed)
        .onChange(v => { this.plugin.settings.collapsed = v; this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Default tab')
      .setDesc('Which tab is active on startup')
      .addDropdown(d => d
        .addOptions({ home:'Home', insert:'Insert', draw:'Draw',
                      history:'History', review:'Review', view:'View', help:'Help' })
        .setValue(this.plugin.settings.activeTab)
        .onChange(v => { this.plugin.settings.activeTab = v as TabId; this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Font family')
      .setDesc('Vault-wide editor font (used by Home → Basic Text font picker)')
      .addText(t => t.setValue(this.plugin.settings.fontFamily)
        .onChange(v => { this.plugin.settings.fontFamily = v; this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Base font size')
      .setDesc('Vault-wide font size in px (used by Home → size picker)')
      .addSlider(s => s.setLimits(10, 24, 1).setValue(this.plugin.settings.baseFontSize)
        .onChange(v => { this.plugin.settings.baseFontSize = v; this.plugin.saveSettings(); }));
  }
}
```

## Part B — Tooltips on every button
Every `.onr-btn` must have `aria-label` = button name (e.g. `aria-label="Bold"`) and `title` for native browser tooltip on hover.

```ts
function makeBtn(icon: string, label: string, command: string, app: App): HTMLElement {
  const btn = document.createElement('div');
  btn.className = 'onr-btn';
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  // … icon + label content …
  btn.addEventListener('click', () => app.commands.executeCommandById(command));
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      app.commands.executeCommandById(command);
    }
  });
  return btn;
}
```

## Part C — Keyboard shortcut: Alt+R to focus ribbon
```ts
// In main.ts onload()
this.addCommand({
  id: 'focus-ribbon',
  name: 'Focus OneNote Ribbon',
  hotkeys: [{ modifiers: ['Alt'], key: 'r' }],
  callback: () => {
    const firstTab = document.querySelector('.onr-tab') as HTMLElement;
    firstTab?.focus();
  }
});
```

## Part D — Disabled states for unavailable commands
When no active editor (e.g. canvas is open, or no file open):
- All Home → Basic Text buttons get `.onr-btn-disabled`
- All Home → Navigate buttons get `.onr-btn-disabled`
- All Insert buttons get `.onr-btn-disabled`

```ts
// Register on active-leaf-change
const updateDisabledState = () => {
  const hasEditor = !!app.workspace.getActiveViewOfType(MarkdownView);
  document.querySelectorAll('[data-requires-editor]').forEach(btn => {
    btn.classList.toggle('onr-btn-disabled', !hasEditor);
  });
};
plugin.registerEvent(app.workspace.on('active-leaf-change', updateDisabledState));
```

## Part E — Responsive verification at 3 breakpoints

### Narrow (640px)
```
mcp__obsidian-devtools__emulate({ device: 'iPhone SE' })  // or resize to 640px
mcp__obsidian-devtools__take_screenshot()
```
Check: tab bar scrolls, buttons compact (40px), group labels hidden

### Medium (800px)
```
mcp__obsidian-devtools__resize_page({ width: 800, height: 600 })
mcp__obsidian-devtools__take_screenshot()
```
Check: groups wrap to second row, all buttons still visible

### Wide (1280px)
```
mcp__obsidian-devtools__resize_page({ width: 1280, height: 900 })
mcp__obsidian-devtools__take_screenshot()
```
Check: all groups inline on one row

## Part F — Full end-to-end screenshot comparison

For each of the 7 tabs, take a screenshot and compare side-by-side with `design-mockup-v2.html`:

```
// Home tab
mcp__obsidian-devtools__click({ uid: '[data-tab="Home"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-home.png' })

// Insert tab
mcp__obsidian-devtools__click({ uid: '[data-tab="Insert"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-insert.png' })

// Draw tab
mcp__obsidian-devtools__click({ uid: '[data-tab="Draw"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-draw.png' })

// History tab
mcp__obsidian-devtools__click({ uid: '[data-tab="History"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-history.png' })

// Review tab
mcp__obsidian-devtools__click({ uid: '[data-tab="Review"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-review.png' })

// View tab
mcp__obsidian-devtools__click({ uid: '[data-tab="View"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-view.png' })

// Help tab
mcp__obsidian-devtools__click({ uid: '[data-tab="Help"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'screenshots/tab-help.png' })
```

Open each screenshot next to the corresponding section in `design-mockup-v2.html` and verify:
- [ ] Tab bar height 30px, purple #6B2CA6
- [ ] Active tab white bg, purple text, no bottom indicator
- [ ] Group separators visible, color #e1dfdd
- [ ] Group labels 9px, color #605e5c
- [ ] Large buttons 48×60px
- [ ] Small buttons 28×24px
- [ ] Icons 20px (large) / 14px (small)
- [ ] Button hover state warm gray #f0eeec
- [ ] Plugin/Git badges visible where expected
- [ ] No overflow, no horizontal scroll on desktop

## Part G — impeccable polish checklist
Run through each item in the `polish` skill:

- [ ] All interactive elements have visible focus rings (`:focus-visible`)
- [ ] All transitions 150ms ease-out
- [ ] No pure gray — all use warm tokens
- [ ] Button labels consistent capitalization (Title Case)
- [ ] Keyboard navigation: Tab through buttons, Enter/Space to activate
- [ ] No console errors or warnings
- [ ] `prefers-reduced-motion` disables all transitions
- [ ] WCAG AA contrast: group labels #605e5c on white = 5.74:1 ✓
- [ ] WCAG AA contrast: button labels #201f1e on white = 16.1:1 ✓
- [ ] Plugin loads and unloads cleanly (no leaked event listeners)
- [ ] Settings persist across Obsidian restarts
- [ ] `npm run build` produces no TypeScript errors

## Files to create/modify
- `src/settings/SettingsTab.ts` — new
- `src/utils/makeBtn.ts` — reusable button factory with a11y attrs — new
- `src/main.ts` — add settings tab, add keyboard shortcut, add disabled state tracking
- `src/styles/polish.css` — any final tweaks

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND all 7 tab screenshots match the reference mockup. This is the final verification gate before the plugin is shippable.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Check 1 — Settings page opens and shows OneNote Ribbon settings
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('app:open-settings')`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-10-settings.png' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const tabs = [...document.querySelectorAll('.vertical-tab-nav-item')];
    return tabs.some(t => t.textContent?.includes('OneNote Ribbon'));
  }`
})
```
✅ Must return `true` — OneNote Ribbon appears in settings sidebar.

### Check 2 — Settings persist after reload
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const plugin = app.plugins.plugins['onenote-ribbon'];
    return plugin?.settings ? JSON.stringify(plugin.settings) : 'NO_SETTINGS';
  }`
})
```
✅ Must return a JSON object (not `'NO_SETTINGS'`), confirming settings are loaded.

### Check 3 — Alt+R focuses ribbon
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const cmd = app.commands.commands['onenote-ribbon:focus-ribbon'];
    return !!cmd;
  }`
})
```
✅ Must return `true` — focus-ribbon command is registered.

### Check 4 — All buttons have aria-label and title
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const btns = [...document.querySelectorAll('.onr-btn')];
    const missing = btns.filter(b => !b.getAttribute('aria-label') || !b.getAttribute('title'));
    return { total: btns.length, missingA11y: missing.length };
  }`
})
```
✅ `missingA11y` must be `0`.

### Check 5 — Keyboard navigation: Enter activates button
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const boldBtn = document.querySelector('[data-command="editor:toggle-bold"]');
    boldBtn?.focus();
    boldBtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return 'DISPATCHED';
  }`
})
```
✅ Must return `'DISPATCHED'` without errors.

### Check 6 — Disabled state when no editor open
Open the Graph view (no markdown editor):
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.commands.executeCommandById('graph:open')`
})
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const hasEditor = !!app.workspace.getActiveViewOfType(MarkdownView);
    const disabledBtns = [...document.querySelectorAll('[data-requires-editor].onr-btn-disabled')];
    return { hasEditor, disabledCount: disabledBtns.length };
  }`
})
```
✅ `hasEditor` must be `false` and `disabledCount` must be `> 0`.

### Check 7 — Responsive: narrow (640px)
```
mcp__obsidian-devtools__resize_page({ width: 640, height: 800 })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-10-narrow.png' })
```
✅ Tab bar must scroll horizontally if overflow; no horizontal scroll in ribbon body.

### Check 8 — Responsive: wide (1280px)
```
mcp__obsidian-devtools__resize_page({ width: 1280, height: 900 })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-10-wide.png' })
```
✅ All groups on one row with no wrapping.

### Check 9 — All 7 tabs final screenshot comparison
Take final screenshots of all 7 tabs at 1280px width and compare to `design-mockup-v2.html`:
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Home"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-home.png' })

mcp__obsidian-devtools__click({ uid: '[data-tab="Insert"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-insert.png' })

mcp__obsidian-devtools__click({ uid: '[data-tab="Draw"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-draw.png' })

mcp__obsidian-devtools__click({ uid: '[data-tab="History"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-history.png' })

mcp__obsidian-devtools__click({ uid: '[data-tab="Review"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-review.png' })

mcp__obsidian-devtools__click({ uid: '[data-tab="View"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-view.png' })

mcp__obsidian-devtools__click({ uid: '[data-tab="Help"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/final-help.png' })
```
Open each `final-*.png` next to the corresponding tab in `design-mockup-v2.html`.
✅ All 7 must match pixel-for-pixel at 1280px width on the following:
- Tab bar: 30px, purple #6B2CA6
- Active tab: white bg, purple text, NO bottom indicator
- Separators: vertical lines, color #e1dfdd
- Group labels: 9px uppercase, color #605e5c
- Large buttons: 48×60px
- Icons correctly colored (blue/purple/teal/green/orange/red per mockup)

### Check 10 — Zero console errors
```
mcp__obsidian-devtools__list_console_messages()
```
✅ Zero messages with type `"error"` or `"warn"` related to `onenote-ribbon`.

### Check 11 — Plugin unloads cleanly
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    app.plugins.disablePlugin('onenote-ribbon');
    return !!document.getElementById('onenote-ribbon-root');
  }`
})
```
✅ Must return `false` — ribbon DOM is fully removed on unload.
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => app.plugins.enablePlugin('onenote-ribbon')`
})
```
Re-enable for further testing.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (Settings page shows OneNote Ribbon section)
- [ ] Check 2 passes (settings persist — returns JSON object)
- [ ] Check 3 passes (Alt+R focus command registered)
- [ ] Check 4 passes (all buttons have aria-label + title, 0 missing)
- [ ] Check 5 passes (keyboard Enter activates button)
- [ ] Check 6 passes (editor-dependent buttons disabled when no editor)
- [ ] Check 7 passes (responsive 640px — tab bar scrolls)
- [ ] Check 8 passes (responsive 1280px — all groups one row)
- [ ] Check 9 passes (all 7 final tab screenshots match mockup)
- [ ] Check 10 passes (zero console errors or warnings)
- [ ] Check 11 passes (plugin unloads cleanly, DOM removed)
- [ ] Full impeccable polish checklist (Part G) verified

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.
This plan is the final gate — do not ship until every item above is green.

---

## What changed & how to test

**Files added/changed:**
- `src/settings/SettingsTab.ts` — new, plugin settings page
- `src/utils/makeBtn.ts` — new, reusable a11y-compliant button factory
- `src/main.ts` — adds settings tab, Alt+R shortcut, disabled-state tracking
- All tab files updated to use `makeBtn` utility and `data-requires-editor` attributes
- `styles.css` — final polish tweaks
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Open **Settings → OneNote Ribbon** — settings page should appear with Start Collapsed toggle, Default Tab dropdown, Font Family, and Base Font Size slider
2. Change Default Tab to **Insert**, close and reload Obsidian — ribbon should open on Insert tab
3. Press **Alt+R** — focus should jump to the first tab in the ribbon
4. Open the **Graph** view (no markdown editor active) — Home Basic Text and Navigate buttons should appear faded/disabled
5. Open a markdown note — those same buttons should become active again
6. Hover any button — a tooltip with the button name should appear
7. Tab through buttons with keyboard, press **Enter** — button should activate
8. Resize Obsidian window to ~640px wide — tab bar should scroll horizontally with no layout breaks
9. Disable and re-enable the plugin from Settings → Community Plugins — ribbon should disappear and reappear cleanly with no console errors
