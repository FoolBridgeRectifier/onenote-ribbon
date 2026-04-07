# Plan R05 — Home / Styles Group

**Agent:** E  
**Phase:** 3 (parallel with R03, R04, R06, R07)  
**Dependency:** R01 (shared utilities), R02 (home structure)  
**Produces:** `src/tabs/home/styles/` fully decomposed with tests

---

## Goal

Decompose the Styles group into `StylesPreview`, `StylesScroll`, and `StylesDropdown` sub-modules. The `stylesOffset` state is managed by the `StylesGroup.ts` orchestrator and threaded down.

---

## Folder Layout

```
src/tabs/home/styles/
├── StylesGroup.ts
├── styles.css
├── styles-data.ts            ← STYLES_LIST constant
├── tests/
│   └── styles.integration.ts
├── styles-preview/
│   ├── StylesPreview.ts
│   └── tests/
│       ├── styles-preview.unit.ts
│       └── styles-preview.edge.ts
├── styles-scroll/
│   ├── StylesScroll.ts
│   └── tests/
│       └── styles-scroll.unit.ts
└── styles-dropdown/
    ├── StylesDropdown.ts
    └── tests/
        ├── styles-dropdown.unit.ts
        └── styles-dropdown.edge.ts
```

---

## `styles-data.ts`

````ts
export interface StyleDef {
  label: string;
  style: string;
  prefix: string;
  suffix?: string;
}

export const STYLES_LIST: StyleDef[] = [
  {
    label: "Heading 1",
    style: "font-size:15px;font-weight:700;color:#5B9BD5;letter-spacing:-0.5px",
    prefix: "# ",
  },
  {
    label: "Heading 2",
    style: "font-size:13px;font-weight:700;color:#5B9BD5",
    prefix: "## ",
  },
  {
    label: "Heading 3",
    style: "font-size:12px;font-weight:700;color:#5B9BD5",
    prefix: "### ",
  },
  {
    label: "Heading 4",
    style: "font-size:12px;font-weight:700;font-style:italic;color:#5B9BD5",
    prefix: "#### ",
  },
  {
    label: "Heading 5",
    style: "font-size:11px;font-weight:700;color:#5B9BD5",
    prefix: "##### ",
  },
  {
    label: "Heading 6",
    style: "font-size:11px;font-style:italic;color:#5B9BD5",
    prefix: "###### ",
  },
  {
    label: "Page Title",
    style: "font-size:20px;font-weight:700;color:#fff",
    prefix: "# ",
  },
  {
    label: "Citation",
    style: "font-size:11px;color:#888;font-style:italic",
    prefix: "> ",
  },
  {
    label: "Quote",
    style: "font-size:12px;font-style:italic;color:#ccc",
    prefix: "> ",
  },
  {
    label: "Code",
    style:
      "font-family:monospace;font-size:11px;background:#222;padding:0 4px;color:#e0e0e0",
    prefix: "```\n",
    suffix: "\n```",
  },
  { label: "Normal", style: "font-size:12px;color:#e0e0e0", prefix: "" },
];
````

---

## `StylesGroup.ts` Orchestrator

```ts
import { App } from "obsidian";
import { STYLES_LIST } from "./styles-data";
import { StylesPreview } from "./styles-preview/StylesPreview";
import { StylesScroll } from "./styles-scroll/StylesScroll";
import { StylesDropdown } from "./styles-dropdown/StylesDropdown";

export class StylesGroup {
  render(
    container: HTMLElement,
    app: App,
    getOffset: () => number,
    setOffset: (v: number) => void,
  ): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Styles");

    const inner = group.createDiv();
    inner.style.cssText = "display:flex;align-items:stretch;gap:0";

    const preview = new StylesPreview(getOffset, setOffset);
    preview.render(inner, app, group);

    const scroll = new StylesScroll(getOffset, setOffset, () =>
      preview.refresh(group),
    );
    scroll.render(inner);

    group.createDiv("onr-group-name").textContent = "Styles";
  }
}
```

