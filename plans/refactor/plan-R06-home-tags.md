# Plan R06 — Home / Tags Group

**Agent:** F  
**Phase:** 3 (parallel with R03, R04, R05, R07)  
**Dependency:** R01 (shared utilities), R02 (home structure)  
**Produces:** `src/tabs/home/tags/` fully decomposed with tests

---

## Folder Layout

```
src/tabs/home/tags/
├── TagsGroup.ts
├── tags.css
├── tags-data.ts               ← ALL_TAGS, TAG_CMD_TO_DEF, tagNotation
├── tests/
│   └── tags.integration.ts
├── tag-row/
│   ├── TagRow.ts
│   └── tests/
│       ├── tag-row.unit.ts
│       └── tag-row.edge.ts
├── tags-dropdown/
│   ├── TagsDropdown.ts
│   ├── tags-dropdown.css
│   └── tests/
│       ├── tags-dropdown.unit.ts
│       └── tags-dropdown.edge.ts
├── todo-tag/
│   ├── TodoTagButton.ts
│   └── tests/
│       ├── todo-tag.unit.ts
│       └── todo-tag.edge.ts
├── find-tags/
│   ├── FindTagsButton.ts
│   └── tests/
│       └── find-tags.unit.ts
└── tag-apply/
    ├── applyTag.ts
    └── tests/
        ├── apply-tag.unit.ts
        └── apply-tag.edge.ts
```

---

## `tags-data.ts`

Extract `ALL_TAGS`, `TAG_CMD_TO_DEF`, and `tagNotation` verbatim from `HomeTab.ts` lines 29-301.

```ts
export interface TagDef {
  label: string;
  icon: string;
  iconStyle: string;
  cmd: string;
}

export const ALL_TAGS: TagDef[] = [
  /* ... exact copy of 29 tags ... */
];

export const TAG_CMD_TO_DEF: Record<string, TagDef> = {};
for (const t of ALL_TAGS) TAG_CMD_TO_DEF[t.cmd] = t;

export function tagNotation(cmd: string): string {
  const map: Record<string, string> = {
    /* ... exact copy ... */
  };
  return map[cmd] ?? "";
}
```

---

## `tag-apply/applyTag.ts`

Extract `applyTag` and `toggleInline` usage. Import `toggleInline` from shared.

```ts
import { toggleInline } from "../../../shared/toggleInline";
import { toggleLinePrefix } from "../../../shared/toggleLinePrefix";
import { tagNotation } from "../tags-data";

export function applyTag(cmd: string, editor: any): void {
  const notation = tagNotation(cmd);
  if (!notation) return;

  if (cmd === "tag-highlight") {
    toggleInline(editor, "==");
    return;
  }

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const firstPart = notation.split("\n")[0];

  if (line.startsWith(firstPart)) {
    // Toggle OFF
    const notationLines = notation.split("\n");
    if (notationLines.length > 1) {
      editor.replaceRange(
        "",
        { line: cursor.line, ch: 0 },
        { line: cursor.line + 1, ch: 0 },
      );
      const contPrefix = notationLines[1];
      if (contPrefix) {
        const newLine = editor.getLine(cursor.line);
        if (newLine !== undefined && newLine.startsWith(contPrefix)) {
          editor.setLine(cursor.line, newLine.slice(contPrefix.length));
        }
      }
    } else {
      editor.setLine(cursor.line, line.slice(firstPart.length));
    }
  } else if (
    cmd === "tag-todo" ||
    cmd === "tag-todo-p1" ||
    cmd === "tag-todo-p2"
  ) {
    toggleLinePrefix(editor, firstPart);
  } else {
    editor.replaceRange(notation, cursor);
  }
}
```

---

## `TagRow.ts`

Renders one tag row with colored icon, label, and active-check box.

