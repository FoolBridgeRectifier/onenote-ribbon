# Plan R04 — Home / Basic Text Group

**Agent:** D  
**Phase:** 3 (parallel with R03, R05, R06, R07)  
**Dependency:** R01 (shared utilities), R02 (home structure)  
**Produces:** `src/tabs/home/basic-text/` fully decomposed with tests

---

## Goal

Decompose `BasicTextGroup.ts` into 14 individual button modules. Each button gets its own subfolder with a module file + unit test + edge test (where applicable). Tests are `.ts` files runnable via `mcp__obsidian-devtools__evaluate_script`.

---

## Folder Layout

```
src/tabs/home/basic-text/
├── BasicTextGroup.ts
├── basic-text.css
├── tests/
│   └── basic-text.integration.ts
├── bold/            ← BoldButton.ts + tests/bold.unit.ts + tests/bold.edge.ts
├── italic/          ← ItalicButton.ts + tests/
├── underline/       ← UnderlineButton.ts + tests/
├── strikethrough/   ← StrikethroughButton.ts + tests/
├── subscript/       ← SubscriptButton.ts + tests/ (edge: mutual exclusion with superscript)
├── superscript/     ← SuperscriptButton.ts + tests/
├── highlight/       ← HighlightButton.ts + highlight.css + tests/
├── font-color/      ← FontColorButton.ts + font-color.css + tests/
├── font-family/     ← FontFamilyPicker.ts + font-family.css + tests/
├── font-size/       ← FontSizePicker.ts + tests/
├── bullet-list/     ← BulletListButton.ts + tests/ (edge: strips full checklist prefix)
├── numbered-list/   ← NumberedListButton.ts + tests/
├── indent/          ← IndentButton.ts + tests/
├── outdent/         ← OutdentButton.ts + tests/
├── align/           ← AlignButton.ts + tests/ (edge: all 4 alignment options)
├── clear-formatting/ ← ClearFormattingButton.ts + tests/
└── clear-inline/    ← ClearInlineButton.ts + tests/
```

---

## `BasicTextGroup.ts` Orchestrator

```ts
import { App } from "obsidian";
import { BoldButton } from "./bold/BoldButton";
import { ItalicButton } from "./italic/ItalicButton";
import { UnderlineButton } from "./underline/UnderlineButton";
import { StrikethroughButton } from "./strikethrough/StrikethroughButton";
import { SubscriptButton } from "./subscript/SubscriptButton";
import { SuperscriptButton } from "./superscript/SuperscriptButton";
import { HighlightButton } from "./highlight/HighlightButton";
import { FontColorButton } from "./font-color/FontColorButton";
import { FontFamilyPicker } from "./font-family/FontFamilyPicker";
import { FontSizePicker } from "./font-size/FontSizePicker";
import { BulletListButton } from "./bullet-list/BulletListButton";
import { NumberedListButton } from "./numbered-list/NumberedListButton";
import { IndentButton } from "./indent/IndentButton";
import { OutdentButton } from "./outdent/OutdentButton";
import { AlignButton } from "./align/AlignButton";
import { ClearFormattingButton } from "./clear-formatting/ClearFormattingButton";
import { ClearInlineButton } from "./clear-inline/ClearInlineButton";

export class BasicTextGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Basic Text");

    const wrapper = group.createDiv();
    wrapper.style.cssText = "display:flex;flex-direction:column;gap:2px";

    // Row 1: font pickers + list buttons + indent/clear
    const row1 = wrapper.createDiv("onr-row");
    row1.style.cssText =
      "display:flex;align-items:center;gap:2px;padding:2px 0 0 0";
    new FontFamilyPicker().render(row1, app);
    new FontSizePicker().render(row1, app);
    new BulletListButton().render(row1, app);
    new NumberedListButton().render(row1, app);
    new OutdentButton().render(row1, app);
    new IndentButton().render(row1, app);
    new ClearFormattingButton().render(row1, app);

    // Row 2: inline formatting + color + align
    const row2 = wrapper.createDiv("onr-row");
    row2.style.cssText = "display:flex;align-items:center;gap:2px";
    new BoldButton().render(row2, app);
    new ItalicButton().render(row2, app);
    new UnderlineButton().render(row2, app);
    new StrikethroughButton().render(row2, app);
    new SubscriptButton().render(row2, app);
    new SuperscriptButton().render(row2, app);

    // Divider
    const div1 = row2.createDiv();
    div1.style.cssText =
      "width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0";

    new HighlightButton().render(row2, app);
    new FontColorButton().render(row2, app);

    // Divider
    const div2 = row2.createDiv();
    div2.style.cssText =
      "width:1px;height:18px;background:#d0d0d0;margin:0 1px;flex-shrink:0";

    new AlignButton().render(row2, app);
    new ClearInlineButton().render(row2, app);

    group.createDiv("onr-group-name").textContent = "Basic Text";
  }
}
```

