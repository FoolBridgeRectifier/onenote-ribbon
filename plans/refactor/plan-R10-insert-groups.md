# Plan R10 — Insert Tab Group Decomposition

**Agent:** J  
**Phase:** 3 (after R09)  
**Dependency:** R01 (shared utilities), R09 (insert structure)  
**Produces:** All 8 insert group subfolders fully decomposed with tests

---

## Folder Layout

```
src/tabs/insert/
├── blank-line/
│   ├── BlankLineButton.ts
│   └── tests/
│       └── blank-line.unit.ts
├── tables/
│   ├── TablesGroup.ts
│   ├── tests/
│   │   └── tables.integration.ts
│   └── insert-table/
│       ├── InsertTableButton.ts
│       └── tests/
│           ├── insert-table.unit.ts
│           └── insert-table.edge.ts
├── files/
│   ├── FilesGroup.ts
│   ├── tests/
│   │   └── files.integration.ts
│   ├── attach-file/
│   │   ├── AttachFileButton.ts
│   │   └── tests/
│   │       └── attach-file.unit.ts
│   └── embed-note/
│       ├── EmbedNoteButton.ts
│       └── tests/
│           └── embed-note.unit.ts
├── images/
│   ├── ImagesGroup.ts
│   ├── tests/
│   │   └── images.integration.ts
│   ├── insert-image/
│   │   ├── InsertImageButton.ts
│   │   └── tests/
│   │       └── insert-image.unit.ts
│   └── insert-video/
│       ├── InsertVideoButton.ts
│       └── tests/
│           └── insert-video.unit.ts
├── links/
│   ├── LinksGroup.ts
│   ├── tests/
│   │   └── links.integration.ts
│   ├── insert-link/
│   │   ├── InsertLinkButton.ts
│   │   └── tests/
│   │       ├── insert-link.unit.ts
│   │       └── insert-link.edge.ts
│   └── insert-wikilink/
│       ├── InsertWikilinkButton.ts
│       └── tests/
│           └── insert-wikilink.unit.ts
├── timestamp/
│   ├── TimestampGroup.ts
│   ├── tests/
│   │   └── timestamp.integration.ts
│   ├── insert-date/
│   │   ├── InsertDateButton.ts
│   │   └── tests/
│   │       ├── insert-date.unit.ts
│   │       └── insert-date.edge.ts
│   ├── insert-time/
│   │   ├── InsertTimeButton.ts
│   │   └── tests/
│   │       └── insert-time.unit.ts
│   └── insert-datetime/
│       ├── InsertDatetimeButton.ts
│       └── tests/
│           └── insert-datetime.unit.ts
├── blocks/
│   ├── BlocksGroup.ts
│   ├── tests/
│   │   └── blocks.integration.ts
│   ├── insert-template/
│   │   ├── InsertTemplateButton.ts
│   │   └── tests/
│   │       ├── insert-template.unit.ts
│   │       └── insert-template.edge.ts
│   ├── insert-callout/
│   │   ├── InsertCalloutButton.ts
│   │   ├── callout-picker/
│   │   │   ├── CalloutPicker.ts
│   │   │   ├── callout-picker.css
│   │   │   └── tests/
│   │   │       ├── callout-picker.unit.ts
│   │   │       └── callout-picker.edge.ts
│   │   └── tests/
│   │       └── insert-callout.unit.ts
│   └── insert-code-block/
│       ├── InsertCodeBlockButton.ts
│       └── tests/
│           ├── insert-code-block.unit.ts
│           └── insert-code-block.edge.ts
└── symbols/
    ├── SymbolsGroup.ts
    ├── tests/
    │   └── symbols.integration.ts
    ├── insert-math/
    │   ├── InsertMathButton.ts
    │   └── tests/
    │       └── insert-math.unit.ts
    ├── insert-hr/
    │   ├── InsertHrButton.ts
    │   └── tests/
    │       └── insert-hr.unit.ts
    ├── insert-footnote/
    │   ├── InsertFootnoteButton.ts
    │   └── tests/
    │       ├── insert-footnote.unit.ts
    │       └── insert-footnote.edge.ts
    └── insert-tag/
        ├── InsertTagButton.ts
        └── tests/
            └── insert-tag.unit.ts
```

---

## Module Implementations

### `BlankLineButton.ts`

```ts
export class BlankLineButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "blank-line");
    btn.innerHTML = `<svg class="onr-icon" viewBox="0 0 24 24" ...><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span class="onr-btn-label">Blank Line</span>`;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", () => {
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        const cursor = editor.getCursor();
        editor.replaceRange("\n", cursor);
      }
    });
  }
}
```