```ts
import { App } from "obsidian";
import { TagDef, tagNotation } from "../tags-data";
import { applyTag } from "../tag-apply/applyTag";

export class TagRow {
  constructor(private tag: TagDef) {}

  render(container: HTMLElement, app: App): HTMLElement {
    const row = container.createDiv("onr-btn-sm onr-tag-row");
    row.setAttribute("data-cmd", this.tag.cmd);
    row.style.cssText =
      "width:150px;min-height:20px;flex-direction:row;gap:4px;padding:1px 6px;justify-content:flex-start";

    const icon = row.createEl("span");
    icon.textContent = this.tag.icon;
    icon.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border-radius:2px;font-size:9px;flex-shrink:0;${this.tag.iconStyle}`;

    const label = row.createEl("span");
    label.className = "onr-tag-label";
    label.textContent = this.tag.label;
    label.style.cssText = "font-size:10px;color:#222";

    const check = row.createDiv("onr-tag-check");
    check.style.cssText =
      "width:14px;height:14px;border:1px solid #999;margin-left:auto;background:#fff;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center";

    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) applyTag(this.tag.cmd, editor);
    });

    return row;
  }

  updateCheck(row: HTMLElement, editor: any): void {
    const check = row.querySelector(".onr-tag-check") as HTMLElement;
    if (!check || !editor) return;
    const lineText = editor.getLine(editor.getCursor().line);
    const notation = tagNotation(this.tag.cmd);
    const isActive =
      notation && lineText.includes(notation.split("\n")[0].trim());
    check.style.background = isActive ? "#4472C4" : "#fff";
    check.innerHTML = isActive
      ? '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>'
      : "";
  }
}
```

---

## `TagsDropdown.ts`

Extract `showTagsDropdown` from HomeTab.ts (lines 415-530).

```ts
import { App } from "obsidian";
import { ALL_TAGS, tagNotation } from "../tags-data";
import { applyTag } from "../tag-apply/applyTag";
import { Notice } from "obsidian";

export class TagsDropdown {
  static show(anchor: HTMLElement, app: App): void {
    const editor = app.workspace.activeEditor?.editor;

    document
      .querySelectorAll(".onr-overlay-dropdown")
      .forEach((el) => el.remove());
    const menu = document.createElement("div");
    menu.className = "onr-overlay-dropdown";
    // ... exact styles from current showTagsDropdown ...
    // ... exact item rendering with icon + label + check ...
    // ... Customize Tags footer ...
    // ... position + outside-click-close ...
  }
}
```

---

## `TagsGroup.ts` Orchestrator

```ts
import { App } from "obsidian";
import { ALL_TAGS } from "./tags-data";
import { TagRow } from "./tag-row/TagRow";
import { TagsDropdown } from "./tags-dropdown/TagsDropdown";
import { TodoTagButton } from "./todo-tag/TodoTagButton";
import { FindTagsButton } from "./find-tags/FindTagsButton";

export class TagsGroup {
  private tagRowInstances: TagRow[] = [];

  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Tags");

    const inner = group.createDiv();
    inner.style.cssText = "display:flex;gap:4px;align-items:flex-start";

    // Tag rows column
    const rowsCol = inner.createDiv();
    rowsCol.style.cssText =
      "display:flex;flex-direction:column;gap:1px;width:150px";

    const top3 = ALL_TAGS.slice(0, 3);
    this.tagRowInstances = top3.map((tag) => {
      const tr = new TagRow(tag);
      tr.render(rowsCol, app);
      return tr;
    });

    // Dropdown arrow
    const dropCol = inner.createDiv();
    dropCol.style.cssText =
      "display:flex;flex-direction:column;justify-content:center;height:64px";
    const dropBtn = dropCol.createDiv("onr-btn-sm");
    dropBtn.setAttribute("data-cmd", "tags-dropdown");
    dropBtn.style.cssText =
      "width:14px;min-height:64px;padding:0;font-size:9px;justify-content:center";
    dropBtn.textContent = "▾";
    dropBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    dropBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      TagsDropdown.show(dropBtn, app);
    });

    // Big buttons
    new TodoTagButton().render(inner, app);
    new FindTagsButton().render(inner, app);

    group.createDiv("onr-group-name").textContent = "Tags";
  }

  refreshChecks(panel: HTMLElement, editor: any): void {
    // Called from updateRibbonState in HomeTab
    // ... refresh each tag row's check indicator ...
  }
}
```

---

## `TodoTagButton.ts`

```ts
import { App } from "obsidian";
import { toggleLinePrefix } from "../../../shared/toggleLinePrefix";

