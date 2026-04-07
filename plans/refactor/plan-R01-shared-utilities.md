# Plan R01 — Shared Utilities

**Agent:** A  
**Phase:** 1 (runs first, no dependencies)  
**Produces:** `src/shared/` with 4 extracted utilities + tests

---

## Goal

Extract the four pure-logic helper functions currently embedded in `HomeTab.ts` into `src/shared/`. These are used by multiple button modules and must not be duplicated.

## Functions to extract

| Function                             | Current location | Target                            |
| ------------------------------------ | ---------------- | --------------------------------- |
| `showDropdown(anchor, items, opts)`  | `HomeTab.ts:305` | `src/shared/dropdown/Dropdown.ts` |
| `toggleInline(editor, open, close?)` | `HomeTab.ts:580` | `src/shared/toggleInline.ts`      |
| `toggleSubSup(editor, tag)`          | `HomeTab.ts:598` | `src/shared/toggleSubSup.ts`      |
| `toggleLinePrefix(editor, prefix)`   | `HomeTab.ts:663` | `src/shared/toggleLinePrefix.ts`  |

---

## Files to create

### `src/shared/dropdown/Dropdown.ts`

Extract `showDropdown` verbatim. Export as named export. Also extract the `DropdownItem` and `DropdownOpts` interfaces.

```ts
export interface DropdownItem {
  label: string;
  sublabel?: string;
  style?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownOpts {
  bg?: string;
  hoverBg?: string;
  color?: string;
}

export function showDropdown(
  anchor: HTMLElement,
  items: DropdownItem[],
  opts?: DropdownOpts,
): void {
  // ... exact copy of current implementation ...
}
```

### `src/shared/dropdown/dropdown.css`

All styles for `.onr-overlay-dropdown` and `.onr-dd-item` that are currently inline in the JS (inline styles in `showDropdown`). Keep inline for now — CSS file is a placeholder for future extraction.

```css
/* Dropdown overlay — styles are currently applied inline in Dropdown.ts */
/* Future: migrate inline styles to these classes */
.onr-overlay-dropdown {
  /* reference only */
}
.onr-dd-item {
  /* reference only */
}
```

### `src/shared/toggleInline.ts`

```ts
export function toggleInline(editor: any, open: string, close?: string): void {
  // ... exact copy ...
}
```

### `src/shared/toggleSubSup.ts`

```ts
export function toggleSubSup(editor: any, tag: "sub" | "sup"): void {
  // ... exact copy ...
}
```

### `src/shared/toggleLinePrefix.ts`

```ts
export function toggleLinePrefix(editor: any, prefix: string): void {
  // ... exact copy including the checklist variant logic (- [x], - [X], - [✔]) ...
}
```

---

## Tests

### `src/shared/dropdown/tests/dropdown.unit.ts`

```ts
export const dropdownUnitTest = `() => {
  const results = [];

  // T1: Dropdown renders on anchor
  const anchor = document.createElement('div');
  anchor.style.cssText = 'position:fixed;top:100px;left:100px;width:80px;height:24px';
  document.body.appendChild(anchor);
  const items = [{ label: 'Option A', action: () => {} }, { label: 'Option B', action: () => {} }];
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchor, items);
  const el = document.querySelector('.onr-overlay-dropdown');
  results.push({ test: 'dropdown-renders-on-anchor', pass: !!el });
  anchor.remove();

  // T2: Correct item count inside menu
  const menu = document.querySelector('.onr-overlay-dropdown');
  const itemCount = menu?.querySelectorAll('.onr-dd-item').length ?? 0;
  results.push({ test: 'dropdown-item-count', pass: itemCount === 2 });

  // T3: Outside click closes dropdown
  document.body.click();
  const afterClose = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'outside-click-closes', pass: afterClose === 0 });

  return results;
}`;
```

### `src/shared/dropdown/tests/dropdown.edge.ts`

