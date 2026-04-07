# Plan R09 — Insert Tab Structure

**Agent:** I  
**Phase:** 2 (parallel with R02)  
**Dependency:** R01 (shared utilities)  
**Produces:** `src/tabs/insert/` folder with orchestrating `InsertTab.ts` and all 8 group stubs

---

## Goal

Move `src/tabs/InsertTab.ts` → `src/tabs/insert/InsertTab.ts`. Create one subfolder per group. All behavior preserved. DOM output bit-for-bit identical.

---

## Folder Layout After This Plan

```
src/tabs/insert/
├── InsertTab.ts            ← orchestrator
├── insert.css              ← tab-level layout
├── blank-line/
│   └── BlankLineButton.ts  ← stub
├── tables/
│   └── TablesGroup.ts      ← stub
├── files/
│   └── FilesGroup.ts       ← stub
├── images/
│   └── ImagesGroup.ts      ← stub
├── links/
│   └── LinksGroup.ts       ← stub
├── timestamp/
│   └── TimestampGroup.ts   ← stub
├── blocks/
│   └── BlocksGroup.ts      ← stub (includes callout-picker subfolder)
└── symbols/
    └── SymbolsGroup.ts     ← stub
```

---

## `InsertTab.ts` Orchestrator

```ts
import { App } from "obsidian";
import { BlankLineButton } from "./blank-line/BlankLineButton";
import { TablesGroup } from "./tables/TablesGroup";
import { FilesGroup } from "./files/FilesGroup";
import { ImagesGroup } from "./images/ImagesGroup";
import { LinksGroup } from "./links/LinksGroup";
import { TimestampGroup } from "./timestamp/TimestampGroup";
import { BlocksGroup } from "./blocks/BlocksGroup";
import { SymbolsGroup } from "./symbols/SymbolsGroup";

export class InsertTab {
  render(container: HTMLElement, app: App): void {
    const panel = container.createDiv();
    panel.addClass("onr-tab-panel");
    panel.setAttribute("data-panel", "Insert");
    panel.style.display = "none";

    // "Insert" group is a single button, rendered as a group for consistency
    const insertGroup = panel.createDiv("onr-group");
    insertGroup.setAttribute("data-group", "Insert");
    const insertButtons = insertGroup.createDiv("onr-group-buttons");
    new BlankLineButton().render(insertButtons, app);
    insertGroup.createDiv("onr-group-name").textContent = "Insert";

    new TablesGroup().render(panel, app);
    new FilesGroup().render(panel, app);
    new ImagesGroup().render(panel, app);
    new LinksGroup().render(panel, app);
    new TimestampGroup().render(panel, app);
    new BlocksGroup().render(panel, app);
    new SymbolsGroup().render(panel, app);

    container.appendChild(panel);
  }
}
```

## Update `RibbonShell.ts`

Change:

```ts
import { InsertTab } from "../tabs/InsertTab";
```

To:

```ts
import { InsertTab } from "../tabs/insert/InsertTab";
```

---

## Group Stubs

Each group stub follows this interface. Full implementation in R10.

### `TablesGroup.ts` (stub)

```ts
import { App } from "obsidian";

export class TablesGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Tables");
    const buttons = group.createDiv("onr-group-buttons");
    // Stub: insert-table button — full impl in R10
    const btn = buttons.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "insert-table");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
      </svg>
      <span class="onr-btn-label">Table</span>`;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        const cursor = editor.getCursor();
        editor.replaceRange(
          "\n| col | col | col |\n|---|---|---|\n| | | |\n",
          cursor,
        );
      }
    });
    group.createDiv("onr-group-name").textContent = "Tables";
  }
}
```

All other group stubs follow the same pattern — they include the minimum logic from the current `InsertTab.ts` to pass existing checks, and will be fully decomposed in R10.

### Group stubs to create (minimal — copy logic from current InsertTab.ts):

- `files/FilesGroup.ts` — Attach File + Embed Note buttons
- `images/ImagesGroup.ts` — Image + Video buttons
- `links/LinksGroup.ts` — Link + [[Wikilink]] buttons
- `timestamp/TimestampGroup.ts` — Date + Time + Date & Time buttons
- `blocks/BlocksGroup.ts` — Template + Callout + Code Block buttons (includes inline callout picker)
- `symbols/SymbolsGroup.ts` — Math + HR + Footnote + Tag buttons

---

## Build & Verify

```bash
npm run build
```

### Check 1 — Insert panel exists

```js
() => !!document.querySelector('[data-panel="Insert"]');
```

Expected: `true`

### Check 2 — All 8 group names present

```js
() =>
  [...document.querySelectorAll('[data-panel="Insert"] .onr-group-name')].map(
    (g) => g.textContent?.trim(),
  );
```

Expected: `["Insert","Tables","Files","Images","Links","Time Stamp","Blocks","Symbols"]`

### Check 3 — Insert panel hidden by default (Home is active)

```js
() => {
  const panel = document.querySelector('[data-panel="Insert"]') as HTMLElement;
  return panel?.style.display === 'none';
}
```

Expected: `true`

### Check 4 — Insert panel visible when Insert tab active

```js
() => {
  document.querySelector('[data-tab="Insert"]')?.click();
  const panel = document.querySelector('[data-panel="Insert"]') as HTMLElement;
  return panel?.style.display !== 'none';
}
```

Expected: `true`

### Check 5 — All pre-existing plan-04 checks pass

All 8 checks from `plan-04-insert-tab.md` must still pass.

---

## Verification Checklist

- [ ] `src/tabs/insert/InsertTab.ts` exists as orchestrator
- [ ] 8 group stub files exist in correct subfolders
- [ ] `RibbonShell.ts` updated import path
- [ ] `npm run build` passes with zero errors
- [ ] All 8 groups render (Check 2 passes)
- [ ] No visual regression (screenshot matches previous)
- [ ] `plan-04-insert-tab.md` checks 1-8 still all pass
- [ ] `README.md` created in every new folder: `src/tabs/insert/`, each group subfolder