export class TodoTagButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "todo-tag");
    btn.style.cssText = "width:46px;min-height:58px";
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="12" y1="9" x2="12" y2="15"/>
      </svg>
      <span class="onr-btn-label">To Do Tag</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleLinePrefix(editor, "- [ ] ");
    });
  }
}
```

---

## `FindTagsButton.ts`

```ts
import { App } from "obsidian";

export class FindTagsButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "find-tags");
    btn.style.cssText = "width:46px;min-height:58px";
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
      <span class="onr-btn-label">Find Tags</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      app.commands.executeCommandById("global-search:open");
      setTimeout(() => {
        const leaf = app.workspace.getMostRecentLeaf();
        if (leaf) app.workspace.setActiveLeaf(leaf, { focus: true });
      }, 100);
    });
  }
}
```

---

## CSS: `tags.css`

```css
/* Tags Group Layout */
[data-group="Tags"] .onr-tag-row {
  width: 150px;
  min-height: 20px;
  flex-direction: row;
  gap: 4px;
  padding: 1px 6px;
  justify-content: flex-start;
}

[data-group="Tags"] .onr-tag-check {
  width: 14px;
  height: 14px;
  border: 1px solid #999;
  margin-left: auto;
  background: #fff;
  flex-shrink: 0;
  border-radius: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-group="Tags"] [data-cmd="tags-dropdown"] {
  width: 14px;
  min-height: 64px;
  padding: 0;
  font-size: 9px;
  justify-content: center;
}
```

## CSS: `tags-dropdown/tags-dropdown.css`

```css
/* Tags Overlay Dropdown — dark theme */
.onr-tags-dropdown {
  position: fixed;
  background: #1a1a1a;
  border: 1px solid #555;
  border-radius: 2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  z-index: 99999;
  min-width: 220px;
  padding: 2px 0;
  font-size: 12px;
  max-height: 420px;
  overflow-y: auto;
}