---

## Individual Button Modules

Each follows this pattern (shown for Bold; all others identical in structure):

### `bold/BoldButton.ts`

```ts
import { App } from "obsidian";
import { toggleInline } from "../../../shared/toggleInline";

export class BoldButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "bold");
    btn.style.cssText =
      "min-height:22px;width:22px;font-weight:700;font-size:13px";
    btn.textContent = "B";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleInline(editor, "**");
    });
  }
}
```

### `italic/ItalicButton.ts`

Same pattern, wraps `*`, label `I`, font-style italic.

### `underline/UnderlineButton.ts`

Same pattern, wraps `<u>` / `</u>`, label `U`, text-decoration underline.

### `strikethrough/StrikethroughButton.ts`

Same pattern, wraps `~~`, label `<s>ab</s>`.

### `subscript/SubscriptButton.ts`

Uses `toggleSubSup(editor, 'sub')` from shared.

### `superscript/SuperscriptButton.ts`

Uses `toggleSubSup(editor, 'sup')` from shared.

### `highlight/HighlightButton.ts`

Uses `toggleInline(editor, '==')`. Has a yellow swatch div below the icon (`id="onr-highlight-swatch"`).

### `font-color/FontColorButton.ts`

Opens color dropdown via `showDropdown`. Has a color swatch div (`id="onr-color-swatch"`).

### `font-family/FontFamilyPicker.ts`

Opens font-family dropdown. Has `id="onr-font-label"` span showing current font.

### `font-size/FontSizePicker.ts`

Opens size dropdown. Has `id="onr-size-label"` span showing current size.

### `bullet-list/BulletListButton.ts`

Uses `toggleLinePrefix(editor, '- ')` from shared.

### `numbered-list/NumberedListButton.ts`

Uses `toggleLinePrefix(editor, '1. ')` from shared.

### `indent/IndentButton.ts`

Calls `app.commands.executeCommandById('editor:indent-list')`.

### `outdent/OutdentButton.ts`

Calls `app.commands.executeCommandById('editor:unindent-list')`.

### `align/AlignButton.ts`

Uses `showDropdown` with 4 alignment options (Left, Center, Right, Justify).

### `clear-formatting/ClearFormattingButton.ts`

Strips `#` headings + all inline marks from selection or current line.

### `clear-inline/ClearInlineButton.ts`

Strips inline marks only (preserves heading prefix).

---

## CSS: `basic-text.css`

```css
/* Basic Text Group — Row Layout */
[data-group="Basic Text"] .onr-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Font pickers */
[data-group="Basic Text"] .onr-font-picker {
  flex-direction: row;
  gap: 2px;
  min-height: 22px;
  padding: 1px 4px;
  border: 1px solid var(--btn-hover-border);
  cursor: pointer;
}

[data-group="Basic Text"] [data-cmd="font-family"] {
  width: 96px;
}

[data-group="Basic Text"] [data-cmd="font-size"] {
  width: 34px;
}

/* Highlight swatch */
#onr-highlight-swatch {
  width: 14px;
  height: 3px;
  background: #ffff00;
  border: 1px solid #ccc;
  margin-top: 1px;
}

/* Color swatch */
#onr-color-swatch {
  width: 14px;
  height: 3px;
  background: #ff0000;
  border: 1px solid #ccc;
  margin-top: 1px;
}

/* Inline formatting buttons */
[data-group="Basic Text"] [data-cmd="bold"],
[data-group="Basic Text"] [data-cmd="italic"],
[data-group="Basic Text"] [data-cmd="underline"],
[data-group="Basic Text"] [data-cmd="strikethrough"],
[data-group="Basic Text"] [data-cmd="subscript"],
[data-group="Basic Text"] [data-cmd="superscript"],
[data-group="Basic Text"] [data-cmd="clear-inline"] {
  min-height: 22px;
  width: 22px;
}

[data-group="Basic Text"] [data-cmd="bullet-list"],
[data-group="Basic Text"] [data-cmd="numbered-list"],
[data-group="Basic Text"] [data-cmd="outdent"],
[data-group="Basic Text"] [data-cmd="indent"],
[data-group="Basic Text"] [data-cmd="clear-formatting"] {
  min-height: 22px;
  width: 22px;
}
```

