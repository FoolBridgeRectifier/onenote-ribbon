# Plan R02 — Home Tab Structure

**Agent:** B  
**Phase:** 2 (after R01)  
**Dependency:** R01 shared utilities must exist  
**Produces:** `src/tabs/home/` folder with orchestrating `HomeTab.ts` and all 6 group stubs

---

## Goal

Move `src/tabs/HomeTab.ts` → `src/tabs/home/HomeTab.ts`. Create one subfolder per group. Each group module starts as a stub that delegates back to the same logic currently in HomeTab.ts — behaviour is preserved, just split into files.

The DOM output must be **bit-for-bit identical** to the current output. No visual regression.

---

## Migration Strategy

1. Create `src/tabs/home/HomeTab.ts` as a thin orchestrator
2. Create one file per group: `ClipboardGroup.ts`, `BasicTextGroup.ts`, `StylesGroup.ts`, `TagsGroup.ts`, `EmailGroup.ts`, `NavigateGroup.ts`
3. Move HTML-generation and event-handling for each group into its group file
4. Update `RibbonShell.ts` import path
5. Verify build + all existing checks pass

---

## File Layout After This Plan

```
src/tabs/home/
├── HomeTab.ts              ← orchestrator
├── home.css                ← tab-level layout (currently inline styles in HomeTab.ts)
├── clipboard/
│   └── ClipboardGroup.ts   ← stub (full impl in R03)
├── basic-text/
│   └── BasicTextGroup.ts   ← stub (full impl in R04)
├── styles/
│   └── StylesGroup.ts      ← stub (full impl in R05)
├── tags/
│   └── TagsGroup.ts        ← stub (full impl in R06)
├── email/
│   └── EmailGroup.ts       ← stub (full impl in R07)
└── navigate/
    └── NavigateGroup.ts    ← stub (full impl in R07)
```

---

## `src/tabs/home/HomeTab.ts` (orchestrator)

```ts
import { App } from "obsidian";
import { ClipboardGroup } from "./clipboard/ClipboardGroup";
import { BasicTextGroup } from "./basic-text/BasicTextGroup";
import { StylesGroup } from "./styles/StylesGroup";
import { TagsGroup } from "./tags/TagsGroup";
import { EmailGroup } from "./email/EmailGroup";
import { NavigateGroup } from "./navigate/NavigateGroup";

export class HomeTab {
  private stylesOffset = 0;

  render(container: HTMLElement, app: App): void {
    const panel = document.createElement("div");
    panel.className = "onr-tab-panel";
    panel.setAttribute("data-panel", "Home");

    new ClipboardGroup().render(panel, app);
    new BasicTextGroup().render(panel, app);
    new StylesGroup().render(
      panel,
      app,
      () => this.stylesOffset,
      (v) => {
        this.stylesOffset = v;
      },
    );
    new TagsGroup().render(panel, app);
    new EmailGroup().render(panel, app);
    new NavigateGroup().render(panel, app);

    this.attachWorkspaceListeners(panel, app);
    container.appendChild(panel);
  }

  private attachWorkspaceListeners(panel: HTMLElement, app: App): void {
    // cursor-aware state tracking (onEditorInteract)
    // format painter mouseup handler
    // active-leaf-change / editor-change hooks
    // updateRibbonState calls
    // ... (exact copy from current HomeTab.ts attachEvents, minus the per-button delegation)
  }
}
```

## Group Module Interface

Each group module must:

```ts
export class <Name>Group {
  render(container: HTMLElement, app: App, ...extraArgs?): void {
    const group = container.createDiv('onr-group');
    group.setAttribute('data-group', '<Group Name>');
    // ... build buttons, attach listeners ...
  }
}
```

### Important: `data-group` values (exact)

- `"Clipboard"`
- `"Basic Text"`
- `"Styles"`
- `"Tags"`
- `"Email & Meetings"`
- `"Navigate"`

---

## `src/tabs/home/clipboard/ClipboardGroup.ts` (stub)