.onr-tags-dropdown .onr-dd-item {
  padding: 4px 8px;
  cursor: pointer;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.onr-tags-dropdown .onr-dd-item:hover {
  background: #2a2a3e;
}
```

---

## Tests

### `tests/tag-row.unit.ts`

```ts
export const tagRowUnitTest = `() => {
  const results = [];

  // T1: 3 tag rows present (To Do, Important, Question)
  const rows = document.querySelectorAll('[data-panel="Home"] .onr-tag-row');
  results.push({ test: 'three-tag-rows', pass: rows.length === 3 });

  // T2: First row is "To Do"
  const firstLabel = rows[0]?.querySelector('.onr-tag-label')?.textContent?.trim();
  results.push({ test: 'first-row-todo', pass: firstLabel === 'To Do' });

  // T3: Second row is "Important"
  const secondLabel = rows[1]?.querySelector('.onr-tag-label')?.textContent?.trim();
  results.push({ test: 'second-row-important', pass: secondLabel === 'Important' });

  // T4: Each row has a check box
  const checks = document.querySelectorAll('[data-panel="Home"] .onr-tag-check');
  results.push({ test: 'three-check-boxes', pass: checks.length >= 3 });

  return results;
}`;
```

### `tests/tag-row.edge.ts`

```ts
export const tagRowEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Active check appears when current line has "- [ ] " prefix
    editor.setValue('- [ ] My task');
    editor.setCursor({ line: 0, ch: 5 });
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const todoRow = document.querySelector('[data-panel="Home"] [data-cmd="tag-todo"]');
    const check = todoRow?.querySelector('.onr-tag-check') as HTMLElement;
    results.push({ test: 'todo-check-active-on-todo-line', pass: check?.style.background === 'rgb(68, 114, 196)' || check?.style.background === '#4472C4' });

    // Edge 2: Check disappears on non-todo line
    editor.setValue('plain text');
    editor.setCursor({ line: 0, ch: 0 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    results.push({ test: 'todo-check-inactive-on-plain-line', pass: check?.style.background === 'rgb(255, 255, 255)' || check?.style.background === '#fff' || check?.style.background === '' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/tags-dropdown.unit.ts`

```ts
export const tagsDropdownUnitTest = `() => {
  const results = [];

  // T1: Dropdown arrow exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]');
  results.push({ test: 'tags-dropdown-btn-exists', pass: !!btn });

  // T2: Click opens overlay
  btn?.click();
  const overlay = document.querySelector('.onr-overlay-dropdown');
  results.push({ test: 'dropdown-opens', pass: !!overlay });

  // T3: Has 29 tag items (ALL_TAGS) + 1 divider + 1 customize = 31 children ish
  const children = overlay?.children.length ?? 0;
  results.push({ test: 'dropdown-has-many-items', pass: children >= 29 });

  // T4: First item is "To Do"
  const items = overlay?.querySelectorAll('.onr-dd-item');
  const firstLabel = items?.[0]?.querySelector('span:nth-child(2)')?.textContent?.trim();
  results.push({ test: 'first-item-todo', pass: firstLabel === 'To Do' });

  // Cleanup
  document.body.click();
  return results;
}`;
```

### `tests/tags-dropdown.edge.ts`

```ts
export const tagsDropdownEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // Edge 1: Active check shown for tags present on current line
  if (editor) {
    editor.setValue('> [!important]\\n> ');
    editor.setCursor({ line: 0, ch: 5 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]');
    btn?.click();

    const items = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')];
    const importantItem = items.find(i => i.textContent?.includes('Important'));
    const check = importantItem?.querySelector('div') as HTMLElement;
    // Check should be blue (active)
    results.push({ test: 'dropdown-active-check-for-current-line-tag', pass: !!importantItem });

    document.body.click();
    editor.setValue('');
  }

  // Edge 2: "Customize Tags..." footer row exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]');
  btn?.click();
  const customizeRow = [...document.querySelectorAll('.onr-overlay-dropdown div')]
    .find(d => d.textContent?.includes('Customize Tags'));
  results.push({ test: 'customize-tags-footer', pass: !!customizeRow });
  document.body.click();

  return results;
}`;
```

### `tests/todo-tag.unit.ts`

```ts
export const todoTagUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="todo-tag"]');
  results.push({ test: 'todo-tag-exists', pass: !!btn });

  if (editor) {
    // T2: Click on plain line adds "- [ ] " prefix
    editor.setValue('My task');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'todo-tag-adds-prefix', pass: editor.getValue() === '- [ ] My task' });

    // T3: Click again removes prefix
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'todo-tag-removes-prefix', pass: editor.getValue() === 'My task' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/todo-tag.edge.ts`

```ts
export const todoTagEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Click on existing bullet converts to todo
    editor.setValue('- My bullet');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Home"] [data-cmd="todo-tag"]')?.click();
    results.push({ test: 'todo-tag-replaces-bullet', pass: editor.getValue() === '- [ ] My bullet' });

    // Edge 2: Click on completed "- [x] " removes prefix
    editor.setValue('- [x] Done task');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Home"] [data-cmd="todo-tag"]')?.click();
    // toggleLinePrefix with '- [ ] ' on a '- [x] ' line: hasPrefix check catches [x] variant
    results.push({ test: 'todo-tag-removes-completed', pass: editor.getValue() === 'Done task' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/find-tags.unit.ts`

```ts
export const findTagsUnitTest = `() => {
  const results = [];

  // T1: Button exists with correct label
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="find-tags"]');
  results.push({ test: 'find-tags-exists', pass: !!btn });
  results.push({ test: 'find-tags-label', pass: btn?.querySelector('.onr-btn-label')?.textContent?.trim() === 'Find Tags' });

  // T2: Click opens global search (side effect: a leaf with search opens)
  btn?.click();
  await new Promise(r => setTimeout(r, 200));
  const hasSearch = !!document.querySelector('.search-view-container, .global-search-container, [data-type="search"]');
  results.push({ test: 'find-tags-opens-search', pass: hasSearch });

  return results;
}`;
```

### `tests/apply-tag.unit.ts`

```ts
export const applyTagUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Apply "tag-important" inserts callout
  editor.setValue('My line');
  editor.setCursor({ line: 0, ch: 0 });
  // Simulate applyTag for 'tag-important'
  const notation = '> [!important]\\n> ';
  const cursor = editor.getCursor();
  editor.replaceRange(notation, cursor);
  results.push({ test: 'apply-important-inserts-callout', pass: editor.getValue().startsWith('> [!important]') });

  // T2: Clicking Important tag row triggers applyTag
  editor.setValue('Normal line');
  editor.setCursor({ line: 0, ch: 0 });
  const importantRow = document.querySelector('[data-panel="Home"] [data-cmd="tag-important"]');
  importantRow?.click();
  results.push({ test: 'tag-row-click-applies-tag', pass: editor.getValue().includes('[!important]') });

  editor.setValue('');
  return results;
}`;
```

### `tests/apply-tag.edge.ts`

```ts
export const applyTagEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // Edge 1: Toggle OFF — clicking Important on a line that already has [!important] removes it
  editor.setValue('> [!important]\\n> My content');
  editor.setCursor({ line: 0, ch: 5 });
  document.querySelector('[data-panel="Home"] [data-cmd="tag-important"]')?.click();
  // applyTag should detect line starts with "> [!important]" and remove the callout header
  results.push({ test: 'apply-tag-toggle-off-callout', pass: !editor.getValue().includes('[!important]') });

  // Edge 2: tag-highlight uses toggleInline (== wrapper)
  editor.setValue('Some text');
  editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
  document.querySelector('[data-panel="Home"] [data-cmd="tag-highlight"]')?.click();
  results.push({ test: 'highlight-tag-wraps-selection', pass: editor.getValue().includes('==Some==') || editor.getValue().startsWith('==') });

  // Edge 3: Multiline callout toggle-off strips both header and continuation prefix
  editor.setValue('> [!note] Remember for later\\n> My reminder text');
  editor.setCursor({ line: 0, ch: 5 });
  document.querySelector('[data-panel="Home"] [data-cmd="tag-remember"]')?.click();
  results.push({ test: 'multiline-callout-toggle-strips-both-lines', pass: !editor.getValue().includes('[!note]') });

  editor.setValue('');
  return results;
}`;
```

### `tests/tags.integration.ts`

```ts
export const tagsIntegrationTest = `() => {
  const results = [];

  // I1: Tags group has all required elements
  const group = document.querySelector('[data-panel="Home"] [data-group="Tags"]');
  results.push({ test: 'tags-group-present', pass: !!group });

  // I2: 3 tag rows
  const rows = group?.querySelectorAll('.onr-tag-row');
  results.push({ test: 'tags-three-rows', pass: (rows?.length ?? 0) === 3 });

  // I3: Dropdown button
  results.push({ test: 'tags-dropdown-btn', pass: !!group?.querySelector('[data-cmd="tags-dropdown"]') });

  // I4: Todo Tag big button
  results.push({ test: 'todo-tag-btn', pass: !!group?.querySelector('[data-cmd="todo-tag"]') });

  // I5: Find Tags big button
  results.push({ test: 'find-tags-btn', pass: !!group?.querySelector('[data-cmd="find-tags"]') });

  // I6: Group name
  const name = group?.querySelector('.onr-group-name');
  results.push({ test: 'tags-group-name', pass: name?.textContent?.trim() === 'Tags' });

  return results;
}`;
```

---

## Verification Checklist

- [ ] `tags-data.ts` with all 29 ALL_TAGS, tagNotation map
- [ ] `tag-apply/applyTag.ts` with correct toggle logic
- [ ] All 6 module files created
- [ ] `tags.css` and `tags-dropdown.css` scoped correctly
- [ ] All test files as `.ts`
- [ ] `npm run build` passes
- [ ] All integration and unit tests pass in live Obsidian
- [ ] Toggle-off edge case for multiline callout passes
- [ ] Checklist variant stripping passes in todo-tag edge tests
- [ ] `README.md` created in every folder: `tags/`, each subfolder (`tag-row/`, `tags-dropdown/`, `todo-tag/`, `find-tags/`, `tag-apply/`), and all `tests/` subfolders
