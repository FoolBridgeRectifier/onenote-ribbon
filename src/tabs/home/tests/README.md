# Home Tab Tests

Runtime test scripts evaluated inside the Obsidian DevTools console via `app.plugins.plugins['onenote-ribbon']` or the `mcp__obsidian-devtools__evaluate_script` tool. Each file exports a single template-literal string containing an async IIFE that returns an array of `{ test: string, pass: boolean }` results.

---

## `home.integration.ts`

Verifies structural correctness and cross-component state behaviour of the Home tab as a whole.

**Tests covered (I1–I13):**

| ID  | Description                                                                                |
| --- | ------------------------------------------------------------------------------------------ |
| I1  | Home panel exists in the DOM                                                               |
| I2  | All 6 groups (Clipboard, Basic Text, Styles, Tags, Email & Meetings, Navigate) are present |
| I3  | Groups appear in the correct DOM order                                                     |
| I4  | No duplicate group names                                                                   |
| I5  | Home panel is visible when the Home tab is active                                          |
| I6  | Insert panel is hidden when the Home tab is active                                         |
| I7  | Bold button gains `onr-active` class when cursor is inside bold text                       |
| I8  | Bold button loses `onr-active` class on a plain line                                       |
| I9  | Styles preview widget scrolls to show Heading 3 when cursor is on an H3 line               |
| I10 | Todo tag-check indicator activates on a checklist line                                     |
| I11 | Font label element (`#onr-font-label`) is present                                          |
| I12 | Only one overlay dropdown is open at a time                                                |
| I13 | Switching tabs closes all open overlay dropdowns                                           |

---

## `home.combinations.ts`

Exhaustive combination matrix — each test applies one or two Home ribbon commands to a specific editor state and asserts the resulting document text.

**Commands exercised:**

- `bold` — wrap/unwrap with selection, cursor-only insert
- `italic` — wrap with selection
- `bold + italic` — combined sequential application
- `strikethrough` — wrap with selection
- `highlight` — wrap with selection
- `underline` — wrap with selection
- `subscript` / `superscript` — toggle off when cursor is inside; mutual exclusion (sub converts sup)
- `bullet-list` — plain line, checklist (full prefix strip), numbered list replacement
- `numbered-list` — plain line
- `todo-tag` — plain line, heading replacement
- `clear-formatting` — with selection (strips heading + bold), without selection (clears line)
- `clear-inline` — strips inline markers while preserving heading prefix
- `align` — dropdown selection wraps paragraph in a div with `text-align`
- `font-color` — dropdown selection wraps text in a span with `color`
- `paste-dropdown` — verifies Plain Text option is present in menu
- `styles-dropdown` — applies Heading 3 from dropdown
- `styles-preview-0` — clicking first preview slot applies H1
- `tags-dropdown` — inserts `[!question]` callout notation
- `format-painter` — captures bold formatting and applies it to a new selection

---

## Running the tests

Paste the exported string into the Obsidian DevTools console, then `eval` it:

```js
const fn = eval(homeIntegrationTest);
console.table(await fn());
```

Or use the MCP tool:

```ts
await mcp__obsidian_devtools__evaluate_script({
  function: homeIntegrationTest,
});
```
