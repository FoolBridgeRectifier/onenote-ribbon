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

All UI files are `.tsx` (React). Business logic files stay `.ts` (unchanged).

### Shared prerequisites (create once, used by all groups)

**`src/shared/context/AppContext.ts`** — provides `App` to all components via `useApp()`:
```ts
import { createContext, useContext } from 'react';
import { App } from 'obsidian';
export const AppContext = createContext<App>(null!);
export const useApp = () => useContext(AppContext);
```

**`src/shared/components/RibbonButton.tsx`** — the universal ribbon button, replaces every `createDiv("onr-btn-sm")` + `addEventListener`:
```tsx
interface Props {
  label?: string;
  icon?: React.ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick: (e: React.MouseEvent) => void;
}
export function RibbonButton({ label, icon, title, active, disabled, className = 'onr-btn-sm', style, onClick }: Props) {
  return (
    <div
      className={`${className}${active ? ' onr-active' : ''}${disabled ? ' onr-disabled' : ''}`}
      title={title} style={style}
      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
      onClick={onClick}
    >
      {icon}
      {label && <span className="onr-btn-label-sm">{label}</span>}
    </div>
  );
}
```
> `onMouseDown` with `preventDefault()` is critical — it prevents the editor from losing focus when any ribbon button is clicked.

**`src/shared/components/GroupShell.tsx`** — wraps every group's container + label:
```tsx
interface Props { name: string; dataGroup: string; children: React.ReactNode; }
export function GroupShell({ name, dataGroup, children }: Props) {
  return (
    <div className="onr-group" data-group={dataGroup}>
      {children}
      <div className="onr-group-name">{name}</div>
    </div>
  );
}
```

**`src/shared/components/Dropdown.tsx`** — React portal replacing imperative `showDropdown()`:
- Uses `createPortal` to render into `document.body`
- Positions below anchor, clamps to viewport
- Closes on outside click via `useEffect`
- Accepts same `DropdownItem[]` type from `src/shared/dropdown/Dropdown.ts`

**`src/shared/hooks/useEditorState.ts`** — replaces the `requestAnimationFrame` polling + `classList.toggle` in `HomeTab.ts`. Returns `EditorState`:
```ts
interface EditorState {
  bold: boolean; italic: boolean; underline: boolean;
  strikethrough: boolean; highlight: boolean;
  subscript: boolean; superscript: boolean;
  bulletList: boolean; numberedList: boolean;
  headLevel: number;  // 0 = no heading
  fontFamily: string; fontSize: string;
}
```
Uses `useEffect` + workspace event listeners (`active-leaf-change`, `editor-change`) + `requestAnimationFrame`. Returns cleanup via `app.workspace.offref`.

**`src/shared/hooks/useFormatPainter.ts`** + **`src/shared/context/FormatPainterContext.ts`** — replaces `window._onrFPActive` / `window._onrFP` globals with React state scoped to `HomeTabPanel`.

### `src/tabs/home/HomeTabPanel.tsx`

Top-level Home panel. Owns `editorState`, `stylesOffset`, and format painter context. No DOM manipulation — all state via hooks.

```tsx
export function HomeTabPanel() {
  const app = useApp();
  const editorState = useEditorState(app);
  const fp = useFormatPainter();
  const [stylesOffset, setStylesOffset] = useState(0);

  // Sync styles offset to current heading
  useEffect(() => {
    const { headLevel } = editorState;
    if (headLevel >= 1 && headLevel <= 6)
      setStylesOffset(Math.max(0, Math.min(headLevel - 1, STYLES_LIST.length - 2)));
  }, [editorState.headLevel]);

  // Format Painter: auto-apply on drag-select mouseup (OneNote-style)
  useEffect(() => {
    const ws = document.querySelector('.workspace') ?? document.body;
    const onMouseUp = (e: MouseEvent) => { /* ... */ };
    ws.addEventListener('mouseup', onMouseUp, true);
    return () => ws.removeEventListener('mouseup', onMouseUp, true);
  }, [app, fp]);

  return (
    <FormatPainterContext.Provider value={fp}>
      <div className="onr-tab-panel" data-panel="Home">
        <ClipboardGroup />
        <BasicTextGroup editorState={editorState} />
        <StylesGroup editorState={editorState} stylesOffset={stylesOffset} setStylesOffset={setStylesOffset} />
        <TagsGroup />
        <EmailGroup />
        <NavigateGroup />
      </div>
    </FormatPainterContext.Provider>
  );
}
```

### Group files

Each group is a `.tsx` file using `<GroupShell>` + `<RibbonButton>` + `useApp()`. No `render(container, app)` methods.

| Old file | New file | Key React changes |
|----------|----------|-------------------|
| `clipboard/ClipboardGroup.ts` | `ClipboardGroup.tsx` | FP state from `useFP()` context; paste menu as `<Dropdown>` with `useState` anchor |
| `basic-text/BasicTextGroup.ts` | `BasicTextGroup.tsx` | `active` props from `editorState`; font/color/align dropdowns as `<Dropdown>` with `useRef` anchors |
| `styles/StylesGroup.ts` | `StylesGroup.tsx` | `stylesOffset` from props; preview cards as inline JSX with `active` derived from `editorState.headLevel` |
| `tags/TagsGroup.ts` | `TagsGroup.tsx` | Tag check state derived from editor on each render; no direct DOM query for `.onr-tag-check` |
| `email/EmailGroup.ts` | `EmailGroup.tsx` | Trivial — two `<RibbonButton>` with click handlers |
| `navigate/NavigateGroup.ts` | `NavigateGroup.tsx` | Trivial — three `<RibbonButton>` calling `app.commands.executeCommandById` |

All individual button files (`BoldButton.ts`, `ItalicButton.ts`, etc.) are **deleted** — their logic is inlined into the group `.tsx` files, which are now short enough to hold it.

**`src/tabs/home/clipboard/format-painter/applyFormatPainter.ts`** — new pure function extracted from the duplicated logic in `HomeTab.ts` and `FormatPainterButton.ts`:
```ts
export function applyFormatPainter(editor: Editor, selection: string, fmt: FPFormat): void { … }
```

### `src/styles/home.css`

Unchanged. All CSS class names (`onr-btn-sm`, `onr-active`, etc.) are the same — React uses `className` instead of `class` but the values are identical.

Key measurements (unchanged from original):
- Big Paste button: `width: 48px, min-height: 46px`
- Small stacked buttons: `width: 68px, min-height: 22px, flex-direction: row`
- Font family picker: `width: 96px, height: 22px`
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
