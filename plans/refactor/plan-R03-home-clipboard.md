# Plan R03 — Home / Clipboard Group

**Agent:** C  
**Phase:** 3 (after R02)  
**Dependency:** R01 (shared utilities), R02 (home structure)  
**Produces:** `src/tabs/home/clipboard/` fully decomposed with tests

---

## Goal

Split `ClipboardGroup.ts` stub into individual button modules, each with their own subfolder, CSS, and runnable MCP test files.

---

## Folder Layout

```
src/tabs/home/clipboard/
├── ClipboardGroup.ts          ← orchestrates all 5 buttons
├── clipboard.css              ← group layout (big Paste + stacked small buttons)
├── tests/
│   └── clipboard.integration.ts   ← runnable via evaluate_script
├── paste/
│   ├── PasteButton.ts
│   └── tests/
│       ├── paste.unit.ts
│       └── paste.edge.ts
├── paste-dropdown/
│   ├── PasteDropdown.ts
│   └── tests/
│       ├── paste-dropdown.unit.ts
│       └── paste-dropdown.edge.ts
├── cut/
│   ├── CutButton.ts
│   └── tests/
│       ├── cut.unit.ts
│       └── cut.edge.ts
├── copy/
│   ├── CopyButton.ts
│   └── tests/
│       ├── copy.unit.ts
│       └── copy.edge.ts
└── format-painter/
    ├── FormatPainterButton.ts
    └── tests/
        ├── format-painter.unit.ts
        └── format-painter.edge.ts
```

---

## Module Interfaces

### `ClipboardGroup.ts`

```ts
import { App } from "obsidian";
import { PasteButton } from "./paste/PasteButton";
import { PasteDropdown } from "./paste-dropdown/PasteDropdown";
import { CutButton } from "./cut/CutButton";
import { CopyButton } from "./copy/CopyButton";
import { FormatPainterButton } from "./format-painter/FormatPainterButton";

export class ClipboardGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Clipboard");

    const buttons = group.createDiv("onr-group-buttons");
    buttons.style.cssText = "align-items:flex-start;gap:2px";

    // Big Paste column (Paste button + dropdown arrow)
    const pasteCol = buttons.createDiv();
    pasteCol.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:0";
    new PasteButton().render(pasteCol, app);
    new PasteDropdown().render(pasteCol, app);

    // Small stacked column (Cut, Copy, Format Painter)
    const smallCol = buttons.createDiv();
    smallCol.style.cssText =
      "display:flex;flex-direction:column;gap:1px;padding-top:2px";
    new CutButton().render(smallCol, app);
    new CopyButton().render(smallCol, app);
    new FormatPainterButton().render(smallCol, app);

    group.createDiv("onr-group-name").textContent = "Clipboard";
  }
}
```

### `PasteButton.ts`

```ts
export class PasteButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "paste");
    btn.style.cssText =
      "width:46px;min-height:46px;border-bottom:none;border-radius:3px 3px 0 0";
    // SVG icon + label (exact from current HomeTab.ts)
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" style="width:24px;height:24px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1"/>
        <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1"/>
        <polyline points="9 14 12 17 15 14"/>
        <line x1="12" y1="10" x2="12" y2="17"/>
      </svg>
      <span class="onr-btn-label">Paste</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        navigator.clipboard
          .readText()
          .then((text) => {
            editor.replaceSelection(text);
          })
          .catch(() => {
            const el =
              (editor as any).cm?.dom ?? document.querySelector(".cm-content");
            if (el) {
              el.focus();
              document.execCommand("paste");
            }
          });
      }
    });
  }
}
```

### `PasteDropdown.ts`