### `InsertTableButton.ts`

Exact logic from current InsertTab.ts `insert-table` case.

### `AttachFileButton.ts` / `EmbedNoteButton.ts`

Both insert `![[]]` at cursor and position cursor at ch+3.

### `InsertImageButton.ts`

Inserts `![[]]`, cursor at ch+3.

### `InsertVideoButton.ts`

Inserts `\n<iframe src="" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n`.

### `InsertLinkButton.ts`

With selection: wraps `[sel]()` cursor before closing paren. Without: inserts `[]()` cursor after `[`.

### `InsertWikilinkButton.ts`

Inserts `[[]]` cursor at ch+2.

### `InsertDateButton.ts` / `InsertTimeButton.ts` / `InsertDatetimeButton.ts`

Use moment if available, fallback to native Date. Same logic as current InsertTab.ts.

### `InsertTemplateButton.ts`

Calls `app.commands.executeCommandById('insert-template')`. If undefined: `new Notice(...)`.

### `InsertCalloutButton.ts` + `CalloutPicker.ts`

Extract `showCalloutPicker` from current InsertTab.ts. Move into `CalloutPicker.ts` as a class with `show(anchor, editor)` method.

```ts
// callout-picker/CalloutPicker.ts
const CALLOUT_TYPES = [
  "note",
  "abstract",
  "info",
  "tip",
  "success",
  "question",
  "warning",
  "failure",
  "danger",
  "bug",
  "example",
  "quote",
];

export class CalloutPicker {
  static show(anchor: HTMLElement, editor: any): void {
    document.querySelector(".onr-callout-picker")?.remove();
    const picker = document.createElement("div");
    picker.className = "onr-callout-picker";
    // ... exact styles ...
    CALLOUT_TYPES.forEach((type) => {
      const btn = document.createElement("div");
      // ... styling + click handler inserts `> [!${type}]\n> ` ...
      picker.appendChild(btn);
    });
    // Position below anchor, append to body, outside-click-close
  }
}
```

### `InsertCodeBlockButton.ts`

Inserts ` ```\n\n``` `, cursor at line+1, ch=0.

### `InsertMathButton.ts`

Inserts `$$\n\n$$`, cursor at line+1, ch=0.

### `InsertHrButton.ts`

Inserts `\n---\n`.

### `InsertFootnoteButton.ts`

Inserts `[^1]` at cursor, appends `\n[^1]: ` at last line of note.

### `InsertTagButton.ts`

Inserts `#` at cursor, positions cursor at ch+1.

---

## Tests

### `tests/blank-line.unit.ts`

```ts
export const blankLineUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="blank-line"]');
  results.push({ test: 'blank-line-exists', pass: !!btn });

  if (editor) {
    editor.setValue('Line one');
    editor.setCursor({ line: 0, ch: 8 });
    btn?.click();
    results.push({ test: 'blank-line-inserts-newline', pass: editor.getValue() === 'Line one\\n' });
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-table.unit.ts`

```ts
export const insertTableUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]');
  results.push({ test: 'insert-table-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'table-has-header-row', pass: val.includes('| col | col | col |') });
    results.push({ test: 'table-has-separator', pass: val.includes('|---|---|---|') });
    results.push({ test: 'table-has-data-row', pass: val.includes('| | | |') });
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-table.edge.ts`

```ts
export const insertTableEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Insert table mid-line — table inserted after cursor
    editor.setValue('Some text');
    editor.setCursor({ line: 0, ch: 4 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]')?.click();
    results.push({ test: 'table-mid-line', pass: editor.getValue().includes('Some') && editor.getValue().includes('| col |') });

    // Edge 2: Empty file — table inserted
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-table"]')?.click();
    results.push({ test: 'table-empty-file', pass: editor.getValue().includes('col') });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-link.unit.ts`

```ts
export const insertLinkUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-link"]');
  results.push({ test: 'insert-link-exists', pass: !!btn });

  if (editor) {
    // With selection
    editor.setValue('my link text');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });
    btn?.click();
    results.push({ test: 'link-wraps-selection', pass: editor.getValue() === '[my link text]()' });

    // Without selection
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    results.push({ test: 'link-inserts-template', pass: editor.getValue() === '[]()' });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-link.edge.ts`