---

## Tests

### `tests/bold.unit.ts`

```ts
export const boldUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Bold button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="bold"]');
  results.push({ test: 'bold-exists', pass: !!btn });

  if (editor) {
    // T2: Toggle bold on selection
    editor.setValue('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    btn?.click();
    results.push({ test: 'bold-wraps-selection', pass: editor.getValue() === '**hello**' });

    // T3: Toggle bold off
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    btn?.click();
    results.push({ test: 'bold-unwraps-selection', pass: editor.getValue() === 'hello' });

    // T4: No selection — inserts ** ** at cursor
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bold-inserts-pair', pass: editor.getValue() === '****' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/bold.edge.ts`

```ts
export const boldEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Bold inside italic — wraps correctly
    editor.setValue('*text*');
    editor.setSelection({ line: 0, ch: 1 }, { line: 0, ch: 5 });
    const sel = editor.getSelection();
    editor.replaceSelection('**' + sel + '**');
    results.push({ test: 'bold-inside-italic', pass: editor.getValue() === '*****text*****' || editor.getValue().includes('**text**') });

    // Edge 2: Active state — bold button has onr-active when cursor on bold line
    editor.setValue('**bold line**');
    editor.setCursor({ line: 0, ch: 5 });
    // Trigger state update
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="bold"]');
    results.push({ test: 'bold-active-state-on-bold-line', pass: btn?.classList.contains('onr-active') ?? false });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/subscript.edge.ts` (mutual exclusion key edge case)

```ts
export const subscriptEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: cursor inside <sup> then click subscript → converts to <sub>
    editor.setValue('x<sup>2</sup>');
    editor.setCursor({ line: 0, ch: 7 }); // inside <sup>
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="subscript"]');
    btn?.click();
    results.push({ test: 'sub-converts-sup', pass: editor.getValue() === 'x<sub>2</sub>' });

    // Edge: cursor outside any span → inserts <sub></sub>
    editor.setValue('H2O');
    editor.setCursor({ line: 0, ch: 3 });
    btn?.click();
    results.push({ test: 'sub-inserts-at-cursor', pass: editor.getValue() === 'H2O<sub></sub>' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/bullet-list.edge.ts` (strips full checklist prefix — key bug fix)

```ts
export const bulletListEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Toggle bullet off on a checked checkbox — strips "- [x] " not just "- "
    editor.setValue('- [x] Hello');
    editor.setCursor({ line: 0, ch: 0 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="bullet-list"]');
    btn?.click();
    results.push({ test: 'bullet-strips-full-checklist-prefix', pass: editor.getValue() === 'Hello' });

    // Edge 2: Toggle bullet off on "- [✔] " variant
    editor.setValue('- [✔] Task done');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bullet-strips-checkmark-variant', pass: editor.getValue() === 'Task done' });

    // Edge 3: Toggle bullet on a heading line strips heading
    editor.setValue('# My Heading');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'bullet-replaces-heading', pass: editor.getValue() === '- My Heading' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/align.unit.ts`