---

## `StylesPreview.ts`

Renders 2 preview cards. Exposes `refresh(panel)` for scroll/state updates.

```ts
import { App } from "obsidian";
import { STYLES_LIST } from "../styles-data";
import { StylesDropdown } from "../styles-dropdown/StylesDropdown";

export class StylesPreview {
  constructor(
    private getOffset: () => number,
    private setOffset: (v: number) => void,
  ) {}

  render(container: HTMLElement, app: App, panel: HTMLElement): void {
    const col = container.createDiv();
    col.style.cssText =
      "display:flex;flex-direction:column;gap:2px;width:130px";

    for (const i of [0, 1]) {
      const s = STYLES_LIST[this.getOffset() + i] ?? STYLES_LIST[i];
      const card = col.createDiv("onr-btn-sm");
      card.setAttribute("data-cmd", `styles-preview-${i}`);
      card.style.cssText =
        "width:130px;min-height:28px;background:#1a1a2e;border:1px solid #555;border-radius:2px;flex-direction:row;justify-content:flex-start;padding:2px 8px";

      const span = card.createEl("span");
      span.setAttribute("data-styles-text", String(i));
      span.style.cssText = s.style;
      span.textContent = s.label;

      card.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const editor = app.workspace.activeEditor?.editor;
        if (!editor) return;
        const item = STYLES_LIST[this.getOffset() + i];
        if (!item) return;
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const stripped = line.replace(/^#{1,6}\s+/, "");
        if (item.prefix) editor.setLine(cursor.line, item.prefix + stripped);
        else editor.setLine(cursor.line, stripped);
      });
    }
  }

  refresh(panel: HTMLElement): void {
    [0, 1].forEach((i) => {
      const card = panel.querySelector(
        `[data-cmd="styles-preview-${i}"]`,
      ) as HTMLElement;
      if (!card) return;
      const item = STYLES_LIST[this.getOffset() + i];
      if (!item) {
        card.style.display = "none";
        return;
      }
      card.style.display = "";
      const span = card.querySelector("span") as HTMLElement;
      if (span) {
        span.textContent = item.label;
        span.style.cssText = item.style;
      }
    });
  }
}
```

---

## `StylesScroll.ts`

```ts
import { STYLES_LIST } from "../styles-data";

export class StylesScroll {
  constructor(
    private getOffset: () => number,
    private setOffset: (v: number) => void,
    private onUpdate: () => void,
  ) {}

  render(container: HTMLElement): void {
    const col = container.createDiv();
    col.style.cssText =
      "display:flex;flex-direction:column;justify-content:space-between;padding:2px 1px;gap:2px";

    const up = col.createDiv("onr-btn-sm");
    up.setAttribute("data-cmd", "styles-scroll-up");
    up.style.cssText =
      "width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center";
    up.textContent = "▲";

    const down = col.createDiv("onr-btn-sm");
    down.setAttribute("data-cmd", "styles-scroll-down");
    down.style.cssText =
      "width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center";
    down.textContent = "▼";

    const dropBtn = col.createDiv("onr-btn-sm");
    dropBtn.setAttribute("data-cmd", "styles-dropdown");
    dropBtn.style.cssText =
      "width:16px;min-height:14px;padding:0;font-size:9px;justify-content:center";
    dropBtn.textContent = "▾";

    up.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    up.addEventListener("click", () => {
      const newOffset = Math.max(0, this.getOffset() - 1);
      this.setOffset(newOffset);
      this.onUpdate();
    });

    down.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    down.addEventListener("click", () => {
      const newOffset = Math.min(STYLES_LIST.length - 2, this.getOffset() + 1);
      this.setOffset(newOffset);
      this.onUpdate();
    });
  }
}
```

---

## `StylesDropdown.ts`