```ts
export const insertLinkEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: cursor positioned correctly after insertion
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-link"]')?.click();
    // Cursor should be at ch=1 (inside the brackets [|])
    const cursor = editor.getCursor();
    results.push({ test: 'link-cursor-inside-brackets', pass: cursor.ch === 1 });

    // Edge: with selection, cursor at end before closing paren
    editor.setValue('Selected');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-link"]')?.click();
    const cursor2 = editor.getCursor();
    // cursor should be just before ) in [Selected]()
    results.push({ test: 'link-cursor-before-close-paren', pass: cursor2.ch === editor.getValue().length - 1 });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-date.unit.ts`

```ts
export const insertDateUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-date"]');
  results.push({ test: 'insert-date-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'date-format-yyyy-mm-dd', pass: /\\d{4}-\\d{2}-\\d{2}/.test(val) });
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-date.edge.ts`

```ts
export const insertDateEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: moment available → uses moment format
    const m = (window as any).moment;
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-date"]')?.click();
    const val = editor.getValue().trim();
    if (m) {
      results.push({ test: 'date-uses-moment', pass: val === m().format('YYYY-MM-DD') });
    } else {
      // Fallback: native Date
      const today = new Date();
      const expected = \`\${today.getFullYear()}-\${String(today.getMonth()+1).padStart(2,'0')}-\${String(today.getDate()).padStart(2,'0')}\`;
      results.push({ test: 'date-uses-native-fallback', pass: val === expected });
    }

    // Edge: date+time inserted together
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-datetime"]')?.click();
    const dtVal = editor.getValue().trim();
    results.push({ test: 'datetime-contains-date-and-time', pass: /\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}/.test(dtVal) });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/callout-picker.unit.ts`