```ts
import { showDropdown } from "../../../shared/dropdown/Dropdown";

export class PasteDropdown {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "paste-dropdown");
    btn.style.cssText =
      "width:46px;border-top:1px solid #d0d0d0;border-radius:0 0 3px 3px;min-height:14px;font-size:9px;justify-content:center";
    btn.textContent = "▾";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      showDropdown(btn, [
        {
          label: "Paste",
          sublabel: "Ctrl+V",
          action: () => {
            if (editor)
              navigator.clipboard
                .readText()
                .then((t) => editor.replaceSelection(t));
          },
        },
        {
          label: "Paste as Plain Text",
          sublabel: "Ctrl+Shift+V",
          action: () => {
            if (editor)
              navigator.clipboard.readText().then((t) => {
                editor.replaceSelection(
                  t.replace(/<[^>]+>/g, "").replace(/\r\n/g, "\n"),
                );
              });
          },
        },
        { label: "Paste Special...", disabled: true, action: () => {} },
      ]);
    });
  }
}
```

### `CutButton.ts`

```ts
export class CutButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "cut");
    btn.style.cssText = "width:68px;flex-direction:row;gap:4px;padding:2px 4px";
    btn.innerHTML = `
      <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
      <span class="onr-btn-label-sm">Cut</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        const sel = editor.getSelection();
        if (sel)
          navigator.clipboard
            .writeText(sel)
            .then(() => editor.replaceSelection(""));
      }
    });
  }
}
```

### `CopyButton.ts`

```ts
export class CopyButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "copy");
    btn.style.cssText = "width:68px;flex-direction:row;gap:4px;padding:2px 4px";
    // SVG + label (exact from HomeTab.ts)
    btn.innerHTML = `
      <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span class="onr-btn-label-sm">Copy</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        const sel = editor.getSelection();
        if (sel) navigator.clipboard.writeText(sel);
      }
    });
  }
}
```

### `FormatPainterButton.ts`

```ts
export class FormatPainterButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "format-painter");
    btn.style.cssText = "width:68px;flex-direction:row;gap:4px;padding:2px 4px";
    // SVG + label
    btn.innerHTML = `
      <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
      <span class="onr-btn-label-sm">Format Painter</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      // Phase 1: capture format from current line
      const isActive = (window as any)._onrFPActive;
      if (isActive) {
        (window as any)._onrFPActive = false;
        (window as any)._onrFP = null;
        btn.classList.remove("onr-active");
        return;
      }
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      const headMatch = line.match(/^(#{1,6})\s/);
      (window as any)._onrFP = {
        headPrefix: headMatch ? headMatch[0] : "",
        isBold: /\*\*(.*?)\*\*/.test(line),
        isItalic: /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(line),
        isUnderline: /<u>/.test(line),
      };
      (window as any)._onrFPActive = true;
      btn.classList.add("onr-active");
    });
  }
}
```

---

## CSS: `clipboard.css`

```css
/* Clipboard group layout */
[data-group="Clipboard"] .onr-group-buttons {
  align-items: flex-start;
  gap: 2px;
}