```ts
import { App } from "obsidian";
import { showDropdown } from "../../../shared/dropdown/Dropdown";
import { STYLES_LIST } from "../styles-data";

export class StylesDropdown {
  static show(anchor: HTMLElement, app: App): void {
    showDropdown(
      anchor,
      STYLES_LIST.map((s) => ({
        label: s.label,
        style: s.style,
        action: () => {
          const editor = app.workspace.activeEditor?.editor;
          if (!editor) return;
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          const stripped = line.replace(/^#{1,6}\s+/, "");
          if (s.prefix) editor.setLine(cursor.line, s.prefix + stripped);
          else editor.setLine(cursor.line, stripped);
        },
      })),
      { bg: "#1a1a2e", hoverBg: "#2a2a3e", color: "#e0e0e0" },
    );
  }
}
```

---

## CSS: `styles.css`

```css
/* Styles Group */
[data-group="Styles"] [data-cmd^="styles-preview-"] {
  width: 130px;
  min-height: 28px;
  background: #1a1a2e;
  border: 1px solid #555;
  border-radius: var(--radius-sm);
  flex-direction: row;
  justify-content: flex-start;
  padding: 2px 8px;
}

[data-group="Styles"] [data-cmd^="styles-preview-"].onr-active {
  border-color: var(--btn-active-border);
  background: #1a1a3e;
}

[data-group="Styles"] [data-cmd="styles-scroll-up"],
[data-group="Styles"] [data-cmd="styles-scroll-down"] {
  width: 16px;
  min-height: 28px;
  padding: 0;
  font-size: 9px;
  justify-content: center;
}

[data-group="Styles"] [data-cmd="styles-dropdown"] {
  width: 16px;
  min-height: 14px;
  padding: 0;
  font-size: 9px;
  justify-content: center;
}
```

---

## Tests

### `tests/styles-preview.unit.ts`

```ts
export const stylesPreviewUnitTest = `() => {
  const results = [];

  // T1: Two preview cards exist
  const cards = document.querySelectorAll('[data-panel="Home"] [data-cmd^="styles-preview-"]');
  results.push({ test: 'two-preview-cards', pass: cards.length === 2 });

  // T2: First card shows "Heading 1" (default offset=0)
  const card0 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]');
  const span0 = card0?.querySelector('span');
  results.push({ test: 'first-card-label', pass: span0?.textContent?.trim() === 'Heading 1' });

  // T3: Second card shows "Heading 2"
  const card1 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-1"]');
  const span1 = card1?.querySelector('span');
  results.push({ test: 'second-card-label', pass: span1?.textContent?.trim() === 'Heading 2' });

  // T4: Cards have dark background
  const bg = (card0 as HTMLElement)?.style.background || getComputedStyle(card0 as Element).background;
  results.push({ test: 'cards-dark-bg', pass: !!bg });

  return results;
}`;
```

### `tests/styles-preview.edge.ts`

```ts
export const stylesPreviewEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Cursor on H3 line — ribbon state update scrolls preview to show H3
    editor.setValue('### Section Title');
    editor.setCursor({ line: 0, ch: 5 });
    // Trigger updateRibbonState
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const card0 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]');
    const span0 = card0?.querySelector('span');
    // After H3 cursor, offset should be 2 → first card = Heading 3
    results.push({ test: 'h3-cursor-scrolls-preview', pass: span0?.textContent?.trim() === 'Heading 3' });

    // Edge 2: H3 card gets active state
    results.push({ test: 'h3-card-active', pass: card0?.classList.contains('onr-active') ?? false });

    // Edge 3: Click first card on H3 line — no prefix change (already H3)
    card0?.click();
    results.push({ test: 'click-same-style-noop', pass: editor.getValue() === '### Section Title' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/styles-scroll.unit.ts`

