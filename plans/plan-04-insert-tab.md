# Plan 04 — Insert Tab

## Goal
Implement the full Insert tab matching the design exactly.

## Reference design
Open `design-mockup-v2.html` — Tab 2 INSERT. Groups left to right:
1. **Insert** — Blank Line (single large button)
2. **Tables** — Table (single large button)
3. **Files** — Attach File + Embed Note
4. **Images** — Image + Video
5. **Links** — Link + [[Wikilink]]
6. **Time Stamp** — Date + Time + Date & Time
7. **Blocks** — Template + Callout + Code Block
8. **Symbols** — Math $$ + Horizontal Rule + Footnote + #Tag

## Button → Command mapping

| Button | Action | Icon |
|---|---|---|
| Blank Line | Insert `\n` at cursor | `plus` |
| Table | Insert 3×3 markdown table template `\| col \| col \| col \|\n\|---|---|---\|\n\| \| \| \|` | `table` |
| Attach File | Open Obsidian file suggestion modal → insert `![[filename]]` | `paperclip` |
| Embed Note | Open note suggestion modal → insert `![[notename]]` | `file-symlink` |
| Image | Open file suggestion filtered to images → insert `![[image.png]]` | `image` |
| Video | Insert iframe template or Media Extended command | `video` |
| Link | `app.commands.executeCommandById('editor:insert-link')` | `link` |
| [[Wikilink]] | Type `[[` into editor to trigger suggestion | `file-symlink` |
| Date | Insert `moment().format('YYYY-MM-DD')` | `calendar` |
| Time | Insert `moment().format('HH:mm')` | `clock` |
| Date & Time | Insert `moment().format('YYYY-MM-DD HH:mm')` | `calendar-clock` |
| Template | `app.commands.executeCommandById('insert-template')` | `layout-template` |
| Callout | Open callout type picker modal → insert `> [!type]\n> ` | `megaphone` |
| Code Block | Insert ` ```\n\n``` ` with cursor inside | `code` |
| Math $$ | Insert `$$\n\n$$` with cursor inside | `sigma` |
| Horizontal Rule | Insert `\n---\n` | `minus` |
| Footnote | Insert `[^1]` at cursor + `\n[^1]: ` at end of note | `corner-down-right` |
| #Tag | Insert `#` at cursor, triggers tag suggestion | `hash` |

## Callout types for picker modal
`note`, `abstract`, `info`, `tip`, `success`, `question`, `warning`, `failure`, `danger`, `bug`, `example`, `quote`

## Files to create

All UI files are `.tsx` (React). No `render(container, app)` methods. No `createDiv`/`addEventListener`.

### `src/tabs/insert/InsertTabPanel.tsx`

Top-level Insert panel — replaces `InsertTab.ts`:

```tsx
import { GroupShell } from '../../shared/components/GroupShell';
import { BlankLineButton } from './blank-line/BlankLineButton';
import { TablesGroup } from './tables/TablesGroup';
import { FilesGroup } from './files/FilesGroup';
import { ImagesGroup } from './images/ImagesGroup';
import { LinksGroup } from './links/LinksGroup';
import { TimestampGroup } from './timestamp/TimestampGroup';
import { BlocksGroup } from './blocks/BlocksGroup';
import { SymbolsGroup } from './symbols/SymbolsGroup';

export function InsertTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Insert">
      <GroupShell name="Insert" dataGroup="Insert">
        <div className="onr-group-buttons">
          <BlankLineButton />
        </div>
      </GroupShell>
      <TablesGroup />
      <FilesGroup />
      <ImagesGroup />
      <LinksGroup />
      <TimestampGroup />
      <BlocksGroup />
      <SymbolsGroup />
    </div>
  );
}
```

### Group files (8 total)

Each group file is a `.tsx` component using `<GroupShell>` + `<RibbonButton>` + `useApp()`.
The conversion recipe for every group is identical:

| Step | Old pattern | New pattern |
|------|-------------|-------------|
| Container | `container.createDiv("onr-group")` | `<GroupShell name="…" dataGroup="…">` |
| Button | `new XButton().render(col, app)` | `<RibbonButton label="…" onClick={handler} />` |
| mousedown guard | `btn.addEventListener("mousedown", e => e.preventDefault())` | Built into `RibbonButton` — no change needed |
| App reference | received as `app: App` parameter | `const app = useApp()` |
| Editor reference | `app.workspace.activeEditor?.editor` | same, called inside `onClick` |

**`blank-line/BlankLineButton.tsx`**
```tsx
export function BlankLineButton() {
  const app = useApp();
  return (
    <RibbonButton label="Blank Line" onClick={() => {
      const ed = app.workspace.activeEditor?.editor;
      ed?.replaceRange('\n', ed.getCursor());
    }} />
  );
}
```

**`tables/TablesGroup.tsx`** — one Table button:
```tsx
onClick={() => {
  const ed = app.workspace.activeEditor?.editor;
  ed?.replaceRange('| col | col | col |\n|---|---|---|\n| | | |\n', ed.getCursor());
}}
```

**`files/FilesGroup.tsx`** — Attach File + Embed Note buttons:
```tsx
// Attach File
onClick={() => app.commands.executeCommandById('editor:attach-file')}
// Embed Note
onClick={() => { const ed = app.workspace.activeEditor?.editor; ed?.replaceRange('![[', ed.getCursor()); }}
```

**`images/ImagesGroup.tsx`** — Image + Video buttons.

**`links/LinksGroup.tsx`** — Link + Wikilink buttons:
```tsx
// Link
onClick={() => app.commands.executeCommandById('editor:insert-link')}
// Wikilink
onClick={() => { const ed = app.workspace.activeEditor?.editor; ed?.replaceRange('[[', ed.getCursor()); }}
```

**`timestamp/TimestampGroup.tsx`** — Date / Time / Date & Time buttons:
```tsx
const now = new Date();
// Date
onClick={() => ed?.replaceRange(now.toISOString().slice(0, 10), ed.getCursor())}
// Time
onClick={() => ed?.replaceRange(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ed.getCursor())}
// Date & Time
onClick={() => ed?.replaceRange(`${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, ed.getCursor())}
```

**`blocks/BlocksGroup.tsx`** — Template / Callout / Code Block buttons.
Callout uses a `<Dropdown>` with the 12 callout types:
```tsx
const [calloutAnchor, setCalloutAnchor] = useState<HTMLElement | null>(null);
const calloutRef = useRef<HTMLDivElement>(null);
const CALLOUT_TYPES = ['note','abstract','info','tip','success','question','warning','failure','danger','bug','example','quote'];
// ...
{calloutAnchor && (
  <Dropdown anchor={calloutAnchor}
    items={CALLOUT_TYPES.map(t => ({
      label: t,
      action: () => { const ed = app.workspace.activeEditor?.editor; ed?.replaceRange(`> [!${t}]\n> `, ed.getCursor()); }
    }))}
    onClose={() => setCalloutAnchor(null)}
  />
)}
```

**`symbols/SymbolsGroup.tsx`** — Math / HR / Footnote / Tag buttons:
```tsx
// Math
onClick={() => ed?.replaceRange('$$\n\n$$', ed.getCursor())}
// Horizontal Rule
onClick={() => ed?.replaceRange('\n---\n', ed.getCursor())}
// Footnote
onClick={() => { ed?.replaceRange('[^1]', ed.getCursor()); /* append [^1]: at end */ }}
// Tag
onClick={() => ed?.replaceRange('#', ed.getCursor())}
```

### `src/styles/insert.css`
Unchanged. Inherits all base button styles from `shell.css`. No new CSS needed.

## Testing with Obsidian MCP

> **Rule: this plan is NOT complete until every MCP check below passes AND the live screenshot matches the reference screenshot. Do not move to Plan 05 until all checks are green.**

### Pre-flight — Verify Obsidian MCP is available
```
mcp__obsidian-devtools__list_pages()
```
✅ Must return at least one page. If empty or error: Obsidian is not running with `--remote-debugging-port=9222`. Fix before continuing.

### Reference screenshot
Open `design-mockup-v2.html` in a browser. Click the INSERT tab. Take a screenshot of the browser showing the Insert tab ribbon.
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Insert"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/ref-04-insert.png' })
```
This is the visual target. The live result must match this.