```ts
export const dropdownEdgeTests = `() => {
  const results = [];

  // Edge 1: >15 items — max-height + overflow-y:auto
  const anchor1 = document.createElement('div');
  anchor1.style.cssText = 'position:fixed;top:100px;left:100px;width:80px;height:24px';
  document.body.appendChild(anchor1);
  const manyItems = Array.from({length: 16}, (_, i) => ({ label: \`Option \${i}\`, action: () => {} }));
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchor1, manyItems);
  const menu1 = document.querySelector('.onr-overlay-dropdown') as HTMLElement;
  if (menu1) {
    results.push({ test: 'scroll-max-height-on-16-items', pass: !!menu1.style.maxHeight && parseInt(menu1.style.maxHeight) > 0 });
    results.push({ test: 'scroll-overflow-y-auto', pass: menu1.style.overflowY === 'auto' || getComputedStyle(menu1).overflowY === 'auto' });
    menu1.remove();
  } else {
    results.push({ test: 'scroll-max-height-on-16-items', pass: null, note: 'no dropdown rendered — expose _testShowDropdown on plugin instance' });
    results.push({ test: 'scroll-overflow-y-auto', pass: null });
  }
  anchor1.remove();

  // Edge 2: Viewport clamp — anchor near bottom of screen, dropdown flips above
  const anchorBottom = document.createElement('div');
  anchorBottom.style.cssText = \`position:fixed;top:\${window.innerHeight - 10}px;left:100px;width:80px;height:24px\`;
  document.body.appendChild(anchorBottom);
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchorBottom, [{ label: 'A', action: () => {} }]);
  const menu2 = document.querySelector('.onr-overlay-dropdown') as HTMLElement;
  if (menu2) {
    const menuRect = menu2.getBoundingClientRect();
    const anchorRect = anchorBottom.getBoundingClientRect();
    results.push({ test: 'viewport-clamp-flips-above-anchor', pass: menuRect.bottom <= anchorRect.top + 2 });
    menu2.remove();
  } else {
    results.push({ test: 'viewport-clamp-flips-above-anchor', pass: null });
  }
  anchorBottom.remove();

  // Edge 3: Disabled item — cursor:default, click does not fire action
  let disabledFired = false;
  const anchor3 = document.createElement('div');
  anchor3.style.cssText = 'position:fixed;top:100px;left:200px;width:80px;height:24px';
  document.body.appendChild(anchor3);
  app.plugins.plugins['onenote-ribbon']._testShowDropdown?.(anchor3, [
    { label: 'Enabled', action: () => {} },
    { label: 'Disabled', disabled: true, action: () => { disabledFired = true; } },
  ]);
  const menu3 = document.querySelector('.onr-overlay-dropdown');
  const disabledItem = menu3?.querySelectorAll('.onr-dd-item')[1] as HTMLElement;
  if (disabledItem) {
    results.push({ test: 'disabled-item-cursor-default', pass: disabledItem.style.cursor === 'default' || getComputedStyle(disabledItem).cursor === 'default' });
    disabledItem.click();
    results.push({ test: 'disabled-item-no-action-fired', pass: !disabledFired });
    menu3?.remove();
  } else {
    results.push({ test: 'disabled-item-cursor-default', pass: null });
    results.push({ test: 'disabled-item-no-action-fired', pass: null });
  }
  anchor3.remove();

  return results;
}`;
```

---

### `src/shared/tests/toggleInline.unit.ts`

```ts
export const toggleInlineUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Wraps selection in bold
  editor.setValue('hello world');
  editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
  const sel1 = editor.getSelection();
  if (sel1) editor.replaceSelection(\`**\${sel1}**\`);
  results.push({ test: 'wraps-selection-in-bold', pass: editor.getValue() === '**hello** world' });

  // T2: Unwraps existing bold
  editor.setValue('**hello** world');
  editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
  const sel2 = editor.getSelection();
  if (sel2.startsWith('**') && sel2.endsWith('**')) editor.replaceSelection(sel2.slice(2, -2));
  results.push({ test: 'unwraps-existing-bold', pass: editor.getValue() === 'hello world' });

  // T3: No selection inserts pair at cursor
  editor.setValue('hello');
  editor.setCursor({ line: 0, ch: 5 });
  editor.replaceRange('====', { line: 0, ch: 5 });
  editor.setCursor({ line: 0, ch: 7 });
  results.push({ test: 'no-selection-inserts-pair', pass: editor.getValue() === 'hello====' });

  // Cleanup
  editor.setValue('');
  return results;
}`;
```

### `src/shared/tests/toggleSubSup.unit.ts`

```ts
export const toggleSubSupUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Insert sub tags at cursor
  editor.setValue('H2O');
  editor.setCursor({ line: 0, ch: 3 });
  editor.replaceRange('<sub></sub>', { line: 0, ch: 3 });
  editor.setCursor({ line: 0, ch: 8 });
  results.push({ test: 'inserts-sub-at-cursor', pass: editor.getValue() === 'H2O<sub></sub>' });

  // T2: Toggle off — cursor inside <sub> strips tags
  editor.setValue('H<sub>2</sub>O');
  editor.setCursor({ line: 0, ch: 7 });
  const line2 = editor.getLine(0);
  const ch2 = 7;
  const o2 = line2.indexOf('<sub>');
  const c2 = line2.indexOf('</sub>', o2 + 5);
  if (ch2 > o2 + 4 && ch2 < c2 + 6) {
    const inner2 = line2.slice(o2 + 5, c2);
    editor.setLine(0, line2.slice(0, o2) + inner2 + line2.slice(c2 + 6));
  }
  results.push({ test: 'toggle-off-strips-sub-tags', pass: editor.getValue() === 'H2O' });

  // T3: Mutually exclusive — <sub> converts to <sup>
  editor.setValue('x<sub>2</sub>');
  editor.setCursor({ line: 0, ch: 7 });
  const line3 = editor.getLine(0);
  const o3 = line3.indexOf('<sub>');
  const c3 = line3.indexOf('</sub>', o3 + 5);
  const inner3 = line3.slice(o3 + 5, c3);
  editor.setLine(0, line3.slice(0, o3) + '<sup>' + inner3 + '</sup>' + line3.slice(c3 + 6));
  results.push({ test: 'sub-converts-to-sup', pass: editor.getValue() === 'x<sup>2</sup>' });

  editor.setValue('');
  return results;
}`;
```

### `src/shared/tests/toggleLinePrefix.unit.ts`

```ts
export const toggleLinePrefixUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // T1: Adds bullet prefix to plain line
  editor.setValue('Hello world');
  editor.setCursor({ line: 0, ch: 0 });
  const line1 = editor.getLine(0);
  if (!line1.startsWith('- ')) editor.setLine(0, '- ' + line1);
  results.push({ test: 'adds-bullet-to-plain-line', pass: editor.getValue() === '- Hello world' });

  // T2: Removes bullet prefix
  editor.setValue('- Hello world');
  editor.setCursor({ line: 0, ch: 0 });
  const line2 = editor.getLine(0);
  if (line2.startsWith('- ')) editor.setLine(0, line2.slice(2));
  results.push({ test: 'removes-bullet-prefix', pass: editor.getValue() === 'Hello world' });

  // T3: Checklist variant strips full prefix when toggling bullet
  editor.setValue('- [x] Hello world');
  editor.setCursor({ line: 0, ch: 0 });
  const line3 = editor.getLine(0);
  const checklistVariants = ['- [ ] ', '- [x] ', '- [X] ', '- [✔] '];
  let stripped3 = line3;
  for (const v of checklistVariants) {
    if (line3.startsWith(v)) { stripped3 = line3.slice(v.length); break; }
  }
  editor.setLine(0, stripped3);
  results.push({ test: 'strips-full-checklist-prefix', pass: editor.getValue() === 'Hello world' });

  // T4: Prefix replaces existing heading
  editor.setValue('# Heading');
  editor.setCursor({ line: 0, ch: 0 });
  const line4 = editor.getLine(0);
  const stripped4 = line4.replace(/^(#{1,6} |- \[[ x✔]\] (?:🔴 |🟡 )?|- |\d+\. |> \[![^\]]+\]\n> )/, '');
  editor.setLine(0, '- ' + stripped4);
  results.push({ test: 'replaces-heading-with-bullet', pass: editor.getValue() === '- Heading' });

  editor.setValue('');
  return results;
}`;
```

---

## Integration with HomeTab

After creating `src/shared/`, update `HomeTab.ts` import block:

```ts
import { showDropdown } from "../shared/dropdown/Dropdown";
import { toggleInline } from "../shared/toggleInline";
import { toggleSubSup } from "../shared/toggleSubSup";
import { toggleLinePrefix } from "../shared/toggleLinePrefix";
```

Remove the local function definitions. Verify build passes: `npm run build`.

## Verification Checklist

- [ ] `src/shared/dropdown/Dropdown.ts` exists and exports `showDropdown`, `DropdownItem`, `DropdownOpts`
- [ ] `src/shared/toggleInline.ts` exists and exports `toggleInline`
- [ ] `src/shared/toggleSubSup.ts` exists and exports `toggleSubSup`
- [ ] `src/shared/toggleLinePrefix.ts` exists and exports `toggleLinePrefix`
- [ ] `HomeTab.ts` imports from `../shared/` — no local duplicates remain
- [ ] `npm run build` succeeds with zero errors
- [ ] Obsidian reload: all existing Home tab checks from `plan-03-home-tab.md` still pass
- [ ] All unit test `.ts` files written for each utility — all assertions pass in live Obsidian
- [ ] `README.md` created in every folder: `src/shared/`, `src/shared/dropdown/`, `src/shared/dropdown/tests/`, `src/shared/tests/`