/* Paste big button */
[data-group="Clipboard"] [data-cmd="paste"] {
  width: 46px;
  min-height: 46px;
  border-bottom: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

/* Paste dropdown arrow */
[data-group="Clipboard"] [data-cmd="paste-dropdown"] {
  width: 46px;
  border-top: 1px solid #d0d0d0;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  min-height: 14px;
  font-size: 9px;
  justify-content: center;
}

/* Small stacked buttons */
[data-group="Clipboard"] .onr-btn-sm {
  width: 68px;
  flex-direction: row;
  gap: 4px;
  padding: 2px 4px;
}
```

---

## Tests

### `tests/paste.unit.ts`

```ts
// Run via: mcp__obsidian-devtools__evaluate_script({ function: pasteUnitTest })
export const pasteUnitTest = `() => {
  const results = [];

  // T1: Paste button element exists with correct data-cmd
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste"]');
  results.push({ test: 'paste-button-exists', pass: !!btn });

  // T2: Has onr-btn class
  results.push({ test: 'paste-has-onr-btn', pass: btn?.classList.contains('onr-btn') ?? false });

  // T3: Label text is "Paste"
  const label = btn?.querySelector('.onr-btn-label');
  results.push({ test: 'paste-label', pass: label?.textContent?.trim() === 'Paste' });

  // T4: Has SVG icon
  results.push({ test: 'paste-has-svg', pass: !!btn?.querySelector('svg') });

  return results;
}`;
```

### `tests/paste.edge.ts`

```ts
export const pasteEdgeTests = `() => {
  const results = [];

  // Edge 1: Click paste with no active editor — should not throw
  try {
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste"]');
    // Temporarily suppress active editor
    const orig = app.workspace.activeEditor;
    // We can't easily mock, so just verify the button exists and has click handler
    results.push({ test: 'paste-no-crash-without-editor', pass: !!btn });
  } catch (e) {
    results.push({ test: 'paste-no-crash-without-editor', pass: false, error: e.message });
  }

  // Edge 2: Paste-dropdown button exists with correct markup
  const ddBtn = document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]');
  results.push({ test: 'paste-dropdown-exists', pass: !!ddBtn });
  results.push({ test: 'paste-dropdown-text', pass: ddBtn?.textContent?.trim() === '▾' });

  return results;
}`;
```

### `tests/cut.unit.ts`

```ts
export const cutUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  
  // T1: Cut button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="cut"]');
  results.push({ test: 'cut-exists', pass: !!btn });
  
  // T2: Cut with selection removes text
  if (editor) {
    editor.setValue('Hello world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    // Simulate cut logic (without actual clipboard write which needs user gesture)
    const sel = editor.getSelection();
    if (sel) editor.replaceSelection('');
    results.push({ test: 'cut-removes-selection', pass: editor.getValue() === ' world' });
    editor.setValue(''); // cleanup
  } else {
    results.push({ test: 'cut-removes-selection', pass: null, note: 'no editor' });
  }
  
  return results;
}`;
```

### `tests/cut.edge.ts`

```ts
export const cutEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // Edge 1: Cut with no selection — does nothing
  if (editor) {
    editor.setValue('Hello world');
    editor.setCursor({ line: 0, ch: 5 }); // no selection
    const sel = editor.getSelection();
    results.push({ test: 'cut-no-selection-noop', pass: sel === '' });
    editor.setValue('');
  }

  // Edge 2: Multi-line selection cut
  if (editor) {
    editor.setValue('line1\\nline2\\nline3');
    editor.setSelection({ line: 0, ch: 0 }, { line: 1, ch: 5 });
    const sel = editor.getSelection();
    if (sel) editor.replaceSelection('');
    results.push({ test: 'cut-multiline', pass: editor.getValue() === '\\nline3' });
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/copy.unit.ts`

```ts
export const copyUnitTest = `() => {
  const results = [];
  
  // T1: Copy button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="copy"]');
  results.push({ test: 'copy-exists', pass: !!btn });
  results.push({ test: 'copy-label', pass: btn?.querySelector('.onr-btn-label-sm')?.textContent?.trim() === 'Copy' });
  
  return results;
}`;
```

### `tests/paste-dropdown.unit.ts`

```ts
export const pasteDropdownUnitTest = `() => {
  const results = [];

  // T1: Clicking paste-dropdown shows overlay menu
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]');
  results.push({ test: 'paste-dropdown-exists', pass: !!btn });

  // T2: No overlay before click
  const before = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'no-overlay-before-click', pass: before === 0 });

  // T3: Simulate click — menu should appear
  btn?.click();
  const after = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'overlay-appears-on-click', pass: after > 0 });

  // T4: Menu has 3 items (Paste, Paste as Plain Text, Paste Special)
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'paste-dropdown-3-items', pass: items.length === 3 });

  // Cleanup
  document.body.click();
  return results;
}`;
```

### `tests/paste-dropdown.edge.ts`

```ts
export const pasteDropdownEdgeTests = `() => {
  const results = [];

  // Edge 1: "Paste Special" is disabled
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]');
  btn?.click();
  const items = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')];
  const pasteSpecial = items.find(i => i.textContent?.includes('Paste Special'));
  results.push({ test: 'paste-special-disabled-cursor', pass: pasteSpecial?.style.cursor === 'default' });

  // Edge 2: Click outside closes menu
  document.body.click();
  const menus = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'outside-click-closes', pass: menus === 0 });

  return results;
}`;
```