### Check 1 — Insert tab panel exists
```
mcp__obsidian-devtools__click({ uid: '[data-tab="Insert"]' })
mcp__obsidian-devtools__evaluate_script({
  function: `() => !!document.querySelector('[data-panel="Insert"]')`
})
```
✅ Must return `true`.

### Check 2 — All 8 groups present with correct names
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    return [...document.querySelectorAll('[data-panel="Insert"] .onr-group-name')]
      .map(g => g.textContent?.trim());
  }`
})
```
✅ Must return `["Insert","Tables","Files","Images","Links","Time Stamp","Blocks","Symbols"]`.

### Check 3 — Table insertion
Open a markdown note first. Then click Table button and verify markdown table was inserted:
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return 'NO_EDITOR';
    const before = editor.getValue();
    // Simulate table button click
    document.querySelector('[data-command="insert-table"]')?.click();
    const after = editor.getValue();
    return after.includes('|') ? 'TABLE_INSERTED' : 'NOT_INSERTED';
  }`
})
```
✅ Must return `'TABLE_INSERTED'`.

### Check 4 — Date insertion
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    document.querySelector('[data-command="insert-date"]')?.click();
    const editor = app.workspace.activeEditor?.editor;
    const val = editor?.getValue() ?? '';
    return /\d{4}-\d{2}-\d{2}/.test(val) ? 'DATE_OK' : 'NO_DATE';
  }`
})
```
✅ Must return `'DATE_OK'`.

### Check 5 — Code block insertion positions cursor inside
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    document.querySelector('[data-command="insert-code-block"]')?.click();
    const editor = app.workspace.activeEditor?.editor;
    return editor?.getValue().includes('```') ? 'CODE_OK' : 'NO_CODE';
  }`
})
```
✅ Must return `'CODE_OK'`.

### Check 6 — Time Stamp group has 3 buttons
```
mcp__obsidian-devtools__evaluate_script({
  function: `() => {
    const ts = document.querySelector('[data-panel="Insert"] [data-group="Time Stamp"]');
    return ts?.querySelectorAll('.onr-btn').length;
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
mcp__obsidian-devtools__click({ uid: '[data-tab="Insert"]' })
mcp__obsidian-devtools__take_screenshot({ filePath: 'plans/screenshots/live-04-insert.png' })
```
Open `plans/screenshots/ref-04-insert.png` and `plans/screenshots/live-04-insert.png` side by side.
✅ Must match on:
- 8 groups visible with separators between each
- All large buttons are 48×60px
- Time Stamp: 3 buttons in a row
- Symbols: 4 buttons in a row
- No overflow or horizontal scroll
❌ If different: identify the mismatching group and fix it.

## ❌ NOT complete until
- [ ] Pre-flight passes (Obsidian MCP reachable)
- [ ] Check 1 passes (Insert panel exists)
- [ ] Check 2 passes (all 8 groups with correct names)
- [ ] Check 3 passes (Table inserts valid markdown)
- [ ] Check 4 passes (Date inserts YYYY-MM-DD)
- [ ] Check 5 passes (Code block inserted with ```)
- [ ] Check 6 passes (Time Stamp group has 3 buttons)
- [ ] Check 7 passes (zero console errors)
- [ ] Check 8 passes (live screenshot matches reference mockup)

If any check fails: diagnose, fix, rebuild, reload plugin, re-run all checks from Check 1.

---

## What changed & how to test

**Files added/changed:**
- `src/tabs/InsertTab.ts` — new file, all 8 groups and their button handlers
- `src/ribbon/RibbonShell.ts` — import and render InsertTab panel
- `npm run build` → reload plugin

**Quick smoke test in Obsidian:**
1. Click the **Insert** tab in the ribbon
2. Open any markdown note so an editor is active
3. Click **Table** — a 3-column markdown table should appear at the cursor
4. Click **Date** — today's date (`2026-04-07`) should be inserted
5. Click **Code Block** — a fenced ` ``` ` block should appear with cursor inside
6. Click **Link** — Obsidian's insert-link modal should open
7. Click **#Tag** — a `#` should be inserted and tag autocomplete should trigger
