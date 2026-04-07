# Plan R00 — Parent Refactor Plan: Modular Tab Architecture with Exhaustive Tests

## Vision

Decompose the monolithic `HomeTab.ts` and `InsertTab.ts` into a deep, self-contained module tree where:

- Every **group** (Clipboard, Basic Text, etc.) is a subfolder
- Every **button** within a group is its own subfolder with logic + CSS
- Every **dropdown/picker** within a button is its own subfolder
- Every **edge case** within a dropdown has its own subfolder with a test
- Every folder has **unit tests** (headless, via Obsidian MCP `evaluate_script`)
- Every group folder has **integration tests** covering cross-button interactions
- Every tab folder has **combination tests** covering all meaningful input × state permutations

## Target Folder Tree

> Every folder shown below also contains a `README.md` (see [README per Folder](#readme-per-folder) section).

```
src/
├── main.ts                        (unchanged)
├── styles/
│   ├── tokens.css                 (unchanged)
│   └── shell.css                  (unchanged)
├── ribbon/
│   └── RibbonShell.ts             (unchanged)
├── shared/
│   ├── dropdown/
│   │   ├── Dropdown.ts            (extracted showDropdown helper)
│   │   ├── dropdown.css
│   │   └── tests/
│   │       ├── dropdown.unit.ts   (renders, positions, closes on outside click)
│   │       └── dropdown.edge.ts   (viewport clamp, >15 items scroll, disabled items)
│   ├── toggleInline.ts            (extracted toggleInline fn)
│   ├── toggleSubSup.ts            (extracted toggleSubSup fn)
│   ├── toggleLinePrefix.ts        (extracted toggleLinePrefix fn)
│   └── tests/
│       ├── toggleInline.unit.ts
│       ├── toggleSubSup.unit.ts
│       └── toggleLinePrefix.unit.ts
│
├── tabs/
│   ├── home/
│   │   ├── HomeTab.ts             (orchestrator — renders all groups into panel)
│   │   ├── home.css               (tab-level layout only)
│   │   ├── tests/
│   │   │   ├── home.integration.ts   (all 6 groups render, ribbon state tracking)
│   │   │   └── home.combinations.ts  (every meaningful selection × format × tag state)
│   │   │
│   │   ├── clipboard/
│   │   │   ├── ClipboardGroup.ts
│   │   │   ├── clipboard.css
│   │   │   ├── tests/
│   │   │   │   └── clipboard.integration.ts
│   │   │   ├── paste/
│   │   │   │   ├── PasteButton.ts
│   │   │   │   ├── paste.css
│   │   │   │   └── tests/
│   │   │   │       ├── paste.unit.ts
│   │   │   │       └── paste.edge.ts      (no editor open, clipboard empty, large text)
│   │   │   ├── paste-dropdown/
│   │   │   │   ├── PasteDropdown.ts
│   │   │   │   ├── paste-dropdown.css
│   │   │   │   └── tests/
│   │   │   │       ├── paste-dropdown.unit.ts
│   │   │   │       └── paste-dropdown.edge.ts  (paste as plain text strips HTML)
│   │   │   ├── cut/
│   │   │   │   ├── CutButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── cut.unit.ts
│   │   │   │       └── cut.edge.ts        (no selection, multi-line selection)
│   │   │   ├── copy/
│   │   │   │   ├── CopyButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── copy.unit.ts
│   │   │   │       └── copy.edge.ts
│   │   │   └── format-painter/
│   │   │       ├── FormatPainterButton.ts
│   │   │       └── tests/
│   │   │           ├── format-painter.unit.ts
│   │   │           └── format-painter.edge.ts  (bold+heading capture, apply to selection, cancel on non-selection mouseup)
│   │   │
│   │   ├── basic-text/
│   │   │   ├── BasicTextGroup.ts
│   │   │   ├── basic-text.css
│   │   │   ├── tests/
│   │   │   │   └── basic-text.integration.ts
│   │   │   ├── bold/
│   │   │   │   ├── BoldButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── bold.unit.ts
│   │   │   │       └── bold.edge.ts       (toggle on/off, selection vs cursor, triple-nested **)
│   │   │   ├── italic/
│   │   │   │   ├── ItalicButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── italic.unit.ts
│   │   │   │       └── italic.edge.ts     (toggle on/off, adjacent to bold)
│   │   │   ├── underline/
│   │   │   │   ├── UnderlineButton.ts
│   │   │   │   └── tests/
│   │   │   │       └── underline.unit.ts
│   │   │   ├── strikethrough/
│   │   │   │   ├── StrikethroughButton.ts
│   │   │   │   └── tests/
│   │   │   │       └── strikethrough.unit.ts
│   │   │   ├── subscript/
│   │   │   │   ├── SubscriptButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── subscript.unit.ts
│   │   │   │       └── subscript.edge.ts  (mutually exclusive with superscript)
│   │   │   ├── superscript/
│   │   │   │   ├── SuperscriptButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── superscript.unit.ts
│   │   │   │       └── superscript.edge.ts
│   │   │   ├── highlight/
│   │   │   │   ├── HighlightButton.ts
│   │   │   │   ├── highlight.css          (swatch color indicator)
│   │   │   │   └── tests/
│   │   │   │       └── highlight.unit.ts
│   │   │   ├── font-color/
│   │   │   │   ├── FontColorButton.ts
│   │   │   │   ├── font-color.css
│   │   │   │   └── tests/
│   │   │   │       ├── font-color.unit.ts
│   │   │   │       └── font-color.edge.ts  (white on dark bg, wrap selection vs global)
│   │   │   ├── font-family/
│   │   │   │   ├── FontFamilyPicker.ts
│   │   │   │   ├── font-family.css
│   │   │   │   └── tests/
│   │   │   │       ├── font-family.unit.ts
│   │   │   │       └── font-family.edge.ts (selection wraps span, no-selection sets vault config)
│   │   │   ├── font-size/
│   │   │   │   ├── FontSizePicker.ts
│   │   │   │   └── tests/
│   │   │   │       └── font-size.unit.ts
│   │   │   ├── bullet-list/
│   │   │   │   ├── BulletListButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── bullet-list.unit.ts
│   │   │   │       └── bullet-list.edge.ts (toggle on checklist line strips full prefix)
│   │   │   ├── numbered-list/
│   │   │   │   ├── NumberedListButton.ts
│   │   │   │   └── tests/
│   │   │   │       └── numbered-list.unit.ts
│   │   │   ├── indent/
│   │   │   │   ├── IndentButton.ts
│   │   │   │   └── tests/
│   │   │   │       └── indent.unit.ts
│   │   │   ├── outdent/
│   │   │   │   ├── OutdentButton.ts
│   │   │   │   └── tests/
│   │   │   │       └── outdent.unit.ts
│   │   │   ├── align/
│   │   │   │   ├── AlignButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── align.unit.ts
│   │   │   │       └── align.edge.ts      (wraps selection, wraps line, all 4 align options)
│   │   │   ├── clear-formatting/
│   │   │   │   ├── ClearFormattingButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── clear-formatting.unit.ts
│   │   │   │       └── clear-formatting.edge.ts (heading+bold+italic combined, no selection)
│   │   │   └── clear-inline/
│   │   │       ├── ClearInlineButton.ts
│   │   │       └── tests/
│   │   │           └── clear-inline.unit.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── StylesGroup.ts
│   │   │   ├── styles.css
│   │   │   ├── tests/
│   │   │   │   └── styles.integration.ts
│   │   │   ├── styles-preview/
│   │   │   │   ├── StylesPreview.ts
│   │   │   │   └── tests/
│   │   │   │       ├── styles-preview.unit.ts
│   │   │   │       └── styles-preview.edge.ts  (cursor on H1-H6 scrolls to correct card, active highlight)
│   │   │   ├── styles-scroll/
│   │   │   │   ├── StylesScroll.ts
│   │   │   │   └── tests/
│   │   │   │       └── styles-scroll.unit.ts   (up/down clamp at boundaries)
│   │   │   └── styles-dropdown/
│   │   │       ├── StylesDropdown.ts
│   │   │       └── tests/
│   │   │           ├── styles-dropdown.unit.ts
│   │   │           └── styles-dropdown.edge.ts  (all 11 style options, applies prefix+suffix)
│   │   │
│   │   ├── tags/
│   │   │   ├── TagsGroup.ts
│   │   │   ├── tags.css
│   │   │   ├── tags-data.ts               (ALL_TAGS, tagNotation, TAG_CMD_TO_DEF)
│   │   │   ├── tests/
│   │   │   │   └── tags.integration.ts
│   │   │   ├── tag-row/
│   │   │   │   ├── TagRow.ts              (renders a single tag row with check indicator)
│   │   │   │   └── tests/
│   │   │   │       ├── tag-row.unit.ts
│   │   │   │       └── tag-row.edge.ts    (active check visible when line has tag notation)
│   │   │   ├── tags-dropdown/
│   │   │   │   ├── TagsDropdown.ts        (full 29-tag scrollable menu)
│   │   │   │   ├── tags-dropdown.css
│   │   │   │   └── tests/
│   │   │   │       ├── tags-dropdown.unit.ts
│   │   │   │       └── tags-dropdown.edge.ts   (scroll list renders all 29, active checks, Customize Tags notice)
│   │   │   ├── todo-tag/
│   │   │   │   ├── TodoTagButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── todo-tag.unit.ts
│   │   │   │       └── todo-tag.edge.ts        (toggle on empty line, on existing bullet, on completed checkbox)
│   │   │   ├── find-tags/
│   │   │   │   ├── FindTagsButton.ts
│   │   │   │   └── tests/
│   │   │   │       └── find-tags.unit.ts
│   │   │   └── tag-apply/
│   │   │       ├── applyTag.ts            (extracted applyTag fn)
│   │   │       └── tests/
│   │   │           ├── apply-tag.unit.ts
│   │   │           └── apply-tag.edge.ts  (highlight toggle-inline, multiline callout toggle-off)
│   │   │
│   │   ├── email/
│   │   │   ├── EmailGroup.ts
│   │   │   ├── tests/
│   │   │   │   └── email.integration.ts
│   │   │   ├── email-page/
│   │   │   │   ├── EmailPageButton.ts
│   │   │   │   └── tests/
│   │   │   │       ├── email-page.unit.ts
│   │   │   │       └── email-page.edge.ts  (empty note, no active editor)
│   │   │   └── meeting-details/
│   │   │       ├── MeetingDetailsButton.ts
│   │   │       └── tests/
│   │   │           └── meeting-details.unit.ts
│   │   │
│   │   └── navigate/
│   │       ├── NavigateGroup.ts
│   │       ├── tests/
│   │       │   └── navigate.integration.ts
│   │       ├── outline/
│   │       │   ├── OutlineButton.ts
│   │       │   └── tests/
│   │       │       └── outline.unit.ts
│   │       ├── fold-all/
│   │       │   ├── FoldAllButton.ts
│   │       │   └── tests/
│   │       │       └── fold-all.unit.ts
│   │       └── unfold-all/
│   │           ├── UnfoldAllButton.ts
│   │           └── tests/
│   │               └── unfold-all.unit.ts
│   │
│   └── insert/
│       ├── InsertTab.ts
│       ├── insert.css
│       ├── tests/
│       │   ├── insert.integration.ts
│       │   └── insert.combinations.ts
│       │
│       ├── blank-line/
│       │   ├── BlankLineButton.ts
│       │   └── tests/
│       │       └── blank-line.unit.ts
│       ├── tables/
│       │   ├── TablesGroup.ts
│       │   ├── tests/
│       │   │   └── tables.integration.ts
│       │   └── insert-table/
│       │       ├── InsertTableButton.ts
│       │       └── tests/
│       │           ├── insert-table.unit.ts
│       │           └── insert-table.edge.ts  (cursor mid-line, empty file)
│       ├── files/
│       │   ├── FilesGroup.ts
│       │   ├── tests/
│       │   │   └── files.integration.ts
│       │   ├── attach-file/
│       │   │   ├── AttachFileButton.ts
│       │   │   └── tests/
│       │   │       └── attach-file.unit.ts
│       │   └── embed-note/
│       │       ├── EmbedNoteButton.ts
│       │       └── tests/
│       │           └── embed-note.unit.ts
│       ├── images/
│       │   ├── ImagesGroup.ts
│       │   ├── tests/
│       │   │   └── images.integration.ts
│       │   ├── insert-image/
│       │   │   ├── InsertImageButton.ts
│       │   │   └── tests/
│       │   │       └── insert-image.unit.ts
│       │   └── insert-video/
│       │       ├── InsertVideoButton.ts
│       │       └── tests/
│       │           └── insert-video.unit.ts
│       ├── links/
│       │   ├── LinksGroup.ts
│       │   ├── tests/
│       │   │   └── links.integration.ts
│       │   ├── insert-link/
│       │   │   ├── InsertLinkButton.ts
│       │   │   └── tests/
│       │   │       ├── insert-link.unit.ts
│       │   │       └── insert-link.edge.ts   (selection wraps [sel](), no selection inserts []())
│       │   └── insert-wikilink/
│       │       ├── InsertWikilinkButton.ts
│       │       └── tests/
│       │           └── insert-wikilink.unit.ts
│       ├── timestamp/
│       │   ├── TimestampGroup.ts
│       │   ├── tests/
│       │   │   └── timestamp.integration.ts
│       │   ├── insert-date/
│       │   │   ├── InsertDateButton.ts
│       │   │   └── tests/
│       │   │       ├── insert-date.unit.ts
│       │   │       └── insert-date.edge.ts   (moment available vs fallback, format YYYY-MM-DD)
│       │   ├── insert-time/
│       │   │   ├── InsertTimeButton.ts
│       │   │   └── tests/
│       │   │       └── insert-time.unit.ts
│       │   └── insert-datetime/
│       │       ├── InsertDatetimeButton.ts
│       │       └── tests/
│       │           └── insert-datetime.unit.ts
│       ├── blocks/
│       │   ├── BlocksGroup.ts
│       │   ├── tests/
│       │   │   └── blocks.integration.ts
│       │   ├── insert-template/
│       │   │   ├── InsertTemplateButton.ts
│       │   │   └── tests/
│       │   │       ├── insert-template.unit.ts
│       │   │       └── insert-template.edge.ts  (no Templates plugin → Notice)
│       │   ├── insert-callout/
│       │   │   ├── InsertCalloutButton.ts
│       │   │   ├── callout-picker/
│       │   │   │   ├── CalloutPicker.ts
│       │   │   │   ├── callout-picker.css
│       │   │   │   └── tests/
│       │   │   │       ├── callout-picker.unit.ts
│       │   │   │       └── callout-picker.edge.ts  (all 12 types render, click type inserts correct callout, outside click closes)
│       │   │   └── tests/
│       │   │       └── insert-callout.unit.ts
│       │   └── insert-code-block/
│       │       ├── InsertCodeBlockButton.ts
│       │       └── tests/
│       │           ├── insert-code-block.unit.ts
│       │           └── insert-code-block.edge.ts  (cursor placed inside block)
│       └── symbols/
│           ├── SymbolsGroup.ts
│           ├── tests/
│           │   └── symbols.integration.ts
│           ├── insert-math/
│           │   ├── InsertMathButton.ts
│           │   └── tests/
│           │       └── insert-math.unit.ts
│           ├── insert-hr/
│           │   ├── InsertHrButton.ts
│           │   └── tests/
│           │       └── insert-hr.unit.ts
│           ├── insert-footnote/
│           │   ├── InsertFootnoteButton.ts
│           │   └── tests/
│           │       ├── insert-footnote.unit.ts
│           │       └── insert-footnote.edge.ts  (reference appended at last line)
│           └── insert-tag/
│               ├── InsertTagButton.ts
│               └── tests/
│                   └── insert-tag.unit.ts
```

## Sub-Plans (each executed by a dedicated agent)

| Plan                                                       | Agent   | Scope                                                                                                     |
| ---------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| [R01-shared-utilities](plan-R01-shared-utilities.md)       | Agent A | Extract `Dropdown`, `toggleInline`, `toggleSubSup`, `toggleLinePrefix` into `src/shared/` with unit tests |
| [R02-home-structure](plan-R02-home-structure.md)           | Agent B | Create `src/tabs/home/` folder, split HomeTab into group modules, wire orchestrator                       |
| [R03-home-clipboard](plan-R03-home-clipboard.md)           | Agent C | Implement `clipboard/` subfolder with all 5 button modules + unit + edge tests                            |
| [R04-home-basic-text](plan-R04-home-basic-text.md)         | Agent D | Implement `basic-text/` subfolder with 14 button modules + unit + edge tests                              |
| [R05-home-styles](plan-R05-home-styles.md)                 | Agent E | Implement `styles/` subfolder (preview, scroll, dropdown) + unit + edge tests                             |
| [R06-home-tags](plan-R06-home-tags.md)                     | Agent F | Implement `tags/` subfolder (tag-row, tags-dropdown, todo-tag, find-tags, applyTag) + unit + edge tests   |
| [R07-home-email-navigate](plan-R07-home-email-navigate.md) | Agent G | Implement `email/` and `navigate/` subfolders + unit tests                                                |
| [R08-home-integration](plan-R08-home-integration.md)       | Agent H | Write integration tests for full Home tab — all 6 groups, ribbon state tracking, all combinations         |
| [R09-insert-structure](plan-R09-insert-structure.md)       | Agent I | Create `src/tabs/insert/` folder, split InsertTab into group modules                                      |
| [R10-insert-groups](plan-R10-insert-groups.md)             | Agent J | Implement all 8 insert group subfolders + unit + edge tests                                               |
| [R11-insert-integration](plan-R11-insert-integration.md)   | Agent K | Write integration + combination tests for full Insert tab                                                 |

## Execution Order

```
Phase 1 (parallel): R01-shared-utilities
Phase 2 (parallel): R02-home-structure + R09-insert-structure
Phase 3 (parallel after Phase 2): R03, R04, R05, R06, R07 (home groups) + R10 (insert groups)
Phase 4 (parallel after Phase 3): R08-home-integration + R11-insert-integration
```

## Test Standards

### Tests are runnable, not documentation

All `.unit.ts`, `.edge.ts`, `.integration.ts`, and `.combinations.ts` files are **actual executable tests**, not plan documents. Each file contains working `evaluate_script` code blocks that an agent or human runs directly against the live Obsidian instance via `mcp__obsidian-devtools__evaluate_script`. They must not describe what a test _would_ do — they must be ready to run.

Each test block:

- Uses `mcp__obsidian-devtools__evaluate_script` to interact with the live vault
- Asserts the expected state using `console.assert(...)` or throws on failure
- Cleans up after itself (undo or reset to blank)
- Can be re-run in isolation without side effects

Debugging pattern when a test fails: add `console.log(...)` inside the evaluate_script block to inspect intermediate state, re-run, and read the output.

### Unit test format

````
# Unit: <ButtonName>

## Setup
```js
// evaluate_script block: put editor in the correct state
const editor = app.workspace.activeEditor?.editor;
editor.setValue("initial content");
editor.setCursor({line: 0, ch: 0});
```

## Test: <description>
### Pre-condition
<describe the start state in plain text>

### Action
```js
// evaluate_script block
const editor = app.workspace.activeEditor?.editor;
// ... invoke the button action ...
const result = editor.getValue();
console.assert(result === "expected output", `Got: ${result}`);
```

### Cleanup
```js
// evaluate_script block
app.workspace.activeEditor?.editor.setValue("");
```
````

### Integration test format

````
# Integration: <GroupName>

## Test Suite: <scenario>
<describe the scenario>

### Step 1: <action>
```js
// evaluate_script block
```
### Expected after step 1: <state>

### Step 2: <action>
```js
// evaluate_script block
```
### Expected after step 2: <state>
````

### Combination test format (tab-level)

````
# Combinations: Home Tab

Matrix of: [formatting state] × [selection type] × [cursor position] × [action]
Each cell is one evaluate_script assertion.

## Case: <bold selection> × <cursor mid-word> × <click Bold>
```js
// evaluate_script block — full assertion
```
````

## README per Folder

Every folder in the module tree (groups, buttons, dropdowns, and their `tests/` subfolders) must contain a `README.md` with:

1. **Overview** — one paragraph describing what the module does, its exports, and any notable behaviour
2. **Test returns** — a table listing every test file in the folder's `tests/` subfolder, what state it leaves the editor in after running, and what value a passing run returns (the final `console.assert` message or return value)

Example `README.md` for a button folder:

```
# BoldButton

Wraps the current selection (or word at cursor) in `**...**`. Removes existing bold markers if the selection is already bold.

Exports: `class BoldButton { render(container: HTMLElement, app: App): void }`

## Test returns

| File | Scenario | Pass return |
|------|----------|-------------|
| bold.unit.ts | Toggle bold on selection | `"**hello**"` |
| bold.unit.ts | Toggle bold off (already bold) | `"hello"` |
| bold.edge.ts | Triple-nested ** — idempotent | `"**hello**"` |
```

## What Changes at Runtime

- `main.ts` — unchanged
- `RibbonShell.ts` — imports `HomeTab` and `InsertTab` from new paths (same interface: `render(container, app)`)
- Build output — same `main.js`, just compiled from modular sources
- CSS — each module's CSS is imported in its `.ts` file via esbuild (inline), or all CSS is bundled via esbuild's CSS entry point — see Plan R01 for the CSS bundling strategy

## Invariants (must hold throughout)

1. The rendered DOM must be byte-for-byte identical to the current DOM — no visual regressions
2. All existing test checks in `plan-03-home-tab.md` and `plan-04-insert-tab.md` must still pass
3. No new global variables or window properties introduced
4. Each button module exports exactly one thing: a class or function with a `render(container, app)` signature
5. CSS classes are module-prefixed within each module (`.onr-clipboard-*`, `.onr-tags-*`) to prevent collisions
6. Tests are isolated — each test cleans up its editor changes (undo or set to blank)
7. Test files (`.unit.ts`, `.edge.ts`, `.integration.ts`, `.combinations.ts`) contain runnable `evaluate_script` blocks, not prose plans — every code block must execute successfully against the live Obsidian instance
8. Every folder (module, group, button, dropdown, and `tests/`) contains a `README.md` with an overview and a test-returns table