```ts
export const stylesScrollUnitTest = `() => {
  const results = [];

  // T1: Up/Down/dropdown buttons exist
  const up = document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]');
  const down = document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-down"]');
  const drop = document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]');
  results.push({ test: 'scroll-up-exists', pass: !!up });
  results.push({ test: 'scroll-down-exists', pass: !!down });
  results.push({ test: 'styles-dropdown-exists', pass: !!drop });

  // T2: Scroll down changes first card label
  const card0Before = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  down?.click();
  const card0After = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  results.push({ test: 'scroll-down-changes-label', pass: card0After !== card0Before });

  // T3: Scroll up restores original label
  up?.click();
  const card0Restored = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  results.push({ test: 'scroll-up-restores-label', pass: card0Restored === card0Before });

  // T4: Scroll up at top clamps (no negative offset)
  up?.click(); // try to go before 0
  const card0Clamped = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent?.trim();
  results.push({ test: 'scroll-clamps-at-top', pass: card0Clamped === 'Heading 1' });

  return results;
}`;
```

### `tests/styles-dropdown.unit.ts`

```ts
export const stylesDropdownUnitTest = `() => {
  const results = [];

  // T1: Click dropdown button opens menu
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]');
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'dropdown-opens', pass: items.length > 0 });

  // T2: All 11 style options present
  results.push({ test: 'dropdown-11-items', pass: items.length === 11 });

  // T3: Includes "Heading 1" and "Normal"
  const labels = [...items].map(i => i.textContent?.trim());
  results.push({ test: 'has-heading-1', pass: labels.includes('Heading 1') });
  results.push({ test: 'has-normal', pass: labels.includes('Normal') });

  // Cleanup
  document.body.click();
  return results;
}`;
```

### `tests/styles-dropdown.edge.ts`

```ts
export const stylesDropdownEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Selecting "Heading 2" on a plain line prefixes with "## "
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 0 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]');
    btn?.click();
    const h2Item = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Heading 2');
    h2Item?.click();
    results.push({ test: 'dropdown-applies-h2', pass: editor.getValue() === '## Hello world' });

    // Edge 2: Selecting "Normal" on an H2 line strips the heading
    editor.setValue('## My Heading');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const normalItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Normal');
    normalItem?.click();
    results.push({ test: 'dropdown-normal-strips-heading', pass: editor.getValue() === 'My Heading' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/styles.integration.ts`

```ts
export const stylesIntegrationTest = `() => {
  const results = [];

  // I1: All sub-component elements present
  results.push({ test: 'preview-0-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]') });
  results.push({ test: 'preview-1-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-1"]') });
  results.push({ test: 'scroll-up-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]') });
  results.push({ test: 'scroll-down-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-down"]') });
  results.push({ test: 'styles-dropdown-present', pass: !!document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]') });

  // I2: Group name
  const name = document.querySelector('[data-panel="Home"] [data-group="Styles"] .onr-group-name');
  results.push({ test: 'styles-group-name', pass: name?.textContent?.trim() === 'Styles' });

  // I3: Scroll → preview updates coherently
  const down = document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-down"]');
  const labelBefore = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent;
  down?.click();
  const labelAfter = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span')?.textContent;
  results.push({ test: 'scroll-preview-sync', pass: labelBefore !== labelAfter });

  // Restore
  document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]')?.click();

  return results;
}`;
```

---

## Verification Checklist

- [ ] `styles-data.ts` with STYLES_LIST (11 entries)
- [ ] `StylesGroup.ts` orchestrator with correct 3-module delegation
- [ ] `StylesPreview.ts` with `refresh()` method
- [ ] `StylesScroll.ts` with clamped up/down
- [ ] `StylesDropdown.ts` using shared `showDropdown`
- [ ] `styles.css` with scoped selectors
- [ ] All 6 test files as `.ts`
- [ ] `npm run build` passes
- [ ] All test assertions pass in live Obsidian
- [ ] `README.md` created in every folder: `styles/`, each sub-module subfolder (`styles-preview/`, `styles-scroll/`, `styles-dropdown/`), and all `tests/` subfolders