```ts
export const calloutPickerUnitTest = `() => {
  const results = [];

  // T1: Callout button exists
  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]');
  results.push({ test: 'callout-btn-exists', pass: !!btn });

  // T2: No picker before click
  results.push({ test: 'no-picker-before-click', pass: !document.querySelector('.onr-callout-picker') });

  // T3: Click opens picker
  btn?.click();
  results.push({ test: 'picker-opens-on-click', pass: !!document.querySelector('.onr-callout-picker') });

  // T4: Picker has 12 types
  const pickerBtns = document.querySelectorAll('.onr-callout-picker div');
  results.push({ test: 'picker-has-12-types', pass: pickerBtns.length === 12 });

  // T5: All expected types present
  const types = ['note','abstract','info','tip','success','question','warning','failure','danger','bug','example','quote'];
  const pickerTexts = [...pickerBtns].map(b => b.textContent?.trim().toLowerCase());
  for (const t of types) {
    results.push({ test: \`picker-has-\${t}\`, pass: pickerTexts.includes(t) });
  }

  // Cleanup
  document.body.click();
  return results;
}`;
```

### `tests/callout-picker.edge.ts`

```ts
export const calloutPickerEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge 1: Clicking a callout type inserts correct notation
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    const warningBtn = [...document.querySelectorAll('.onr-callout-picker div')].find(b => b.textContent?.trim() === 'warning');
    warningBtn?.click();
    results.push({ test: 'callout-inserts-warning-type', pass: editor.getValue().includes('[!warning]') });

    // Edge 2: Outside click closes picker without inserting
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    document.body.click(); // outside click
    await new Promise(r => setTimeout(r, 50));
    results.push({ test: 'outside-click-closes-picker', pass: !document.querySelector('.onr-callout-picker') });
    results.push({ test: 'outside-click-no-insertion', pass: editor.getValue() === '' });

    // Edge 3: Picker positioned below callout button
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]')?.click();
    const picker = document.querySelector('.onr-callout-picker') as HTMLElement;
    const calloutBtnRect = (document.querySelector('[data-panel="Insert"] [data-cmd="insert-callout"]') as HTMLElement)?.getBoundingClientRect();
    if (picker && calloutBtnRect) {
      const pickerTop = parseFloat(picker.style.top);
      results.push({ test: 'picker-below-button', pass: pickerTop > calloutBtnRect.top });
    }
    document.body.click();

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-code-block.unit.ts`

```ts
export const insertCodeBlockUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-code-block"]');
  results.push({ test: 'code-block-btn-exists', pass: !!btn });

  if (editor) {
    editor.setValue('');
    editor.setCursor({ line: 0, ch: 0 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'code-block-has-fences', pass: (val.match(/\`\`\`/g) || []).length >= 2 });

    // Cursor positioned inside the block (line 1)
    const cursor = editor.getCursor();
    results.push({ test: 'code-block-cursor-inside', pass: cursor.line === 1 && cursor.ch === 0 });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-code-block.edge.ts`

```ts
export const insertCodeBlockEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: Multiple code blocks don't interfere
    editor.setValue('\`\`\`\nexisting\n\`\`\`');
    editor.setCursor({ line: 2, ch: 3 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-code-block"]')?.click();
    const val = editor.getValue();
    results.push({ test: 'code-block-after-existing', pass: (val.match(/\`\`\`/g) || []).length >= 4 });

    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-footnote.unit.ts`

```ts
export const insertFootnoteUnitTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  const btn = document.querySelector('[data-panel="Insert"] [data-cmd="insert-footnote"]');
  results.push({ test: 'footnote-btn-exists', pass: !!btn });

  if (editor) {
    editor.setValue('My text');
    editor.setCursor({ line: 0, ch: 7 });
    btn?.click();
    const val = editor.getValue();
    results.push({ test: 'footnote-ref-inserted', pass: val.includes('[^1]') });
    results.push({ test: 'footnote-def-at-end', pass: val.endsWith('[^1]: ') || val.endsWith('[^1]:') });
    editor.setValue('');
  }

  return results;
}`;
```

### `tests/insert-footnote.edge.ts`

```ts
export const insertFootnoteEdgeTests = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;

  if (editor) {
    // Edge: Multi-line note — definition appended at last line
    editor.setValue('Line 1\\nLine 2\\nLine 3');
    editor.setCursor({ line: 1, ch: 3 });
    document.querySelector('[data-panel="Insert"] [data-cmd="insert-footnote"]')?.click();
    const lines = editor.getValue().split('\\n');
    results.push({ test: 'footnote-def-at-last-line', pass: lines[lines.length - 1].startsWith('[^1]:') });

    // Edge: Footnote ref at insertion point
    results.push({ test: 'footnote-ref-at-cursor', pass: lines[1].includes('[^1]') });

    editor.setValue('');
  }

  return results;
}`;
```

---

## Group Integration Tests

### `tests/tables.integration.ts`

```ts
export const tablesIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Tables"]');
  results.push({ test: 'tables-group-present', pass: !!group });
  results.push({ test: 'tables-has-table-btn', pass: !!group?.querySelector('[data-cmd="insert-table"]') });
  results.push({ test: 'tables-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Tables' });
  return results;
}`;
```

### `tests/blocks.integration.ts`

```ts
export const blocksIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Blocks"]');
  results.push({ test: 'blocks-group-present', pass: !!group });

  const cmds = ['insert-template', 'insert-callout', 'insert-code-block'];
  for (const cmd of cmds) {
    results.push({ test: \`blocks-has-\${cmd}\`, pass: !!group?.querySelector(\`[data-cmd="\${cmd}"]\`) });
  }

  results.push({ test: 'blocks-group-name', pass: group?.querySelector('.onr-group-name')?.textContent?.trim() === 'Blocks' });
  return results;
}`;
```

### `tests/timestamp.integration.ts`

```ts
export const timestampIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Time Stamp"]');
  results.push({ test: 'timestamp-group-present', pass: !!group });

  const cmds = ['insert-date', 'insert-time', 'insert-datetime'];
  for (const cmd of cmds) {
    results.push({ test: \`timestamp-has-\${cmd}\`, pass: !!group?.querySelector(\`[data-cmd="\${cmd}"]\`) });
  }

  results.push({ test: 'timestamp-3-buttons', pass: group?.querySelectorAll('.onr-btn').length === 3 });
  return results;
}`;
```

### `tests/symbols.integration.ts`

```ts
export const symbolsIntegrationTest = `() => {
  const results = [];
  const group = document.querySelector('[data-panel="Insert"] [data-group="Symbols"]');
  results.push({ test: 'symbols-group-present', pass: !!group });

  const cmds = ['insert-math', 'insert-hr', 'insert-footnote', 'insert-tag'];
  for (const cmd of cmds) {
    results.push({ test: \`symbols-has-\${cmd}\`, pass: !!group?.querySelector(\`[data-cmd="\${cmd}"]\`) });
  }

  results.push({ test: 'symbols-4-buttons', pass: group?.querySelectorAll('.onr-btn').length === 4 });
  return results;
}`;
```

---

## Verification Checklist

- [ ] All 8 group folders fully decomposed (not stubs anymore)
- [ ] `CalloutPicker.ts` extracted into its own subfolder
- [ ] All test files created as `.ts`
- [ ] `npm run build` passes with zero errors
- [ ] All unit tests pass in live Obsidian
- [ ] All edge tests pass (callout picker 12 types, footnote appends to end, cursor positions)
- [ ] All group integration tests pass
- [ ] `plan-04-insert-tab.md` checks 1-8 still all pass
- [ ] `README.md` created in every folder: each group subfolder, each button subfolder, and all `tests/` subfolders
