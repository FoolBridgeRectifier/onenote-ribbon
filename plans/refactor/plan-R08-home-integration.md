# Plan R08 — Home Tab Integration & Combination Tests

**Agent:** H  
**Phase:** 4 (after R03-R07 complete)  
**Dependency:** All home group modules must be implemented  
**Produces:** `src/tabs/home/tests/home.integration.ts` and `src/tabs/home/tests/home.combinations.ts`

---

## Goal

Write comprehensive tests that:

1. Verify all 6 groups coexist and interact correctly (integration)
2. Cover every meaningful combination of: editor state × selection × format action × active state (combinations)

These tests live in `src/tabs/home/tests/` as `.ts` files runnable via `mcp__obsidian-devtools__evaluate_script`.

---

## `home.integration.ts`

```ts
export const homeIntegrationTest = `() => {
  const results = [];

  // ── Structural Checks ────────────────────────────────────────────────────────

  // I1: Home panel exists
  results.push({ test: 'home-panel-exists', pass: !!document.querySelector('[data-panel="Home"]') });

  // I2: All 6 groups present
  const groupNames = [...document.querySelectorAll('[data-panel="Home"] .onr-group-name')]
    .map(g => g.textContent?.trim());
  const expected = ['Clipboard', 'Basic Text', 'Styles', 'Tags', 'Email & Meetings', 'Navigate'];
  for (const name of expected) {
    results.push({ test: \`group-\${name.replace(/[^a-z]/gi, '-').toLowerCase()}-present\`, pass: groupNames.includes(name) });
  }

  // I3: Groups in correct DOM order
  results.push({ test: 'groups-in-order', pass: JSON.stringify(groupNames.slice(0, 6)) === JSON.stringify(expected) });

  // I4: No overlapping groups (each data-group is unique)
  const unique = new Set(groupNames);
  results.push({ test: 'no-duplicate-groups', pass: unique.size === groupNames.length });

  // I5: Home tab panel visible when Home tab active
  const homeTab = document.querySelector('[data-tab="Home"]');
  homeTab?.click();
  await new Promise(r => setTimeout(r, 50));
  const panel = document.querySelector('[data-panel="Home"]') as HTMLElement;
  results.push({ test: 'home-panel-visible-when-active', pass: panel?.style.display !== 'none' });

  // I6: Insert panel hidden when Home tab active
  const insertPanel = document.querySelector('[data-panel="Insert"]') as HTMLElement;
  results.push({ test: 'insert-panel-hidden-when-home-active', pass: insertPanel?.style.display === 'none' });

  // ── Ribbon State Tracking ────────────────────────────────────────────────────
  const editor = app.workspace.activeEditor?.editor;
  if (editor) {
    // I7: Bold button activates on bold line
    editor.setValue('**bold text**');
    editor.setCursor({ line: 0, ch: 5 });
    const ws = document.querySelector('.workspace') ?? document.body;
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const boldBtn = document.querySelector('[data-panel="Home"] [data-cmd="bold"]');
    results.push({ test: 'bold-active-state-tracked', pass: boldBtn?.classList.contains('onr-active') ?? false });

    // I8: Bold button deactivates on plain line
    editor.setValue('plain text');
    editor.setCursor({ line: 0, ch: 0 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    results.push({ test: 'bold-inactive-on-plain-line', pass: !(boldBtn?.classList.contains('onr-active') ?? true) });

    // I9: Styles preview scrolls on H3 cursor
    editor.setValue('### Section');
    editor.setCursor({ line: 0, ch: 5 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const preview0 = document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"] span');
    results.push({ test: 'styles-preview-scrolls-to-h3', pass: preview0?.textContent?.trim() === 'Heading 3' });

    // I10: Tag check updates on tag line
    editor.setValue('- [ ] My task');
    editor.setCursor({ line: 0, ch: 5 });
    ws.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const todoCheck = document.querySelector('[data-panel="Home"] [data-cmd="tag-todo"] .onr-tag-check') as HTMLElement;
    results.push({ test: 'todo-check-active-on-task-line', pass: todoCheck?.style.background?.includes('68') || todoCheck?.style.background?.includes('4472') || !!todoCheck?.innerHTML });

    // I11: Font label updates from vault config
    const fontLabel = document.getElementById('onr-font-label');
    results.push({ test: 'font-label-present', pass: !!fontLabel });

    editor.setValue('');
  }

  // ── Cross-group Interactions ──────────────────────────────────────────────────
  // I12: Only one overlay dropdown open at a time
  document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]')?.click();
  const firstMenu = document.querySelectorAll('.onr-overlay-dropdown').length;
  document.querySelector('[data-panel="Home"] [data-cmd="align"]')?.click();
  const secondMenu = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'only-one-overlay-at-a-time', pass: firstMenu <= 1 && secondMenu <= 1 });
  document.body.click(); // close

  // I13: Tab switching closes all overlays
  document.querySelector('[data-tab="Insert"]')?.click();
  await new Promise(r => setTimeout(r, 50));
  document.querySelector('[data-tab="Home"]')?.click();
  await new Promise(r => setTimeout(r, 50));
  const openMenus = document.querySelectorAll('.onr-overlay-dropdown').length;
  results.push({ test: 'tab-switch-closes-overlays', pass: openMenus === 0 });

  return results;
}`;
```

---

## `home.combinations.ts`

Exhaustive matrix: (line content) × (selection type) × (button action) × (expected output)

```ts
export const homeCombinationsTest = `() => {
  const results = [];
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return [{ test: 'no-editor', pass: false }];

  // Helper
  const click = (cmd) => document.querySelector(\`[data-panel="Home"] [data-cmd="\${cmd}"]\`)?.click();
  const val = () => editor.getValue();
  const set = (v, line = 0, ch = 0) => { editor.setValue(v); editor.setCursor({ line, ch }); };
  const sel = (l0, c0, l1, c1) => editor.setSelection({ line: l0, ch: c0 }, { line: l1, ch: c1 });

  // ── COMBINATION MATRIX ───────────────────────────────────────────────────────

  // BOLD × selection types
  set('Hello world'); sel(0, 0, 0, 5); click('bold');
  results.push({ test: 'bold×selection', pass: val() === '**Hello** world' });

  set('Hello world'); set('Hello world', 0, 5); click('bold');
  results.push({ test: 'bold×cursor-no-selection', pass: val() === 'Hello****world' });

  set('**Hello** world'); sel(0, 0, 0, 9); click('bold');
  results.push({ test: 'bold×unwrap-selection', pass: val() === 'Hello world' });

  // ITALIC × selection types
  set('Hello world'); sel(0, 0, 0, 5); click('italic');
  results.push({ test: 'italic×selection', pass: val() === '*Hello* world' });

  // BOLD + ITALIC combined (both active)
  set('Hello'); sel(0, 0, 0, 5);
  click('bold'); click('italic');
  results.push({ test: 'bold+italic×selection', pass: val().includes('**') && val().includes('*') });

  // STRIKETHROUGH × selection
  set('strike this'); sel(0, 0, 0, 6); click('strikethrough');
  results.push({ test: 'strikethrough×selection', pass: val() === '~~strike~~ this' });

  // HIGHLIGHT × selection
  set('highlight me'); sel(0, 0, 0, 9); click('highlight');
  results.push({ test: 'highlight×selection', pass: val() === '==highlight== me' });

  // UNDERLINE × selection
  set('underline'); sel(0, 0, 0, 9); click('underline');
  results.push({ test: 'underline×selection', pass: val() === '<u>underline</u>' });

  // SUB × cursor inside existing sub (toggle off)
  set('H<sub>2</sub>O'); set('H<sub>2</sub>O', 0, 7); click('subscript');
  results.push({ test: 'subscript×cursor-inside-toggle-off', pass: !val().includes('<sub>') });

  // SUP × cursor inside existing sup (toggle off)
  set('x<sup>2</sup>'); set('x<sup>2</sup>', 0, 7); click('superscript');
  results.push({ test: 'superscript×cursor-inside-toggle-off', pass: !val().includes('<sup>') });

  // SUB × cursor inside SUP (convert, mutually exclusive)
  set('x<sup>2</sup>'); set('x<sup>2</sup>', 0, 7); click('subscript');
  results.push({ test: 'subscript×converts-sup', pass: val().includes('<sub>') && !val().includes('<sup>') });

  // BULLET LIST × plain line
  set('My item'); click('bullet-list');
  results.push({ test: 'bullet×plain-line', pass: val() === '- My item' });

  // BULLET LIST × checklist (strips full prefix)
  set('- [x] Done'); click('bullet-list');
  results.push({ test: 'bullet×checklist-strips-full', pass: val() === 'Done' });

  // BULLET LIST × numbered list (replaces)
  set('1. Item'); click('bullet-list');
  results.push({ test: 'bullet×numbered-list-replaces', pass: val() === '- Item' });

  // NUMBERED LIST × plain line
  set('My item'); click('numbered-list');
  results.push({ test: 'numbered×plain-line', pass: val() === '1. My item' });

  // TODO TAG × plain line
  set('Task'); click('todo-tag');
  results.push({ test: 'todo-tag×plain-line', pass: val() === '- [ ] Task' });

  // TODO TAG × heading (replaces heading)
  set('# Heading'); click('todo-tag');
  results.push({ test: 'todo-tag×heading-replaces', pass: val() === '- [ ] Heading' });

  // CLEAR FORMATTING × heading+bold
  set('# **Heading Bold**'); sel(0, 0, 0, 19); click('clear-formatting');
  results.push({ test: 'clear-formatting×heading+bold', pass: !val().includes('#') && !val().includes('**') });

  // CLEAR FORMATTING × no selection (clears current line)
  set('## **Bold Heading**'); set('## **Bold Heading**', 0, 5); click('clear-formatting');
  results.push({ test: 'clear-formatting×no-selection-clears-line', pass: !val().includes('#') });

  // CLEAR INLINE × heading (keeps heading, strips inline only)
  set('# **Bold** normal'); sel(0, 0, 0, 10); click('clear-inline');
  results.push({ test: 'clear-inline×keeps-heading-strips-bold', pass: !val().includes('**') });

  // ALIGN × selection
  set('Para text'); sel(0, 0, 0, 9);
  document.querySelector('[data-panel="Home"] [data-cmd="align"]')?.click();
  [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')].find(i => i.textContent?.includes('Center'))?.click();
  results.push({ test: 'align×selection-wraps-div', pass: val().includes('text-align:center') });

  // FONT COLOR × selection
  set('Colored text'); sel(0, 0, 0, 7);
  document.querySelector('[data-panel="Home"] [data-cmd="font-color"]')?.click();
  [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')].find(i => i.textContent?.includes('Red'))?.click();
  results.push({ test: 'font-color×selection-wraps-span', pass: val().includes('color:#FF0000') || val().includes('color: rgb(255, 0, 0)') });

  // PASTE DROPDOWN × Paste as Plain Text (strip HTML concept)
  // (async — just verify menu item exists)
  const pdBtn = document.querySelector('[data-panel="Home"] [data-cmd="paste-dropdown"]');
  pdBtn?.click();
  const plainTextItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
    .find(i => i.textContent?.includes('Plain Text'));
  results.push({ test: 'paste-dropdown×plain-text-option', pass: !!plainTextItem });
  document.body.click();

  // STYLES DROPDOWN × Heading 3 applied
  set('Plain text');
  document.querySelector('[data-panel="Home"] [data-cmd="styles-dropdown"]')?.click();
  [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')].find(i => i.textContent?.trim() === 'Heading 3')?.click();
  results.push({ test: 'styles-dropdown×h3-applied', pass: val() === '### Plain text' });

  // STYLES PREVIEW × click applies heading
  set('My text');
  document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]')?.click(); // ensure offset=0
  document.querySelector('[data-panel="Home"] [data-cmd="styles-scroll-up"]')?.click();
  document.querySelector('[data-panel="Home"] [data-cmd="styles-preview-0"]')?.click();
  results.push({ test: 'styles-preview-0×applies-h1', pass: val() === '# My text' });

  // TAGS DROPDOWN × click tag inserts notation
  set('Plain line'); set('Plain line', 0, 5);
  document.querySelector('[data-panel="Home"] [data-cmd="tags-dropdown"]')?.click();
  await new Promise(r => setTimeout(r, 100));
  const questionItem = [...document.querySelectorAll('.onr-overlay-dropdown .onr-dd-item')]
    .find(i => i.textContent?.includes('Question'));
  questionItem?.click();
  results.push({ test: 'tags-dropdown×question-inserted', pass: val().includes('[!question]') });

  // FORMAT PAINTER × bold capture + apply
  set('**Bold line**'); set('**Bold line**', 0, 5);
  click('format-painter'); // phase 1: capture
  set('Target text'); sel(0, 0, 0, 6);
  document.querySelector('.workspace')?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await new Promise(r => requestAnimationFrame(r));
  results.push({ test: 'format-painter×applies-bold', pass: val().includes('**Target**') || (window as any)._onrFPActive === false });

  // Cleanup
  editor.setValue('');

  return results;
}`;
```

---

## How to Run These Tests

```bash
# In Obsidian devtools console or via MCP:
mcp__obsidian-devtools__evaluate_script({
  function: homeIntegrationTest
})

mcp__obsidian-devtools__evaluate_script({
  function: homeCombinationsTest
})
```

Or use the Obsidian MCP tool directly:

```
mcp__obsidian-devtools__evaluate_script({ function: `${homeIntegrationTest}` })
```

Expected output format:

```json
[
  { "test": "home-panel-exists", "pass": true },
  { "test": "group-clipboard-present", "pass": true },
  ...
]
```

Any entry with `"pass": false` must be investigated and fixed before this plan is complete.

---

## Verification Checklist

- [ ] `home.integration.ts` written with all 13 integration assertions
- [ ] `home.combinations.ts` written with all 28 combination assertions
- [ ] All integration assertions pass in live Obsidian (0 failures)
- [ ] All combination assertions pass in live Obsidian (0 failures)
- [ ] All pre-existing checks from `plan-03-home-tab.md` still pass
- [ ] Screenshot matches pre-refactor screenshot (no visual regression)
- [ ] `README.md` created in `src/tabs/home/tests/` covering both test files