```ts
export const alignUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  // T1: Align button exists
  const btn = document.querySelector('[data-panel="Home"] [data-cmd="align"]');
  results.push({ test: 'align-exists', pass: !!btn });

  // T2: Click opens dropdown with 4 options
  btn?.click();
  const items = document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item');
  results.push({ test: 'align-4-options', pass: items.length === 4 });

  // T3: Correct labels
  const labels = [...items].map(i => i.textContent?.trim().replace(/\\s+/g, ' '));
  results.push({ test: 'align-has-left', pass: labels.some(l => l?.includes('Left')) });
  results.push({ test: 'align-has-center', pass: labels.some(l => l?.includes('Center')) });

  // Cleanup
  document.body.click();
  return results;
}`;
```

### `tests/align.edge.ts`

```ts
export const alignEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Align Left wraps selection in div with text-align:left
    editor.setValue('My paragraph');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="align"]');
    btn?.click();
    const leftItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.includes('Left'));
    leftItem?.click();
    results.push({ test: 'align-left-wraps-div', pass: editor.getValue().includes('text-align:left') });

    // Edge 2: Align with no selection wraps current line
    editor.setValue('single line');
    editor.setCursor({ line: 0, ch: 5 });
    btn?.click();
    const centerItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.includes('Center'));
    centerItem?.click();
    results.push({ test: 'align-center-wraps-line', pass: editor.getValue().includes('text-align:center') });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/font-family.edge.ts`

```ts
export const fontFamilyEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: With selection → wraps in <span style="font-family:...">
    editor.setValue('Hello world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    const btn = document.querySelector('[data-panel="Home"] [data-cmd="font-family"]');
    btn?.click();
    const arialItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Arial');
    arialItem?.click();
    results.push({ test: 'font-family-wraps-selection', pass: editor.getValue().includes('<span style="font-family:Arial">Hello</span>') });

    // Edge 2: Without selection → updates vault config
    editor.setValue('no selection');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const verdanaItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
      .find(i => i.textContent?.trim() === 'Verdana');
    verdanaItem?.click();
    const config = (app.vault as any).getConfig?.('fontText');
    results.push({ test: 'font-family-sets-vault-config', pass: config === 'Verdana' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/basic-text.integration.ts`

```ts
export const basicTextIntegrationTest = `() => {
  const results = [];

  // I1: All buttons in row 1 present
  const row1Cmds = ['font-family', 'font-size', 'bullet-list', 'numbered-list', 'outdent', 'indent', 'clear-formatting'];
  for (const cmd of row1Cmds) {
    const el = document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`);
    results.push({ test: \`r1-\${cmd}\`, pass: !!el });
  }

  // I2: All buttons in row 2 present
  const row2Cmds = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'highlight', 'font-color', 'align', 'clear-inline'];
  for (const cmd of row2Cmds) {
    const el = document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`);
    results.push({ test: \`r2-\${cmd}\`, pass: !!el });
  }

  // I3: Group name
  const name = document.querySelector('[data-panel="Home"] [data-group="Basic Text"] .onr-group-name');
  results.push({ test: 'basic-text-group-name', pass: name?.textContent?.trim() === 'Basic Text' });

  // I4: Two rows exist
  const rows = document.querySelectorAll('[data-panel="Home"] [data-group="Basic Text"] .onr-row');
  results.push({ test: 'basic-text-two-rows', pass: rows.length === 2 });

  // I5: Highlight swatch present
  results.push({ test: 'highlight-swatch-present', pass: !!document.getElementById('onr-highlight-swatch') });

  // I6: Color swatch present
  results.push({ test: 'color-swatch-present', pass: !!document.getElementById('onr-color-swatch') });

  return results;
}`;
```

---

## Verification Checklist

- [ ] All 17 button module files created in correct subfolders
- [ ] `basic-text.css` exists with scoped selectors
- [ ] All test files exist as `.ts` (not `.md`)
- [ ] `npm run build` passes with zero errors
- [ ] `basic-text.integration.ts` — all assertions pass in live Obsidian
- [ ] `bold.unit.ts` / `bold.edge.ts` pass
- [ ] `subscript.edge.ts` passes (mutual exclusion test)
- [ ] `bullet-list.edge.ts` passes (full checklist prefix strip)
- [ ] `align.unit.ts` + `align.edge.ts` pass
- [ ] `font-family.edge.ts` passes (selection vs vault config)
- [ ] `README.md` created in every folder: `basic-text/`, each button subfolder, and all `tests/` subfolders