Move the exact HTML and event logic for the Clipboard section from `HomeTab.ts` into this file. Keep the same inline styles. Import `showDropdown` from `../../shared/dropdown/Dropdown`.

Signature:

```ts
export class ClipboardGroup {
  render(container: HTMLElement, app: App): void { ... }
}
```

## `src/tabs/home/basic-text/BasicTextGroup.ts` (stub)

Move the Basic Text section. Import `toggleInline`, `toggleSubSup`, `toggleLinePrefix` from `../../shared/`.

Imports needed:

```ts
import { showDropdown } from "../../shared/dropdown/Dropdown";
import { toggleInline } from "../../shared/toggleInline";
import { toggleSubSup } from "../../shared/toggleSubSup";
import { toggleLinePrefix } from "../../shared/toggleLinePrefix";
```

## `src/tabs/home/styles/StylesGroup.ts` (stub)

Move Styles section. Needs `stylesOffset` state — receives it via constructor or callback from HomeTab orchestrator.

```ts
export class StylesGroup {
  render(
    container: HTMLElement,
    app: App,
    getOffset: () => number,
    setOffset: (v: number) => void,
  ): void { ... }
}
```

## `src/tabs/home/tags/TagsGroup.ts` (stub)

Move Tags section. Import `showTagsDropdown` (will be extracted to `tags-dropdown/TagsDropdown.ts` in R06 — for now inline).

The `ALL_TAGS`, `TAG_CMD_TO_DEF`, `tagNotation`, and `applyTag` functions move here temporarily. R06 will further decompose them.

## `src/tabs/home/email/EmailGroup.ts` (stub)

Move Email & Meetings section.

## `src/tabs/home/navigate/NavigateGroup.ts` (stub)

Move Navigate section.

---

## `src/ribbon/RibbonShell.ts` — update import

Change:

```ts
import { HomeTab } from "../tabs/HomeTab";
```

To:

```ts
import { HomeTab } from "../tabs/home/HomeTab";
```

---

## `src/tabs/home/home.css`

Tab-level layout only. Currently there is no `home.css` — any tab-panel-specific styles currently live in `shell.css`. Extract only truly Home-specific styles here. If nothing is Home-specific at this level, leave it as an empty placeholder.

---

## Build & Verify

```bash
npm run build
```

Then in Obsidian MCP:

### Check 1 — Plugin loads without error

```js
() => !!app.plugins.plugins["onenote-ribbon"];
```

Expected: `true`

### Check 2 — Home panel exists with correct data-panel

```js
() => !!document.querySelector('[data-panel="Home"]');
```

Expected: `true`

### Check 3 — All 6 group names present

```js
() =>
  [...document.querySelectorAll('[data-panel="Home"] .onr-group-name')].map(
    (g) => g.textContent?.trim(),
  );
```

Expected: `["Clipboard","Basic Text","Styles","Tags","Email & Meetings","Navigate"]`

### Check 4 — Insert tab still works

```js
() => !!document.querySelector('[data-panel="Insert"]');
```

Expected: `true`

### Check 5 — No console errors

```js
() => {
  // rely on mcp__obsidian-devtools__list_console_messages
  return "check-in-MCP";
};
```

### Check 6 — Screenshot matches (no visual regression)

Take screenshot and compare to `plans/screenshots/live-03-home.png` (the previously approved one).

---

## Verification Checklist

- [ ] `src/tabs/home/HomeTab.ts` exists as orchestrator
- [ ] 6 group stub files exist in correct subfolders
- [ ] `RibbonShell.ts` updated import path
- [ ] `npm run build` passes with zero errors
- [ ] All 6 groups render (Check 3 passes)
- [ ] No visual regression (screenshot matches)
- [ ] `plan-03-home-tab.md` checks 1-9 still all pass
- [ ] `README.md` created in every new folder: `src/tabs/home/`, each group subfolder (`clipboard/`, `basic-text/`, `styles/`, `tags/`, `email/`, `navigate/`)
