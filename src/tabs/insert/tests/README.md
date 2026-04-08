# Insert Tab — Integration Tests

Two test modules for the Insert tab of the OneNote Ribbon plugin. Both export a stringified async arrow function intended to be passed directly to `mcp__obsidian-devtools__evaluate_script`.

## Files

### `insert.integration.ts`

Exports `insertIntegrationTest`.

Covers structural and basic functional correctness:

- **I1–I2**: Insert panel is visible; Home panel is hidden after switching tabs.
- **I3–I5**: All 8 group labels are present, appear in the correct order, and contain no duplicates.
- **Button presence**: Every expected `data-cmd` attribute is found in the Insert panel DOM.
- **I6**: Table insertion produces Markdown table syntax.
- **I7**: Date insertion produces a `YYYY-MM-DD` formatted string.
- **I8**: Code-block insertion wraps fences and positions the cursor on line 1.
- **I9**: Manual reminder to check console errors via `list_console_messages`.

Run via:

```js
const { insertIntegrationTest } =
  await import("./src/tabs/insert/tests/insert.integration.ts");
// paste insertIntegrationTest into mcp__obsidian-devtools__evaluate_script
```

### `insert.combinations.ts`

Exports `insertCombinationsTest`.

Exhaustive input/output coverage across every Insert tab button:

| Area                             | Combinations tested                                                |
| -------------------------------- | ------------------------------------------------------------------ |
| Blank line                       | Plain text, empty file                                             |
| Table                            | Empty file, after existing text                                    |
| Attach file / Embed note / Image | Produces `![[]]`, cursor inside                                    |
| Video                            | Produces `<iframe src="">`                                         |
| Link                             | No selection (cursor inside brackets), with selection (wraps text) |
| Wikilink                         | Produces `[[]]`, cursor inside                                     |
| Date / Time / DateTime           | Regex format assertions                                            |
| Code block                       | Two fence markers present                                          |
| Math                             | Two `$$` markers, cursor on inner line                             |
| Horizontal rule                  | Contains `---`                                                     |
| Footnote                         | Ref inserted inline, definition appended at end                    |
| Tag                              | Starts with `#`                                                    |
| Callout (12 types)               | Each type produces `[!type]` block with correct format             |
| Template                         | No crash when Templater/Templates plugin absent                    |

## How to Run

1. Open Obsidian with the plugin loaded and an active editor.
2. Copy the string value of the exported constant.
3. Evaluate it using `mcp__obsidian-devtools__evaluate_script`.
4. Inspect the returned array — each entry has `{ test, pass }`. Any `pass: false` entry indicates a regression.
