# Plan 03 — Home Tab

## Goal

Implement the full Home tab content matching the design exactly. All buttons wired to Obsidian commands.

## Reference design

Open `design-mockup-v2.html` and look at Tab 1 — HOME. The groups from left to right:

1. **Clipboard** — Big Paste (split with dropdown arrow) + stacked Cut / Copy / Format Painter
2. **Basic Text** — Row 1: font family dropdown + size dropdown + bullet▾ + numbered▾ + outdent + indent + clear formatting. Row 2: B I U S x₂ x² | Highlight swatch▾ | A color swatch▾ | Align▾ | ×
3. **Styles** — visual preview panel showing H1/H2 previews with ▲▼ scroll and ▾ expand
4. **Tags** — stacked To Do / Important / Question rows with color swatches + ▾ more + "To Do Tag" big button + "Find Tags" big button
5. **Email & Meetings** — Email Page + Meeting Details (large buttons)
6. **Navigate** — Outline + Fold All + Unfold All

## Button → Command mapping

| Button           | Command ID                                                                          | Fallback |
| ---------------- | ----------------------------------------------------------------------------------- | -------- |
| Cut              | `document.execCommand('cut')`                                                       | —        |
| Copy             | `document.execCommand('copy')`                                                      | —        |
| Paste            | `document.execCommand('paste')`                                                     | —        |
| Format Painter   | custom: copy active line's heading/bold prefix, re-apply to selection               | —        |
| Bold             | `editor:toggle-bold`                                                                | —        |
| Italic           | `editor:toggle-italic`                                                              | —        |
| Underline        | wrap selection in `<u>…</u>`                                                        | —        |
| Strikethrough    | `editor:toggle-strikethrough`                                                       | —        |
| Highlight        | `editor:toggle-highlight`                                                           | —        |
| Subscript        | wrap in `<sub>…</sub>`                                                              | —        |
| Superscript      | wrap in `<sup>…</sup>`                                                              | —        |
| Font Family      | `app.vault.setConfig('fontText', fontName)` + `app.workspace.trigger('css-change')` | —        |
| Font Size        | `app.vault.setConfig('baseFontSize', size)` + trigger                               | —        |
| Bullet list      | `editor:toggle-bullet-list`                                                         | —        |
| Numbered list    | `editor:toggle-numbered-list`                                                       | —        |
| Indent           | `editor:indent-list`                                                                | —        |
| Outdent          | `editor:unindent-list`                                                              | —        |
| Clear formatting | strip `#` headings + `**` + `_` from selection                                      | —        |
| Align (no-op)    | show tooltip "Alignment not supported in Markdown"                                  | —        |
| H1               | `editor:toggle-heading-1`                                                           | —        |
| H2               | `editor:toggle-heading-2`                                                           | —        |
| Styles dropdown  | custom modal listing H1–H6, Quote, Code, Normal, Clear                              | —        |
| To Do            | `editor:toggle-todo`                                                                | —        |
| Important        | insert `> [!important]\n> ` at cursor                                               | —        |
| Question         | insert `> [!question]\n> ` at cursor                                                | —        |
| Find Tags        | `app.commands.executeCommandById('global-search:open')` then prefill `#`            | —        |
| Email Page       | copy note content to clipboard as formatted text                                    | —        |
| Meeting Details  | insert frontmatter template with date/time/attendees fields                         | —        |
| Outline          | `app.commands.executeCommandById('outline:open')`                                   | —        |
| Fold All         | `app.commands.executeCommandById('editor:fold-all')`                                | —        |
| Unfold All       | `app.commands.executeCommandById('editor:unfold-all')`                              | —        |

## Files to create

### `src/tabs/HomeTab.ts`

```ts
export class HomeTab {
  render(container: HTMLElement, app: App): void {
    container.empty();
    container.addClass('onr-tab-panel');
    container.setAttribute('data-panel', 'Home');

    this.buildClipboardGroup(container, app);
    this.buildBasicTextGroup(container, app);
    this.buildStylesGroup(container, app);
    this.buildTagsGroup(container, app);
    this.buildEmailGroup(container, app);
    this.buildNavigateGroup(container, app);
  }

  private buildClipboardGroup(container: HTMLElement, app: App) { … }
  private buildBasicTextGroup(container: HTMLElement, app: App) { … }
  // etc.
}
```

### `src/styles/home.css`

All button-specific styles for the Home tab — font dropdowns, highlight swatch, styles preview panel, tag rows. Copy exact sizing from `design-mockup-v2.html` Home tab HTML.

Key measurements from mockup:

- Big Paste button: `width: 48px, min-height: 46px`
- Small stacked buttons: `width: 68px, min-height: 22px, flex-direction: row`
- Font family picker: `width: 96px, height: 22px, border: 1px solid #c8c6c4`
- Font size picker: `width: 34px, height: 22px`
- Formatting buttons row 2: `width: 22px, min-height: 22px`
- Styles preview card: `width: 130px, min-height: 28px, background: #1a1a2e`
- Tag row: `width: 150px, min-height: 20px`

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 04 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available

```
mcp__obsidian-devtools__list_pages()
```

✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot

Open `design-mockup-v2.html` in a browser. Navigate to the HOME tab section (first tab). Take a screenshot of the browser showing the Home tab ribbon.

```
mcp__obsidian-devtools__click({ uid: '[data-tab="Home"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-03-home.png' })
```

This is the visual target. The live result must match this.

### Check 1 — Home tab panel exists

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="Home"]')`
})
```

✅ Must return `true`.
❌ If `false`: HomeTab.ts not rendering — check main.ts wires up HomeTab.

### Check 2 — All 6 groups present with correct names

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="Home"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```

✅ Must return `["Clipboard","Basic Text","Styles","Tags","Email & Meetings","Navigate"]`.
❌ If missing groups: check each `build*Group` method in HomeTab.ts.

### Check 3 — Clipboard group structure

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const clipboard = document.querySelector('[data-panel="Home"] [data-group="Clipboard"]');
    if (!clipboard) return 'MISSING';
    const buttons = [...clipboard.querySelectorAll('.onr-btn')].map(b => b.querySelector('.onr-btn-label')?.textContent?.trim());
    return JSON.stringify(buttons);
  }`
})
```

✅ Must include `["Paste","Cut","Copy","Format Painter"]` (or similar).

### Check 4 — Basic Text two-row layout

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const basicText = document.querySelector('[data-panel="Home"] [data-group="Basic Text"]');
    if (!basicText) return 'MISSING';
    const rows = basicText.querySelectorAll('.onr-row');
    return { rowCount: rows.length, hasFont: !!basicText.querySelector('select, .onr-font-picker') };
  }`
})
```

✅ `rowCount` must be 2, `hasFont` must be `true`.

### Check 5 — Bold command fires

Ensure an editor is open with some text first. Then:

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const result = app.commands.executeCommandById('editor:toggle-bold');
    return result !== undefined ? 'FIRED' : 'NO_EDITOR';
  }`
})
```

✅ Must return `'FIRED'`.

### Check 6 — Tags group structure

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const tags = document.querySelector('[data-panel="Home"] [data-group="Tags"]');
    if (!tags) return 'MISSING';
    const rows = [...tags.querySelectorAll('.onr-tag-row')].map(r => r.querySelector('.onr-tag-label')?.textContent?.trim());
    return JSON.stringify(rows);
  }`
})
```

✅ Must include `["To Do","Important","Question"]`.

### Check 7 — Navigate group commands

```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return app.commands.executeCommandById('outline:open') !== undefined ? 'OK' : 'FAIL';
  }`
})
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-03-outline.png' })
```

✅ Outline panel should open in right sidebar.

### Check 8 — No console errors

```
mcp__obsidian-devtools__list_console_messages()
```

✅ Zero messages with type `"error"` related to `onenote-ribbon` or the Home tab.

### Check 9 — Live screenshot matches reference

```
mcp__obsidian-devtools__click({ uid: '[data-tab="Home"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-03-home.png' })
```

Open `plans/screenshots/ref-03-home.png` and `plans/screenshots/live-03-home.png` side by side.
✅ Must match on:

- Clipboard group: large Paste button left, stacked Cut/Copy/Format Painter right
- Basic Text: two rows visible, font picker and size picker in row 1
- Styles: dark preview panel with H1/H2 previews
- Tags: three stacked rows with colored swatches
- Email & Meetings: two large buttons
- Navigate: three buttons (Outline, Fold All, Unfold All)
  ❌ If different: identify the mismatching group and fix its render method.

## ✅ COMPLETE

- [x] Pre-flight passes (Obsidian MCP reachable)
- [x] Check 1 passes (Home panel exists)
- [x] Check 2 passes (all 6 groups with correct names)
- [x] Check 3 passes (Clipboard group has Paste + Cut/Copy/Format Painter)
- [x] Check 4 passes (Basic Text has 2 rows + font picker)
- [x] Check 5 passes (Bold command fires)
- [x] Check 6 passes (Tags has To Do / Important / Question rows)
- [x] Check 7 passes (Navigate → Outline opens panel)
- [x] Check 8 passes (zero console errors)
- [x] Check 9 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.