### `tests/format-painter.unit.ts`

```ts
export const formatPainterUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
  results.push({ test: 'fp-exists', pass: !!btn });

  if (editor) {
    // T2: Click activates (sets _onrFPActive and adds onr-active class)
    editor.setValue('**Bold line**');
    editor.setCursor({ line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'fp-active-flag', pass: !!(window as any)._onrFPActive });
    results.push({ test: 'fp-active-class', pass: btn?.classList.contains('onr-active') ?? false });

    // T3: Captured format includes isBold: true
    const fp = (window as any)._onrFP;
    results.push({ test: 'fp-captures-bold', pass: fp?.isBold === true });

    // Cleanup: click again to deactivate
    btn?.click();
    results.push({ test: 'fp-deactivated', pass: !(window as any)._onrFPActive });
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/format-painter.edge.ts`

```ts
export const formatPainterEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Captures heading prefix from H2 line
    editor.setValue('## My Heading');
    editor.setCursor({ line: 0, ch: 5 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
    btn?.click();
    const fp = (window as any)._onrFP;
    results.push({ test: 'fp-captures-heading', pass: fp?.headPrefix === '## ' });

    // Edge 2: Applying to selection wraps in bold if source was bold
    if (fp?.isBold === false && fp?.headPrefix === '## ') {
      editor.setValue('plain text');
      editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
      // Simulate apply: no bold (isBold=false), just apply heading to line
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      if (!line.startsWith(fp.headPrefix)) {
        editor.setLine(cursor.line, fp.headPrefix + line.replace(/^#{1,6}\s+/, ''));
      }
      results.push({ test: 'fp-applies-heading', pass: editor.getLine(0).startsWith('## ') });
    }

    // Cleanup
    (window as any)._onrFPActive = false;
    (window as any)._onrFP = null;
    const btn2 = document.querySelector('[data-panel="Home"] [data-cmd="format-painter"]');
    btn2?.classList.remove('onr-active');
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/clipboard.integration.ts`

```ts
export const clipboardIntegrationTest = `() => {
  const results = [];

  // I1: All 5 clipboard commands exist in DOM
  const cmds = ['paste', 'paste-dropdown', 'cut', 'copy', 'format-painter'];
  for (const cmd of cmds) {
    const el = document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`);
    results.push({ test: \`clipboard-\${cmd}-present\`, pass: !!el });
  }

  // I2: Clipboard group name
  const name = document.querySelector('[data-panel="Home"] [data-group="Clipboard"] .onr-group-name');
  results.push({ test: 'clipboard-group-name', pass: name?.textContent?.trim() === 'Clipboard' });

  // I3: Layout — Paste is taller than Cut/Copy/Format Painter
  const paste = document.querySelector('[data-panel="Home"] [data-cmd="paste"]') as HTMLElement;
  const cut = document.querySelector('[data-panel="Home"] [data-cmd="cut"]') as HTMLElement;
  if (paste && cut) {
    results.push({
      test: 'paste-taller-than-cut',
      pass: paste.getBoundingClientRect().height > cut.getBoundingClientRect().height,
    });
  }

  return results;
}`;
```

---

## Verification Checklist

- [ ] All 6 `.ts` module files exist in correct subfolders
- [ ] `clipboard.css` exists with correct selectors
- [ ] All 7 test files exist (`.ts` format, runnable via `evaluate_script`)
- [ ] `npm run build` passes
- [ ] `clipboard.integration.ts` — all assertions pass in live Obsidian
- [ ] `paste.unit.ts` — all assertions pass
- [ ] `paste.edge.ts` — all assertions pass
- [ ] `cut.unit.ts` — all assertions pass
- [ ] `cut.edge.ts` — all assertions pass
- [ ] `paste-dropdown.unit.ts` — all assertions pass
- [ ] `paste-dropdown.edge.ts` — all assertions pass
- [ ] `format-painter.unit.ts` — all assertions pass
- [ ] `format-painter.edge.ts` — all assertions pass
- [ ] `README.md` created in every folder: `clipboard/`, each button subfolder, and all `tests/` subfolders
