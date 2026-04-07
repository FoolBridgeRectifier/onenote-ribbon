# Home Tab — Comprehensive Test Plan

## Scope

All buttons and interactive controls in the Home tab ribbon, tested across combinations of:

- **Selection state**: no selection (cursor only) vs. text selected
- **Line content state**: plain text, already-formatted text (bold, italic, heading, list, etc.)
- **Editor state**: editor open vs. no active editor

Combinations are grouped by logical section. Up to 5-way combinations are specified where they produce distinct outcomes.

---

## Section 1 — Clipboard

### 1.1 Paste (main button)

| #   | Selection      | Clipboard content | Expected result                                 |
| --- | -------------- | ----------------- | ----------------------------------------------- |
| 1   | None           | Plain text        | Text inserted at cursor                         |
| 2   | Text selected  | Plain text        | Selection replaced with clipboard text          |
| 3   | None           | Empty             | Nothing inserted                                |
| 4   | No editor open | Any               | No crash, silent no-op                          |
| 5   | None           | HTML string       | Raw HTML inserted (no stripping for main Paste) |

### 1.2 Paste Dropdown

| #   | Menu item chosen    | Selection | Clipboard content | Expected result                              |
| --- | ------------------- | --------- | ----------------- | -------------------------------------------- |
| 1   | Paste               | None      | "hello"           | "hello" inserted at cursor                   |
| 2   | Paste               | Selected  | "hello"           | Selection replaced with "hello"              |
| 3   | Paste as Plain Text | None      | `<b>hello</b>`    | `hello` inserted (HTML stripped)             |
| 4   | Paste as Plain Text | Selected  | `<b>hi</b>`       | Selection replaced with `hi` (HTML stripped) |
| 5   | Paste as Plain Text | None      | "line1\r\nline2"  | `\r\n` normalized to `\n`                    |
| 6   | Paste Special…      | Any       | Any               | Item is disabled; no action                  |

### 1.3 Cut

| #   | Selection      | Expected result                                                  |
| --- | -------------- | ---------------------------------------------------------------- |
| 1   | Text selected  | Selected text copied to clipboard; selection removed from editor |
| 2   | No selection   | No-op (nothing written to clipboard, nothing deleted)            |
| 3   | No editor open | No crash                                                         |

### 1.4 Copy

| #   | Selection      | Expected result                                              |
| --- | -------------- | ------------------------------------------------------------ |
| 1   | Text selected  | Selected text written to clipboard; editor content unchanged |
| 2   | No selection   | No-op                                                        |
| 3   | No editor open | No crash                                                     |

---

## Section 2 — Basic Text (inline formatting)

`toggleInline` wraps/unwraps selection; with no selection it inserts markers and positions cursor between them.

### 2.1 Bold (`**`)

| #   | Selection   | Line content      | Expected result                                                                 |
| --- | ----------- | ----------------- | ------------------------------------------------------------------------------- |
| 1   | "hello"     | `hello`           | → `**hello**`                                                                   |
| 2   | "**hello**" | `**hello**`       | → `hello` (unwrap)                                                              |
| 3   | None        | `hello`           | `****` inserted, cursor between markers                                         |
| 4   | "hello"     | `**hello** world` | → `****hello**** world` — double wrapping (no special detection within partial) |
| 5   | No editor   | Any               | No crash                                                                        |

### 2.2 Italic (`*`)

| #   | Selection  | Line content | Expected result                                       |
| --- | ---------- | ------------ | ----------------------------------------------------- |
| 1   | "hello"    | `hello`      | → `*hello*`                                           |
| 2   | "_hello_"  | `*hello*`    | → `hello` (unwrap)                                    |
| 3   | None       | any          | `**` inserted, cursor between                         |
| 4   | "**bold**" | `**bold**`   | → `***bold***` (bold inside italic) — no special case |
| 5   | No editor  | Any          | No crash                                              |

### 2.3 Underline (`<u>…</u>`)

| #   | Selection               | Expected result                   |
| --- | ----------------------- | --------------------------------- |
| 1   | "hello"                 | → `<u>hello</u>`                  |
| 2   | `<u>hello</u>` selected | → `hello`                         |
| 3   | None                    | `<u></u>` inserted, cursor inside |
| 4   | No editor               | No crash                          |

### 2.4 Strikethrough (`~~`)

| #   | Selection            | Expected result                |
| --- | -------------------- | ------------------------------ |
| 1   | "hello"              | → `~~hello~~`                  |
| 2   | `~~hello~~` selected | → `hello`                      |
| 3   | None                 | `~~~~` inserted, cursor inside |
| 4   | No editor            | No crash                       |

### 2.5 Highlight (`==`)

| #   | Selection            | Expected result                |
| --- | -------------------- | ------------------------------ |
| 1   | "hello"              | → `==hello==`                  |
| 2   | `==hello==` selected | → `hello`                      |
| 3   | None                 | `====` inserted, cursor inside |
| 4   | No editor            | No crash                       |

### 2.6 Subscript (`<sub>…</sub>`)

> **Rules:**
> - **Cursor-aware toggle** — behavior depends on where the cursor is, not what is selected.
> - **Sub and sup cannot coexist** on the same text span. Applying one always removes the other.
> - No double-wrapping: clicking sub when already inside `<sub>` removes the tags (toggle off).

| #   | Cursor / Selection                  | Starting text          | Expected result                                                   |
| --- | ----------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| 1   | Selection "2"                       | `hello 2 world`        | `hello <sub>2</sub> world` — wraps selection                      |
| 2   | No selection at end of line         | `hello`                | `hello<sub></sub>` — inserts empty pair, cursor inside            |
| 3   | Cursor inside `<sub>2</sub>`        | `x<sub>2</sub>`        | `x2` — toggle off: strips tags, keeps content                     |
| 4   | Cursor inside `<sup>3</sup>`        | `x<sup>3</sup>`        | `x<sub>3</sub>` — mutual exclusion: converts sup span to sub      |
| 5   | Cursor outside any tag              | `x<sub>1</sub>y`       | wraps selection or inserts at cursor — does not affect other span |
| 6   | Cursor at `>` of `<sub>` (boundary) | `x<sub>2</sub>`        | Not active (ch = tag boundary) — clicking wraps/inserts, no toggle off |

### 2.7 Superscript (`<sup>…</sup>`)

> **Rules:** same as subscript. Sub and sup are **mutually exclusive** — they cannot be on the same text span, and each toggle is **cursor-aware**, not selection-based.

| #   | Cursor / Selection                  | Starting text          | Expected result                                                   |
| --- | ----------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| 1   | Selection "2"                       | `hello 2 world`        | `hello <sup>2</sup> world` — wraps selection                      |
| 2   | No selection at end of line         | `hello`                | `hello<sup></sup>` — inserts empty pair, cursor inside            |
| 3   | Cursor inside `<sup>3</sup>`        | `x<sup>3</sup>`        | `x3` — toggle off: strips tags, keeps content                     |
| 4   | Cursor inside `<sub>2</sub>`        | `x<sub>2</sub>`        | `x<sup>2</sup>` — mutual exclusion: converts sub span to sup      |
| 5   | Cursor outside any tag              | `x<sup>1</sup>y`       | wraps selection or inserts at cursor — does not affect other span |
| 6   | Cursor at `>` of `<sup>` (boundary) | `x<sup>2</sup>`        | Not active (ch = tag boundary) — clicking wraps/inserts, no toggle off |

### 2.8 Multi-format combinations (inline, up to 5 deep)

| #   | Starting text on line | Actions (in order)                     | Expected result                                                                                  |
| --- | --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 1   | `hello`               | Bold → Italic (cursor, no sel)         | `***hello***` if typed between; or `****` then `**` added — each inserts independently at cursor |
| 2   | Select "hello", Bold  | `**hello**`                            | Select all, Italic                                                                               | → `***hello***` if selection covers exactly `**hello**` → `*\*\*hello\*\**` |
| 3   | `hello`, select       | Bold, Strikethrough                    | `~~**hello**~~`                                                                                  |
| 4   | `hello`, select       | Bold, Italic, Underline                | `<u>*\*\*hello\*\**</u>`                                                                         |
| 5   | `hello`, select       | Bold, Italic, Underline, Strikethrough | `~~<u>*\*\*hello\*\**</u>~~`                                                                     |

> **Note:** Each button independently calls `toggleInline`. Order of application = order of clicks. Unwrapping requires the exact markers to be the outermost part of the selection.

---

## Section 3 — Clear Formatting

### 3.1 Clear Formatting (eraser + block-level)

| #   | Selection | Line/Selection content  | Expected result                                   |
| --- | --------- | ----------------------- | ------------------------------------------------- |
| 1   | None      | `## My heading`         | → `My heading` (heading removed)                  |
| 2   | None      | `**bold** text`         | → `bold text`                                     |
| 3   | None      | `*italic*`              | → `italic`                                        |
| 4   | None      | `~~strike~~`            | → `strike`                                        |
| 5   | None      | `==highlight==`         | → `highlight`                                     |
| 6   | None      | `\`code\``              | → `code`                                          |
| 7   | None      | `<u>under</u>`          | → `under`                                         |
| 8   | Selected  | `**bold** and *italic*` | → `bold and italic`                               |
| 9   | None      | `## **bold heading**`   | → `bold heading` (both heading and bold stripped) |
| 10  | None      | Plain text              | No change                                         |
| 11  | No editor | Any                     | No crash                                          |

### 3.2 Clear Inline (X button — inline only, no block-level stripping)

| #   | Selection | Content               | Expected result                                    |
| --- | --------- | --------------------- | -------------------------------------------------- |
| 1   | None      | `## My heading`       | `## My heading` — heading prefix preserved         |
| 2   | None      | `**bold**`            | → `bold`                                           |
| 3   | None      | `## **bold heading**` | → `## bold heading` (heading stays, bold stripped) |
| 4   | Selected  | `**bold** *italic*`   | → `bold italic`                                    |
| 5   | No editor | Any                   | No crash                                           |

---

## Section 4 — Lists

### 4.1 Bullet List

`toggleLinePrefix` with `"- "`. Also handles completed checklist variants.

| #   | Line content  | Expected result                                                        |
| --- | ------------- | ---------------------------------------------------------------------- |
| 1   | `Hello`       | → `- Hello`                                                            |
| 2   | `- Hello`     | → `Hello` (remove prefix)                                              |
| 3   | `- [x] Hello` | → `Hello` (checklist variant treated as "has prefix")                  |
| 4   | `- [X] Hello` | → `Hello`                                                              |
| 5   | `1. Hello`    | → `- 1. Hello` (numbered list stripped by regex, then bullet added)    |
| 6   | `## Heading`  | → `- Heading` (heading stripped by `stripped` regex, bullet prepended) |
| 7   | `- [ ] task`  | → `task` (checkbox prefix removed)                                     |
| 8   | No editor     | No crash                                                               |

### 4.2 Numbered List

`toggleLinePrefix` with `"1. "`.

| #   | Line content | Expected result                                                                            |
| --- | ------------ | ------------------------------------------------------------------------------------------ |
| 1   | `Hello`      | → `1. Hello`                                                                               |
| 2   | `1. Hello`   | → `Hello`                                                                                  |
| 3   | `5. Hello`   | → `1. 5. Hello` — the regex only strips `1.` prefix exactly, `5.` not matched as hasPrefix |
| 4   | `- Hello`    | → `1. Hello` (bullet stripped by regex, numbered prepended)                                |
| 5   | `## Heading` | → `1. Heading`                                                                             |
| 6   | No editor    | No crash                                                                                   |

### 4.3 Indent / Outdent

| #   | Action  | Expected result                               |
| --- | ------- | --------------------------------------------- |
| 1   | Indent  | Calls Obsidian `editor:indent-list` command   |
| 2   | Outdent | Calls Obsidian `editor:unindent-list` command |

---

## Section 5 — Styles Group

### 5.1 Styles Scroll Up / Down

| #   | Current offset                       | Action                          | Expected result                              |
| --- | ------------------------------------ | ------------------------------- | -------------------------------------------- |
| 1   | 0                                    | Scroll Up                       | No-op (already at top; offset stays 0)       |
| 2   | 0                                    | Scroll Down                     | offset = 1; cards show Heading 2 + Heading 3 |
| 3   | 5                                    | Scroll Up                       | offset = 4                                   |
| 4   | 9 (max = STYLES_LIST.length − 2 = 9) | Scroll Down                     | No-op                                        |
| 5   | 3                                    | Scroll Up, Scroll Up, Scroll Up | offset = 0                                   |

### 5.2 Style Preview Cards (click to apply)

`styles-preview-0` applies `STYLES_LIST[offset]`, `styles-preview-1` applies `STYLES_LIST[offset + 1]`.

| #   | Offset | Card          | Line content       | Expected result                                           |
| --- | ------ | ------------- | ------------------ | --------------------------------------------------------- |
| 1   | 0      | 0 (Heading 1) | `Hello`            | → `# Hello`                                               |
| 2   | 0      | 0 (Heading 1) | `# Hello`          | → `Hello` (toggle off)                                    |
| 3   | 0      | 1 (Heading 2) | `Hello`            | → `## Hello`                                              |
| 4   | 2      | 0 (Heading 3) | `## Old`           | → `### Old`                                               |
| 5   | 9      | 0 (Code)      | "my code" selected | → `\`\`\`\nmy code\n\`\`\`` (has suffix, wraps selection) |
| 6   | 9      | 1 (Normal)    | `## Hello`         | → `Hello` (sets line, strips `#…` via replace)            |
| 7   | 0      | 0             | No editor          | No crash                                                  |

### 5.3 Styles Dropdown

Same logic as preview cards but shows full list; also includes "Clear Formatting" at bottom.

| #   | Item selected     | Line content    | Expected result                |
| --- | ----------------- | --------------- | ------------------------------ |
| 1   | Heading 1         | `Hello`         | → `# Hello`                    |
| 2   | Normal            | `## Hello`      | → `Hello`                      |
| 3   | Code (has suffix) | "text" selected | → `\`\`\`\ntext\n\`\`\``       |
| 4   | Clear Formatting  | `**bold**`      | → `bold`                       |
| 5   | No editor open    | Any item        | No crash (guard inside action) |

### 5.4 Active-state highlight (state tracking)

| #   | Cursor line     | Expected active card                                          |
| --- | --------------- | ------------------------------------------------------------- |
| 1   | `# Heading 1`   | Card showing Heading 1 is `onr-active`                        |
| 2   | `## Heading 2`  | If offset=0, card 1 is active; if offset=1, card 0 is active  |
| 3   | `Plain text`    | Card showing "Normal" is active (if visible in scroll window) |
| 4   | `### Heading 3` | Auto-scroll: offset set to 2, card 0 active                   |

---

## Section 6 — Font Family / Size / Color

### 6.1 Font Family Dropdown

| #   | Selection     | Action        | Expected result                                               |
| --- | ------------- | ------------- | ------------------------------------------------------------- |
| 1   | Text selected | Pick "Arial"  | `<span style="font-family:Arial">text</span>` wraps selection |
| 2   | No selection  | Pick "Arial"  | `vault.setConfig("fontText", "Arial")` called; label updated  |
| 3   | No editor     | Pick any font | Only `setConfig` path (no `replaceSelection`)                 |

### 6.2 Font Size Dropdown

| #   | Selection     | Action        | Expected result                              |
| --- | ------------- | ------------- | -------------------------------------------- |
| 1   | Text selected | Pick 24       | `<span style="font-size:24px">text</span>`   |
| 2   | No selection  | Pick 24       | `vault.setConfig("baseFontSize", 24)` called |
| 3   | No editor     | Pick any size | Only `setConfig` path                        |

### 6.3 Font Color Dropdown

| #   | Selection    | Color picked  | Expected result                              |
| --- | ------------ | ------------- | -------------------------------------------- |
| 1   | "hello"      | Red (#FF0000) | → `<span style="color:#FF0000">hello</span>` |
| 2   | No selection | Red           | Color swatch updated; no text inserted       |
| 3   | No editor    | Any           | No crash                                     |

---

## Section 7 — Align Dropdown

| #   | Selection     | Align option | Expected result                                                      |
| --- | ------------- | ------------ | -------------------------------------------------------------------- |
| 1   | Text selected | Left         | `<div style="text-align:left">\n\ntext\n\n</div>`                    |
| 2   | Text selected | Center       | `<div style="text-align:center">\n\ntext\n\n</div>`                  |
| 3   | Text selected | Right        | `<div style="text-align:right">\n\ntext\n\n</div>`                   |
| 4   | Text selected | Justify      | `<div style="text-align:justify">\n\ntext\n\n</div>`                 |
| 5   | No selection  | Left         | `<div style="text-align:left">current line text</div>` replaces line |
| 6   | No editor     | Any          | Notice "No active editor"                                            |

---

## Section 8 — Tags Group

### 8.1 Tag Rows (visible top 3: To Do, Important, Question)

`applyTag` is called. Each tag has its own notation.

#### 8.1.1 To Do tag (`tag-todo`, notation: `- [ ] `)

| #   | Line content  | Expected result                                      |
| --- | ------------- | ---------------------------------------------------- |
| 1   | `Hello`       | → `- [ ] Hello`                                      |
| 2   | `- [ ] Hello` | → `Hello` (toggle off)                               |
| 3   | `- [x] Hello` | → `Hello` (completed variant recognized)             |
| 4   | `- [X] Hello` | → `Hello`                                            |
| 5   | `- [✔] Hello` | → `Hello`                                            |
| 6   | `## Heading`  | → `- [ ] Heading` (heading stripped, todo prepended) |
| 7   | No editor     | No crash                                             |

#### 8.1.2 Important tag (`tag-important`, callout notation: `> [!important]\n> `)

| #   | Line content                           | Expected result                                                    |
| --- | -------------------------------------- | ------------------------------------------------------------------ |
| 1   | `Hello`                                | `> [!important]\n> ` inserted at cursor (prepended before "Hello") |
| 2   | `> [!important]` (cursor on this line) | Header line deleted; next line's `> ` prefix stripped              |
| 3   | `Plain line, cursor at end`            | Callout inserted at cursor position                                |
| 4   | No editor                              | No crash                                                           |

#### 8.1.3 Question tag (`tag-question`, callout notation: `> [!question]\n> `)

Same toggle logic as Important.

| #   | Line content    | Expected result                                          |
| --- | --------------- | -------------------------------------------------------- |
| 1   | `Hello`         | Callout `> [!question]\n> ` inserted at cursor           |
| 2   | `> [!question]` | Toggle off: header deleted, `> ` stripped from next line |
| 3   | No editor       | No crash                                                 |

### 8.2 Tags Dropdown (full list)

| #   | Tag selected    | Line content        | Expected result                           |
| --- | --------------- | ------------------- | ----------------------------------------- |
| 1   | To Do           | `Hello`             | → `- [ ] Hello`                           |
| 2   | Highlight       | "word" selected     | → `==word==` (inline toggle)              |
| 3   | Highlight       | `==word==` selected | → `word` (unwrap)                         |
| 4   | Critical        | `Hello`             | `> [!danger] Critical\n> ` at cursor      |
| 5   | Customize Tags… | Any                 | Notice "not yet implemented"              |
| 6   | No editor       | Any tag             | `applyTag` receives null editor; no crash |

### 8.3 Tag checkboxes (state indicator refresh)

| #   | Line content | Expected checkbox state (To Do row)                                                                                                            |
| --- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `- [ ] task` | Checkbox filled blue with checkmark                                                                                                            |
| 2   | `Hello`      | Checkbox empty white                                                                                                                           |
| 3   | `- [x] task` | Notation includes `- [ ] `; line contains `- [` which passes `includes("- [ ]")` check? No — `- [x]` does NOT contain `- [ ]`. Checkbox empty. |

> **Important edge-case:** `refreshTagChecks` checks `lineText.includes(notation.split("\n")[0].trim())`. For `tag-todo`, notation is `"- [ ] "`, first part trimmed = `"- [ ]"`. A completed `- [x] task` line does NOT include `"- [ ]"` literally, so the checkbox shows unchecked even if the task is done.

### 8.4 To Do Tag button (large button)

Same as `todo-tag` → `toggleLinePrefix(editor, "- [ ] ")`. Same test matrix as §8.1.1.

### 8.5 Find Tags button

| #   | Expected result                                                   |
| --- | ----------------------------------------------------------------- |
| 1   | Opens global search; after 300ms, search input populated with `#` |

---

## Section 9 — Email & Meetings

### 9.1 Email Page

| #   | Editor state        | Expected result                                     |
| --- | ------------------- | --------------------------------------------------- |
| 1   | Editor with content | Full note content copied to clipboard; Notice shown |
| 2   | Editor open, empty  | Empty string copied; Notice shown                   |
| 3   | No editor           | Empty string (`""`); Notice shown                   |

### 9.2 Meeting Details

| #   | Editor state | Expected result                                                         |
| --- | ------------ | ----------------------------------------------------------------------- |
| 1   | Editor open  | YAML frontmatter template inserted at cursor with today's date and time |
| 2   | No editor    | No crash (guard breaks early)                                           |

---

## Section 10 — Navigate Group

| #   | Button     | Expected result                   |
| --- | ---------- | --------------------------------- |
| 1   | Outline    | Calls `outline:open` command      |
| 2   | Fold All   | Calls `editor:fold-all` command   |
| 3   | Unfold All | Calls `editor:unfold-all` command |

---

## Section 11 — Format Painter (2-phase)

| #   | Phase 1 state                     | Phase 1 action       | Phase 2 state             | Phase 2 action       | Expected result                          |
| --- | --------------------------------- | -------------------- | ------------------------- | -------------------- | ---------------------------------------- |
| 1   | Cursor on `**bold**` line         | Click Format Painter | Select "target" text      | Click Format Painter | `**target**`                             |
| 2   | Cursor on `# Heading` line        | Click Format Painter | Select "target"           | Click                | `# target` (heading applied)             |
| 3   | Cursor on `## **bold heading**`   | Click                | Select "other"            | Click                | `## **other**`                           |
| 4   | Cursor on `*italic*` line         | Click                | Select "text"             | Click                | `*text*`                                 |
| 5   | Cursor on `<u>underline</u>` line | Click                | Select "text"             | Click                | `<u>text</u>`                            |
| 6   | Click Format Painter (phase 1)    | —                    | No selection, click again | Click                | Notice "select text first"; stays active |
| 7   | No editor                         | Click                | —                         | —                    | No crash; breaks early                   |

### 11.1 Multi-format combinations via Format Painter

| #   | Source line                             | Selected target | Expected applied format                  |
| --- | --------------------------------------- | --------------- | ---------------------------------------- |
| 1   | `**bold**`                              | "abc"           | `**abc**`                                |
| 2   | `*italic*`                              | "abc"           | `*abc*`                                  |
| 3   | `<u>under</u>`                          | "abc"           | `<u>abc</u>`                             |
| 4   | `**bold** and *italic*` (line has both) | "abc"           | `***abc***` (bold + italic both applied) |
| 5   | `## **bold**`                           | "abc"           | `## **abc**`                             |

> Format Painter reads all formats applied to the source text (`isBold`, `isItalic`, `isUnderline`, `isStrikethrough`, `isHighlight`, `headPrefix`, font size, font family, etc.). Each captured format is then checked against the paste target — only formats not already present on the target are applied; formats the target already has are left unchanged. Application order: underline → italic → bold → strikethrough → highlight → heading prefix.

### 11.2 Format Painter — OneNote-style drag-select (mouseup auto-apply)

Instead of clicking FP twice, the user can: click FP (phase 1 capture), then **drag-select** the target text. On `mouseup` outside a ribbon button, the format auto-applies and FP resets — no second click needed.

The mouseup handler fires in capture phase on the workspace element. It is skipped if the mouseup target is inside `[data-cmd]` (i.e. on a ribbon button), so click-based phase 2 still works.

| #   | Phase 1                     | Drag-select target                               | mouseup fires on       | Expected result                                                            |
| --- | --------------------------- | ------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------- |
| 1   | Capture `**bold**` line     | "normal target" — drag in editor                 | editor (`.cm-content`) | `**normal target**`; FP deactivated                                        |
| 2   | Capture `*italic*` line     | "text"                                           | editor                 | `*text*`; FP reset                                                         |
| 3   | Capture `## heading` line   | "text"                                           | editor                 | `## text`; FP reset                                                        |
| 4   | Capture bold line           | drag-select, mouseup on **ribbon button**        | ribbon `[data-cmd]`    | mouseup guard bails; click handler does phase 2 instead                    |
| 5   | Capture bold line           | no drag — just click in editor (empty selection) | editor                 | FP reset (`_onrFPActive = false`, `onr-active` removed), no format applied |
| 6   | Not active (FP not clicked) | any mouseup                                      | editor                 | Handler exits immediately — no effect                                      |

**FP state reset guarantee:** The reset (`_onrFPActive = false`, `_onrFP = null`, `onr-active` class removed) always runs before the early-return guard. Even if the selection is empty or the editor is unavailable, FP is deactivated and the button visual resets.

| #   | Condition at mouseup rAF                       | `_onrFPActive` after | `onr-active` on button after | Format applied? |
| --- | ---------------------------------------------- | -------------------- | ---------------------------- | --------------- |
| 1   | `fp` present, `ed` present, `sel` non-empty    | false                | NO                           | YES             |
| 2   | `fp` present, `ed` present, `sel` empty (`""`) | false                | NO                           | NO              |
| 3   | `fp` null                                      | false                | NO                           | NO              |
| 4   | `ed` null (no active editor)                   | false                | NO                           | NO              |

---

## Section 12 — Active State (UI toggle buttons)

These track what's at cursor and apply `onr-active` class.

| #   | Line content at cursor   | Button that should be active |
| --- | ------------------------ | ---------------------------- |
| 1   | `**hello**`              | Bold                         |
| 2   | `*hello*`                | Italic                       |
| 3   | `<u>hello</u>`           | Underline                    |
| 4   | `~~hello~~`              | Strikethrough                |
| 5   | `==hello==`              | Highlight                    |
| 6   | `<sub>x</sub>`           | Subscript                    |
| 7   | `<sup>x</sup>`           | Superscript                  |
| 8   | `- item`                 | Bullet List                  |
| 9   | `1. item`                | Numbered List                |
| 10  | `**bold** and *italic*`  | Both Bold AND Italic         |
| 11  | `**bold** ==highlight==` | Bold AND Highlight           |
| 12  | Plain text               | None of the above active     |

---

## Section 13 — Cross-section combinations (up to 5 actions)

| #   | Starting state        | Action 1                                  | Action 2                       | Action 3                 | Action 4       | Action 5  | Expected final state                                                                                             |
| --- | --------------------- | ----------------------------------------- | ------------------------------ | ------------------------ | -------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `Hello`, no sel       | Bold                                      | Italic                         | Strikethrough            | —              | —         | `~~~~****Hello****~~` inserted if all on same cursor position — each adds markers at cursor                      |
| 2   | Select "Hello"        | Bold                                      | Italic                         | —                        | —              | —         | `***Hello***`                                                                                                    |
| 3   | Select "Hello"        | Bold                                      | Italic                         | Strikethrough            | —              | —         | `~~***Hello***~~`                                                                                                |
| 4   | Select "Hello"        | Bold                                      | Italic                         | Underline                | —              | —         | `<u>***Hello***</u>`                                                                                             |
| 5   | Select "Hello"        | Bold                                      | Italic                         | Underline                | Strikethrough  | —         | `~~<u>***Hello***</u>~~`                                                                                         |
| 6   | `Hello`, cursor       | To Do Tag                                 | Bold (no sel)                  | —                        | —              | —         | `- [ ] Hello` on line; `****` inserted at cursor                                                                 |
| 7   | Select "Hello"        | Bold → active                             | Bold again (sel = `**Hello**`) | —                        | —              | —         | `Hello` (toggle off)                                                                                             |
| 8   | `- [ ] Hello`, cursor | Bullet List                               | —                              | —                        | —              | —         | `Hello` (removes `- [ ] ` prefix)                                                                                |
| 9   | `# Heading`, cursor   | Styles card 0 (H1)                        | —                              | —                        | —              | —         | `Heading` (toggle off heading)                                                                                   |
| 10  | `Hello`, cursor       | H1 style                                  | Bullet List                    | —                        | —              | —         | `- # Hello` — heading applied first; bullet applied on top; heading not stripped                                 |
| 11  | `Hello`, select       | Font family "Arial"                       | Font size 24                   | Bold                     | —              | —         | `**<span style="font-size:24px"><span style="font-family:Arial">Hello</span></span>**`                           |
| 12  | `Hello`, select       | Align Center                              | Bold                           | —                        | —              | —         | After align: `<div style="text-align:center">\n\nHello\n\n</div>`; Bold re-selects and wraps whatever's selected |
| 13  | No editor             | Bold                                      | Italic                         | Cut                      | Paste          | Align     | All no-ops, no crash                                                                                             |
| 14  | `Hello`, cursor       | Format Painter (phase 1, line `**bold**`) | → select "World"               | Format Painter (phase 2) | Bold (toggles) | Italic    | `***World***` after FP; Bold toggles to `World`; Italic wraps to `*World*`                                       |
| 15  | Select "Hello"        | Cut                                       | Paste                          | Bold                     | Strikethrough  | Highlight | "Hello" cut → pasted back → `**Hello**` → `~~**Hello**~~` → `==~~**Hello**~~==`                                  |

---

## Section 14 — Button Active State (cursor position → visual highlight)

`updateRibbonState` runs after every click/keyup on the workspace. It reads the **entire current line** at the cursor (not just the character under the cursor) and applies `onr-active` to buttons whose regex matches.

Buttons that track active state: **Bold, Italic, Underline, Strikethrough, Highlight, Subscript, Superscript, Bullet List, Numbered List, Styles preview cards (0 and 1).**

Buttons with **no** active state: Paste, Cut, Copy, Format Painter (only active during phase-1 capture), font picker, size picker, align, clear-formatting, clear-inline, tags, email, navigate.

---

### 14.1 Bold (`/\*\*(.*?)\*\*/` on `mdContent` — line with HTML tags stripped)

| #   | Cursor line text                               | Bold active? | Notes                                                                                                                                           |
| --- | ---------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `**hello**`                                    | YES          | Basic match                                                                                                                                     |
| 2   | `hello`                                        | NO           | No markers                                                                                                                                      |
| 3   | `**hello** world`                              | YES          | Partial bold on line                                                                                                                            |
| 4   | `world **hello**`                              | YES          | Bold anywhere on line                                                                                                                           |
| 5   | `*hello*`                                      | NO           | Single-star italic, not bold                                                                                                                    |
| 6   | `***hello***`                                  | YES          | Triple-star contains `**` markers                                                                                                               |
| 7   | `**` (empty bold)                              | NO           | `(.*?)` is lazy; empty match doesn't satisfy — actually `**` alone does not match `\*\*(.*?)\*\*` because there's no closing pair after content |
| 8   | `<span style="font-weight:bold">**hi**</span>` | YES          | HTML tags stripped first, `**hi**` remains                                                                                                      |
| 9   | `~~**bold+strike**~~`                          | YES          | Bold inside strikethrough                                                                                                                       |
| 10  | `## **heading bold**`                          | YES          | Heading prefix doesn't interfere                                                                                                                |

### 14.2 Italic (`/(?<!\*)\*((?!\*).+?)\*(?!\*)/` on `mdContent`)

| #   | Cursor line text      | Italic active? | Notes                                                                                                           |
| --- | --------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `*hello*`             | YES            | Single stars                                                                                                    |
| 2   | `hello`               | NO             |                                                                                                                 |
| 3   | `**hello**`           | NO             | Lookbehind `(?<!\*)` prevents match — `*` preceded by `*`                                                       |
| 4   | `***hello***`         | YES            | `***` — the middle `*` is single-star italic surrounded by `**` bold; regex finds `*hello*` between outer stars |
| 5   | `*hello* world`       | YES            |                                                                                                                 |
| 6   | `world *hello*`       | YES            |                                                                                                                 |
| 7   | `_hello_`             | NO             | Underscore italic not detected                                                                                  |
| 8   | `**bold** *italic*`   | YES            | Italic anywhere on line                                                                                         |
| 9   | `*a*b*c*`             | YES            | Matches first `*a*`                                                                                             |
| 10  | `## *italic heading*` | YES            |                                                                                                                 |

### 14.3 Underline (`/<u>/` on raw `line`)

| #   | Cursor line text           | Underline active? | Notes                          |
| --- | -------------------------- | ----------------- | ------------------------------ |
| 1   | `<u>hello</u>`             | YES               |                                |
| 2   | `hello`                    | NO                |                                |
| 3   | `<u>` (no close)           | YES               | Opening tag alone matches      |
| 4   | `**<u>bold under</u>**`    | YES               |                                |
| 5   | `&lt;u&gt;hello&lt;/u&gt;` | NO                | Escaped entities, not raw HTML |
| 6   | `<U>hello</U>`             | NO                | Regex is case-sensitive        |

### 14.4 Strikethrough (`/~~(.*?)~~/` on `mdContent`)

| #   | Cursor line text      | Strikethrough active? | Notes                                           |
| --- | --------------------- | --------------------- | ----------------------------------------------- |
| 1   | `~~hello~~`           | YES                   |                                                 |
| 2   | `hello`               | NO                    |                                                 |
| 3   | `~~hello~~ world`     | YES                   |                                                 |
| 4   | `**~~bold+strike~~**` | YES                   |                                                 |
| 5   | `~hello~`             | NO                    | Single tilde not matched                        |
| 6   | `~~~~` (empty)        | YES                   | `(.*?)` matches empty string between `~~` pairs |

### 14.5 Highlight (`/==(.*?)==/` on `mdContent`)

| #   | Cursor line text         | Highlight active? | Notes                  |
| --- | ------------------------ | ----------------- | ---------------------- |
| 1   | `==hello==`              | YES               |                        |
| 2   | `hello`                  | NO                |                        |
| 3   | `==hello== world`        | YES               |                        |
| 4   | `**==bold+highlight==**` | YES               |                        |
| 5   | `=hello=`                | NO                | Single `=` not matched |
| 6   | `====` (empty)           | YES               | Empty match            |

### 14.6 Subscript — cursor-position-aware detection

**Implementation:** cursor ch position is checked against every `<sub>…</sub>` span on the line. Active only when `ch > openTagEnd && ch < closeTagEnd`, i.e. cursor is strictly inside the content or closing tag — NOT inside the opening tag itself, and NOT past the last character of `</sub>`.

Active range for `x<sub>2</sub>` (ch 0-indexed):

- `<sub>` occupies ch 1–5, content at ch 6, `</sub>` ends at ch 12
- Active when `ch > 5` (past the `>` of `<sub>`) AND `ch < 13` (before ch 13 which is past `</sub>`)
- Equivalently: ch 6–12 inclusive are active; ch 0–5 and ch 13+ are inactive

| #   | Line                       | Cursor ch         | Subscript active? | Notes                                        |
| --- | -------------------------- | ----------------- | ----------------- | -------------------------------------------- |
| 1   | `x<sub>2</sub>`            | 0                 | NO                | Before opening tag                           |
| 2   | `x<sub>2</sub>`            | 1                 | NO                | At `<` of `<sub>`                            |
| 3   | `x<sub>2</sub>`            | 5                 | NO                | At `>` of `<sub>` — still inside opening tag |
| 4   | `x<sub>2</sub>`            | 6                 | YES               | First char of content                        |
| 5   | `x<sub>2</sub>`            | 7                 | YES               | Inside content                               |
| 6   | `x<sub>2</sub>`            | 12                | YES               | Last char of `</sub>`                        |
| 7   | `x<sub>2</sub>`            | 13                | NO                | Past closing tag                             |
| 8   | `x2`                       | any               | NO                | No tag present                               |
| 9   | `<sub>2</sub><sub>3</sub>` | inside first span | YES               | Multiple spans: each checked independently   |
| 10  | `<sub>2</sub><sub>3</sub>` | between spans     | NO                | Gap between closing and opening tag          |
| 11  | `<SUB>2</SUB>`             | inside            | NO                | Case-sensitive — uppercase not matched       |

### 14.7 Superscript — cursor-position-aware detection

Same algorithm as subscript, applied to `<sup>…</sup>`.

| #   | Line            | Cursor ch | Superscript active? | Notes                 |
| --- | --------------- | --------- | ------------------- | --------------------- |
| 1   | `x<sup>2</sup>` | 0         | NO                  | Before tag            |
| 2   | `x<sup>2</sup>` | 5         | NO                  | At `>` of `<sup>`     |
| 3   | `x<sup>2</sup>` | 6         | YES                 | Content start         |
| 4   | `x<sup>2</sup>` | 12        | YES                 | Last char of `</sup>` |
| 5   | `x<sup>2</sup>` | 13        | NO                  | Past closing tag      |
| 6   | `x2`            | any       | NO                  | No tag                |
| 7   | `<SUP>`         | inside    | NO                  | Case-sensitive        |

### 14.8 Bullet List (`/^(\s*)- /` on raw `line`)

| #   | Cursor line text   | Bullet active? | Notes                                      |
| --- | ------------------ | -------------- | ------------------------------------------ |
| 1   | `- item`           | YES            |                                            |
| 2   | `item`             | NO             |                                            |
| 3   | `  - indented`     | YES            | Leading spaces allowed                     |
| 4   | `- [ ] checkbox`   | YES            | Checkbox prefix starts with `- `           |
| 5   | `- [x] done`       | YES            |                                            |
| 6   | `1. numbered`      | NO             |                                            |
| 7   | `-item` (no space) | NO             | Requires `- ` with space                   |
| 8   | `## - heading`     | NO             | `^` anchors to line start; `#` comes first |

### 14.9 Numbered List (`/^(\s*)\d+\. /` on raw `line`)

| #   | Cursor line text    | Numbered active? | Notes                            |
| --- | ------------------- | ---------------- | -------------------------------- |
| 1   | `1. item`           | YES              |                                  |
| 2   | `42. item`          | YES              | Any digit(s)                     |
| 3   | `  1. indented`     | YES              | Leading spaces allowed           |
| 4   | `- item`            | NO               |                                  |
| 5   | `1.item` (no space) | NO               | Requires `\d+\. ` with dot+space |
| 6   | `## 1. heading`     | NO               | `^` anchors; `#` comes first     |

### 14.10 Styles Preview Cards (heading detection)

The auto-scroll sets `stylesOffset = headLevel - 1`, clamped to `[0, STYLES_LIST.length - 2]` (max 9). Card `i` is active when `STYLES_LIST[offset + i].prefix === "#".repeat(headLevel) + " "` OR (headLevel=0 AND label="Normal").

| #   | Cursor line                                          | headLevel | stylesOffset after | Card 0 shows | Card 1 shows | Active card                         |
| --- | ---------------------------------------------------- | --------- | ------------------ | ------------ | ------------ | ----------------------------------- |
| 1   | `# Heading`                                          | 1         | 0                  | H1           | H2           | Card 0 (H1)                         |
| 2   | `## Heading`                                         | 2         | 1                  | H2           | H3           | Card 0 (H2)                         |
| 3   | `### Heading`                                        | 3         | 2                  | H3           | H4           | Card 0 (H3)                         |
| 4   | `#### Heading`                                       | 4         | 3                  | H4           | H5           | Card 0 (H4)                         |
| 5   | `##### Heading`                                      | 5         | 4                  | H5           | H6           | Card 0 (H5)                         |
| 6   | `###### Heading`                                     | 6         | 5                  | H6           | Page Title   | Card 0 (H6)                         |
| 7   | `Plain text`                                         | 0         | unchanged          | (whatever)   | (whatever)   | Card showing "Normal" if visible    |
| 8   | `- item`                                             | 0         | unchanged          | (whatever)   | (whatever)   | Card showing "Normal" if visible    |
| 9   | `#not-heading` (no space after #)                    | 0         | unchanged          | (whatever)   | (whatever)   | No card active                      |
| 10  | User manually scrolled to offset=5, cursor on `# H1` | 1         | set to 0           | H1           | H2           | Card 0 (H1) — auto-scroll overrides |

> **Important:** Auto-scroll only fires when `newOffset !== this.stylesOffset`. If you're already at the right offset, no re-render occurs.

---

### 14.11 Combinations — multiple buttons active simultaneously

All active-state checks run independently on the same line. Multiple buttons can be active at once.

| #   | Cursor line text                                   | Active buttons                                        |
| --- | -------------------------------------------------- | ----------------------------------------------------- |
| 1   | `**bold**`                                         | Bold                                                  |
| 2   | `*italic*`                                         | Italic                                                |
| 3   | `**bold** and *italic*`                            | Bold + Italic                                         |
| 4   | `**bold** ==highlight==`                           | Bold + Highlight                                      |
| 5   | `*italic* ~~strike~~`                              | Italic + Strikethrough                                |
| 6   | `**bold** *italic* ~~strike~~ ==highlight==`       | Bold + Italic + Strikethrough + Highlight             |
| 7   | `<u>under</u> **bold**`                            | Underline + Bold                                      |
| 8   | `x<sub>2</sub> x<sup>3</sup>`                      | Subscript + Superscript                               |
| 9   | `- **bold item**`                                  | Bullet List + Bold                                    |
| 10  | `1. *italic item*`                                 | Numbered List + Italic                                |
| 11  | `## **bold heading**`                              | Bold + Styles card for H2 (if visible)                |
| 12  | `- [ ] **bold task**`                              | Bullet List + Bold                                    |
| 13  | `**bold** *italic* <u>under</u> ~~strike~~ ==hi==` | Bold + Italic + Underline + Strikethrough + Highlight |
| 14  | `- <u>**bold under list**</u>`                     | Bullet List + Bold + Underline                        |
| 15  | `1. ~~**bold strike numbered**~~`                  | Numbered List + Bold + Strikethrough                  |

---

### 14.12 False-positive / false-negative edge cases

| #   | Cursor line text                    | Button        | Expected state | Why                                                                                         |
| --- | ----------------------------------- | ------------- | -------------- | ------------------------------------------------------------------------------------------- |
| 1   | `**` (just two stars)               | Bold          | NO             | `\*\*(.*?)\*\*` needs two separate `**` pairs                                               |
| 2   | `* item` (unordered list with star) | Italic        | NO             | Lookbehind `(?<!\*)` and lookahead `(?!\*)` together with `(.+?)` prevents space-only match |
| 3   | `_italic_`                          | Italic        | NO             | Underscore syntax not detected                                                              |
| 4   | `***text***`                        | Bold          | YES; Italic    | YES — both match                                                                            |
| 5   | `==` (just two equals, no close)    | Highlight     | NO             | Needs matching `==…==`                                                                      |
| 6   | `<u>text` (no closing tag)          | Underline     | YES            | Only checks for `<u>` open tag                                                              |
| 7   | `~~` (just two tildes)              | Strikethrough | NO             | Needs `~~…~~` pair                                                                          |
| 8   | ` - item` (leading space)           | Bullet        | YES            | `^(\s*)- ` allows leading whitespace                                                        |
| 9   | `text - note` (dash mid-line)       | Bullet        | NO             | `^` anchors to line start                                                                   |
| 10  | `100. item`                         | Numbered      | YES            | `\d+` matches multiple digits                                                               |

---

## Section 15 — Re-click (toggle off) and repeated clicks

### How each toggle works

**`toggleInline(open, close?)`** — for Bold, Italic, Underline, Strikethrough, Highlight:

- With selection: if selection **starts with** `open` AND **ends with** `close` → unwrap (strip markers). Otherwise → wrap.
- Without selection: always inserts `open + close` and places cursor between them. **Never toggles off** without a selection.

**`toggleSubSup(tag)`** — for Subscript and Superscript only:

- **Cursor-aware, not selection-aware.** Behavior is determined by where the cursor sits in the line.
- **If cursor is inside `<sub>…</sub>` or `<sup>…</sup>`** (past the opening `>`, before the end of the closing tag): **toggle off** — strips the tags, keeps the inner content. Cursor position adjusts.
- **If cursor is inside the *other* tag** (e.g. inside `<sup>` when clicking sub): **convert** — replaces the tag pair in-place with the clicked tag. Sub and sup cannot coexist on the same span.
- **If cursor is outside both**: **toggle on** — wraps selection in the tag, or inserts an empty `<tag></tag>` pair at the cursor with cursor positioned inside.
- **Sub and sup are mutually exclusive.** A span of text can be either `<sub>` or `<sup>`, never both, never nested.

**`toggleLinePrefix(prefix)`** — for Bullet List, Numbered List, To Do, heading styles:

- If line **starts with** `prefix` exactly → strip it.
- Otherwise → strip any existing block-level prefix (heading, list, callout, checkbox) via regex, then prepend `prefix`.

**`applyTag`** — for tag rows:

- If line starts with the tag's first notation line → toggle off (delete header + strip continuation prefix on next line for callouts).
- Else for todo-family → `toggleLinePrefix`. For all other tags → insert notation at cursor.

---

### 15.1 Bold — re-click and repeated clicks

| #   | State before click            | Selection                      | Click | Result                             | Button state after         |
| --- | ----------------------------- | ------------------------------ | ----- | ---------------------------------- | -------------------------- |
| 1   | `hello`                       | "hello"                        | Bold  | `**hello**`                        | Active                     |
| 2   | `**hello**`                   | "**hello**"                    | Bold  | `hello`                            | Inactive                   |
| 3   | `**hello**`                   | "hello" (inner only, no stars) | Bold  | `**hello**` (wraps again)          | Active                     |
| 4   | `hello`                       | None                           | Bold  | `****` inserted, cursor inside     | Active (line now has `**`) |
| 5   | `****` (cursor between pairs) | None                           | Bold  | `******` inserted again at cursor  | Active                     |
| 6   | `**hello**`                   | None (cursor anywhere on line) | Bold  | `****` inserted at cursor position | Active                     |

> Re-click without selection always **adds** new markers — it never removes existing ones.

---

### 15.2 Italic — re-click

| #   | State before  | Selection       | Click  | Result                                                                |
| --- | ------------- | --------------- | ------ | --------------------------------------------------------------------- |
| 1   | `hello`       | "hello"         | Italic | `*hello*`                                                             |
| 2   | `*hello*`     | "_hello_"       | Italic | `hello`                                                               |
| 3   | `*hello*`     | "hello" (inner) | Italic | `*hello*` (wraps again → `**hello**` — now looks like bold!)          |
| 4   | `***hello***` | "**_hello_**"   | Italic | sel starts with `*`, ends with `*` → `**hello**` (one layer stripped) |
| 5   | `hello`       | None            | Italic | `**` inserted, cursor inside                                          |
| 6   | `*hello*`     | None            | Italic | `**` inserted at cursor — doesn't unwrap                              |

> **Case 3 note:** Selecting only the inner content and re-clicking italic wraps again. This is the correct behavior per `toggleInline` but may look like "bold" because the result is `**hello**`.

---

### 15.3 Underline — re-click

| #   | State before   | Selection       | Click     | Result                                               |
| --- | -------------- | --------------- | --------- | ---------------------------------------------------- |
| 1   | `hello`        | "hello"         | Underline | `<u>hello</u>`                                       |
| 2   | `<u>hello</u>` | `<u>hello</u>`  | Underline | `hello`                                              |
| 3   | `<u>hello</u>` | "hello" (inner) | Underline | `<u>hello</u>` (wraps again → `<u><u>hello</u></u>`) |
| 4   | `hello`        | None            | Underline | `<u></u>` inserted, cursor inside                    |

---

### 15.4 Strikethrough — re-click

| #   | State before | Selection       | Click  | Result                                      |
| --- | ------------ | --------------- | ------ | ------------------------------------------- |
| 1   | `hello`      | "hello"         | Strike | `~~hello~~`                                 |
| 2   | `~~hello~~`  | "~~hello~~"     | Strike | `hello`                                     |
| 3   | `~~hello~~`  | "hello" (inner) | Strike | `~~hello~~` (double-wrap → `~~~~hello~~~~`) |
| 4   | `hello`      | None            | Strike | `~~~~` inserted, cursor inside              |

---

### 15.5 Highlight — re-click

| #   | State before | Selection       | Click     | Result                                      |
| --- | ------------ | --------------- | --------- | ------------------------------------------- |
| 1   | `hello`      | "hello"         | Highlight | `==hello==`                                 |
| 2   | `==hello==`  | "==hello=="     | Highlight | `hello`                                     |
| 3   | `==hello==`  | "hello" (inner) | Highlight | `==hello==` (double-wrap → `====hello====`) |
| 4   | `hello`      | None            | Highlight | `====` inserted, cursor inside              |

---

### 15.6 Bullet List — re-click and cross-toggle

| #   | State before  | Click         | Result                        | Notes                                           |
| --- | ------------- | ------------- | ----------------------------- | ----------------------------------------------- | ------------------------ |
| 1   | `hello`       | Bullet        | `- hello`                     | Add prefix                                      |
| 2   | `- hello`     | Bullet        | `hello`                       | Toggle off                                      |
| 3   | `- hello`     | Bullet        | `hello`                       | Second bullet click = same as row 2             |
| 4   | `- hello`     | Bullet (×3)   | `hello` → `- hello` → `hello` | Alternates                                      |
| 5   | `- hello`     | Numbered List | `1. hello`                    | Strips `- `, prepends `1. `                     |
| 6   | `1. hello`    | Bullet        | `- hello`                     | Strips `\d+\. `, prepends `- `                  |
| 7   | `- [ ] hello` | Bullet        | `hello`                       | Checkbox variant treated as "has bullet prefix" |
| 8   | `## hello`    | Bullet        | `- hello`                     | Heading stripped, bullet prepended              |
| 9   | `- hello`     | To Do         | `- [ ] hello`                 | `- ` stripped (matches `                        | - `), `- [ ] ` prepended |
| 10  | `- hello`     | Numbered (×2) | `1. hello` → `hello`          | First converts, second removes                  |

---

### 15.7 Numbered List — re-click and cross-toggle

| #   | State before  | Click    | Result        | Notes                                                        |
| --- | ------------- | -------- | ------------- | ------------------------------------------------------------ |
| 1   | `hello`       | Numbered | `1. hello`    |                                                              |
| 2   | `1. hello`    | Numbered | `hello`       | Toggle off                                                   |
| 3   | `5. hello`    | Numbered | `1. 5. hello` | `5.` NOT stripped (only `1.` literal matched as `hasPrefix`) |
| 4   | `1. hello`    | Bullet   | `- hello`     |                                                              |
| 5   | `## hello`    | Numbered | `1. hello`    | Heading stripped                                             |
| 6   | `- [ ] hello` | Numbered | `1. hello`    | Checkbox stripped, numbered prepended                        |

---

### 15.8 To Do Tag / todo-tag button — re-click

| #   | State before  | Click      | Result                                                     |
| --- | ------------- | ---------- | ---------------------------------------------------------- |
| 1   | `hello`       | To Do      | `- [ ] hello`                                              |
| 2   | `- [ ] hello` | To Do      | `hello`                                                    |
| 3   | `- [x] hello` | To Do      | `hello` (completed variant stripped)                       |
| 4   | `- [X] hello` | To Do      | `hello`                                                    |
| 5   | `- [✔] hello` | To Do      | `hello`                                                    |
| 6   | `- hello`     | To Do      | `- [ ] hello` (`- ` stripped by regex, `- [ ] ` prepended) |
| 7   | `1. hello`    | To Do      | `- [ ] hello`                                              |
| 8   | `## hello`    | To Do      | `- [ ] hello`                                              |
| 9   | `- [ ] hello` | To Do (×2) | `hello` → `- [ ] hello` (alternates)                       |

---

### 15.9 Styles cards — re-click (heading toggle)

Style cards use `toggleLinePrefix(s.prefix)` for heading styles, and `editor.setLine(line.replace(/^#{1,6}\s+/, ""))` for Normal, and `replaceSelection(prefix + sel + suffix)` for Code.

| #   | Card shown        | State before      | Click    | Result                                               |
| --- | ----------------- | ----------------- | -------- | ---------------------------------------------------- |
| 1   | Heading 1         | `hello`           | Click    | `# hello`                                            |
| 2   | Heading 1         | `# hello`         | Click    | `hello` (toggle off)                                 |
| 3   | Heading 1         | `# hello`         | Click ×2 | `hello` → `# hello`                                  |
| 4   | Heading 2         | `# hello`         | Click    | `## hello` (H1 stripped, H2 prepended)               |
| 5   | Heading 3         | `## hello`        | Click    | `### hello`                                          |
| 6   | Normal            | `## hello`        | Click    | `hello` (strip heading via replace)                  |
| 7   | Normal            | `hello`           | Click    | `hello` (no-op — replace finds no `#`)               |
| 8   | Normal            | `# hello`         | Click ×2 | `hello` → `hello` (idempotent)                       |
| 9   | Code (has suffix) | "selected text"   | Click    | ` ```\nselected text\n``` `                          |
| 10  | Code              | `# hello`, no sel | Click    | ` ```\n\n``` ` (empty selection, prefix+suffix only) |

---

### 15.10 Styles dropdown — picking different items

Each item in the dropdown uses identical logic to the preview cards.

| #   | Current line     | First pick | Second pick      | Final result                                                                        |
| --- | ---------------- | ---------- | ---------------- | ----------------------------------------------------------------------------------- |
| 1   | `hello`          | H1         | H2               | `## hello` (H1 prefix stripped, H2 prepended)                                       |
| 2   | `hello`          | H1         | H1               | `hello` (toggle off on second click)                                                |
| 3   | `# hello`        | H3         | H1               | `# hello` — H3 strips `# `, prepends `### `; then H1 strips `### `, prepends `# `   |
| 4   | `hello`          | H1         | Normal           | `hello` (H1 applied, then Normal strips it)                                         |
| 5   | `hello`          | Normal     | H2               | `## hello`                                                                          |
| 6   | `hello`          | Code       | H1               | ` ```\nhello\n``` ` then `# \`\`\`\nhello\n\`\`\`` — second click goes line-by-line |
| 7   | `hello`          | H1         | Clear Formatting | `hello`                                                                             |
| 8   | `**bold** hello` | H2         | Clear Formatting | `## **bold** hello` → `bold hello`                                                  |

---

### 15.11 Font Family — picking different values / re-picking same

| #   | Selection | Pick 1 | Pick 2  | Result                                                                                                             |
| --- | --------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | "hello"   | Arial  | Verdana | `<span style="font-family:Verdana"><span style="font-family:Arial">hello</span></span>` — each wrap is independent |
| 2   | "hello"   | Arial  | Arial   | `<span style="font-family:Arial"><span style="font-family:Arial">hello</span></span>` — double wrap, no dedup      |
| 3   | None      | Arial  | Verdana | `setConfig("fontText","Verdana")` — last pick wins, label updated                                                  |
| 4   | None      | Arial  | Arial   | `setConfig` called twice with same value — no visible change                                                       |

---

### 15.12 Font Size — picking different values / re-picking same

| #   | Selection | Pick 1 | Pick 2 | Result                                                                          |
| --- | --------- | ------ | ------ | ------------------------------------------------------------------------------- |
| 1   | "hello"   | 12     | 24     | `<span style="font-size:24px"><span style="font-size:12px">hello</span></span>` |
| 2   | "hello"   | 12     | 12     | Double wrap at same size                                                        |
| 3   | None      | 12     | 24     | `setConfig("baseFontSize", 24)` — label shows 24                                |

---

### 15.13 Font Color — picking different values / re-picking same

| #   | Selection | Pick 1 | Pick 2 | Result                                                                        |
| --- | --------- | ------ | ------ | ----------------------------------------------------------------------------- |
| 1   | "hello"   | Red    | Blue   | `<span style="color:#0070C0"><span style="color:#FF0000">hello</span></span>` |
| 2   | "hello"   | Red    | Red    | Double wrap, same color                                                       |
| 3   | None      | Red    | Blue   | Swatch changes to Blue; no text insertion                                     |

---

### 15.14 Align — picking different values / re-clicking same

Each align action wraps selection in a `<div>` or replaces the line — it does not detect existing alignment and does not toggle.

| #   | Selection            | Pick 1 | Pick 2       | Result                                                                                                                                                                 |
| --- | -------------------- | ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "hello"              | Left   | Center       | `<div style="text-align:center">\n\n<div style="text-align:left">\n\nhello\n\n</div>\n\n</div>` — nested divs                                                          |
| 2   | "hello"              | Left   | Left         | Same nesting with two identical divs                                                                                                                                   |
| 3   | None (line: `hello`) | Left   | Center       | Line becomes `<div style="text-align:left">hello</div>` then: that entire line becomes `<div style="text-align:center"><div style="text-align:left">hello</div></div>` |
| 4   | "hello"              | Left   | — (re-click) | Always wraps; no toggle-off exists                                                                                                                                     |

---

### 15.15 Tag rows — re-clicking and switching between tags on same line

| #   | Current line                                                    | Click                    | Result                                                                                | Notes                                     |
| --- | --------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | `hello`                                                         | To Do                    | `- [ ] hello`                                                                         |                                           |
| 2   | `- [ ] hello`                                                   | To Do (again)            | `hello`                                                                               | Toggle off                                |
| 3   | `hello`                                                         | Important                | `> [!important]\n> ` inserted at cursor                                               | Callout at cursor                         |
| 4   | `> [!important]` (line 0), `> hello` (line 1), cursor on line 0 | Important                | Line 0 deleted; `> ` stripped from line 1 → `hello`                                   | Toggle off callout                        |
| 5   | `hello`, cursor                                                 | Important, then Question | Two callouts inserted at cursor position back-to-back                                 | No mutual exclusion                       |
| 6   | `- [ ] hello`                                                   | Question                 | `> [!question]\n> ` inserted at current cursor position within the checkbox line      | Tag inserted, checkbox prefix not removed |
| 7   | `> [!question]` cursor on it                                    | Important                | Important notation inserted at cursor (doesn't detect or remove the question callout) | No cross-tag awareness                    |
| 8   | `> [!important]` cursor                                         | Important                | Toggle off: deletes that line, strips `> ` from next line                             |                                           |

---

### 15.16 Format Painter — re-click sequences

| #   | Sequence                                                                      | Expected                                                                                    |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Click FP (phase 1) → click FP again before selecting                          | Notice "select text first"; stays active (button remains `onr-active`)                      |
| 2   | Click FP (phase 1) → select text → click FP (phase 2) → click FP again        | Phase 3 starts a new phase 1 (FPActive was reset); captures format from new cursor position |
| 3   | Click FP twice rapidly with no selection in between                           | First click sets phase 1 (active); second click: no selection → Notice, stays active        |
| 4   | Click FP (phase 1) → drag-select → mouseup in editor                          | Format applied; FP resets automatically — no second click needed                            |
| 5   | Click FP (phase 1) → drag-select → mouseup ON ribbon button                   | mouseup guard skips auto-apply; ribbon button click fires as phase 2 instead                |
| 6   | Click FP (phase 1) → click elsewhere in editor (no selection) → mouseup fires | FP resets (`_onrFPActive = false`, button `onr-active` removed), no format applied          |
| 7   | Click FP (phase 1) → drag-select → mouseup → immediately check state          | `_onrFPActive === false` AND `onr-active` absent — state always clean after mouseup path    |

---

## Section 16 — All menu items: re-pick same / pick different value

This section exhaustively covers every dropdown/menu in the Home tab. For each, the question is: _what happens if you pick the same item twice, or switch between items?_ It also clarifies which controls have **no dropdown** despite showing a `▾` caret.

---

### Dropdown inventory

| Control                                          | Has dropdown?                                            | Items                                                  |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------ |
| Paste (▾ sub-button)                             | YES                                                      | Paste / Paste as Plain Text / Paste Special (disabled) |
| Cut                                              | NO — direct action                                       | —                                                      |
| Copy                                             | NO — direct action                                       | —                                                      |
| Format Painter                                   | NO — two-phase click, not a menu                         | —                                                      |
| Font Family picker                               | YES                                                      | 12 fonts                                               |
| Font Size picker                                 | YES                                                      | 16 sizes                                               |
| Bullet List (▾ decorative)                       | **NO** — single command                                  | —                                                      |
| Numbered List (▾ decorative)                     | **NO** — single command                                  | —                                                      |
| Outdent                                          | NO                                                       | —                                                      |
| Indent                                           | NO                                                       | —                                                      |
| Clear Formatting                                 | NO                                                       | —                                                      |
| Bold / Italic / Underline / Strike / Sub / Super | NO                                                       | —                                                      |
| Highlight button (▾ is separate area)            | **NO** — single command on main area; `▾` has no handler | —                                                      |
| Font Color (▾ area)                              | YES                                                      | 10 colors                                              |
| Align (▾ button)                                 | YES                                                      | Left / Center / Right / Justify                        |
| Clear Inline (×)                                 | NO                                                       | —                                                      |
| Styles scroll ▲ / ▼                              | NO — direct scroll                                       | —                                                      |
| Styles preview card 0 / 1                        | NO — direct apply                                        | —                                                      |
| Styles dropdown (▾)                              | YES                                                      | 11 styles + Clear Formatting                           |
| Tag row (To Do / Important / Question)           | NO — direct apply                                        | —                                                      |
| Tags dropdown (▾)                                | YES                                                      | 27 tags + Customize Tags                               |
| To Do Tag button                                 | NO — direct apply                                        | —                                                      |
| Find Tags                                        | NO — direct action                                       | —                                                      |
| Email Page                                       | NO — direct action                                       | —                                                      |
| Meeting Details                                  | NO — direct action                                       | —                                                      |
| Outline / Fold All / Unfold All                  | NO — direct action                                       | —                                                      |

---

### 16.1 Paste Dropdown — all 3 items, re-pick, cross-pick

**Items:** Paste · Paste as Plain Text · Paste Special (disabled)

| #   | Clipboard        | Selection | Item picked                    | Result                                                           |
| --- | ---------------- | --------- | ------------------------------ | ---------------------------------------------------------------- |
| 1   | `hello`          | None      | Paste                          | `hello` inserted at cursor                                       |
| 2   | `hello`          | None      | Paste (×2)                     | `hellohello` — each pick inserts independently                   |
| 3   | `hello`          | "world"   | Paste                          | `world` replaced with `hello`                                    |
| 4   | `<b>hi</b>`      | None      | Paste                          | `<b>hi</b>` inserted raw (no stripping)                          |
| 5   | `<b>hi</b>`      | None      | Paste as Plain Text            | `hi` inserted (HTML stripped)                                    |
| 6   | `line1\r\nline2` | None      | Paste as Plain Text            | `line1\nline2` (`\r\n` → `\n`)                                   |
| 7   | `<b>hi</b>`      | None      | Paste then Paste as Plain Text | `<b>hi</b>hi` — two separate insertions at cursor                |
| 8   | `hello`          | None      | Paste as Plain Text (×2)       | `hellohello`                                                     |
| 9   | Any              | Any       | Paste Special                  | Disabled — no action, no close                                   |
| 10  | `hello`          | "world"   | Paste as Plain Text            | `world` replaced with `hello` (same as Paste — no HTML to strip) |

---

### 16.2 Font Family Dropdown — all 12 items, re-pick, cross-pick

**Items:** Segoe UI · Arial · Calibri · Cambria · Consolas · Courier New · Georgia · Helvetica · Times New Roman · Trebuchet MS · Verdana · Comic Sans MS

**With selection — wraps in `<span style="font-family:X">sel</span>`:**

| #   | Selection                                                            | Pick 1   | Pick 2  | Final text in editor                                                                                           |
| --- | -------------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | "hello"                                                              | Arial    | —       | `<span style="font-family:Arial">hello</span>`                                                                 |
| 2   | "hello"                                                              | Arial    | Arial   | `<span style="font-family:Arial"><span style="font-family:Arial">hello</span></span>` (double wrap — no dedup) |
| 3   | "hello"                                                              | Arial    | Verdana | `<span style="font-family:Verdana"><span style="font-family:Arial">hello</span></span>`                        |
| 4   | `<span style="font-family:Arial">hello</span>` (whole span selected) | Verdana  | —       | `<span style="font-family:Verdana"><span style="font-family:Arial">hello</span></span>`                        |
| 5   | "hello"                                                              | Consolas | Georgia | Two nested spans                                                                                               |

**Without selection — calls `setConfig("fontText", X)` and triggers css-change:**

| #   | Pick 1   | Pick 2   | Font label shows | Config written                               |
| --- | -------- | -------- | ---------------- | -------------------------------------------- |
| 6   | Segoe UI | —        | "Segoe UI"       | `fontText: "Segoe UI"`                       |
| 7   | Segoe UI | Arial    | "Arial"          | Last pick wins: `fontText: "Arial"`          |
| 8   | Arial    | Arial    | "Arial"          | Same value written twice — no visible change |
| 9   | Consolas | Segoe UI | "Segoe UI"       | Reverts to default appearance                |

---

### 16.3 Font Size Dropdown — all 16 sizes, re-pick, cross-pick

**Sizes:** 8 · 9 · 10 · 11 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 36 · 48 · 72

**With selection — wraps in `<span style="font-size:Xpx">sel</span>`:**

| #   | Selection                                         | Pick 1 | Pick 2 | Result                                                                                          |
| --- | ------------------------------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------- |
| 1   | "hello"                                           | 24     | —      | `<span style="font-size:24px">hello</span>`                                                     |
| 2   | "hello"                                           | 24     | 24     | Double wrap, same size                                                                          |
| 3   | "hello"                                           | 12     | 24     | `<span style="font-size:24px"><span style="font-size:12px">hello</span></span>`                 |
| 4   | "hello"                                           | 72     | 8      | Nested spans: 8px outer, 72px inner                                                             |
| 5   | `<span style="font-size:12px">hi</span>` selected | 24     | —      | Wraps entire span: `<span style="font-size:24px"><span style="font-size:12px">hi</span></span>` |

**Without selection — calls `setConfig("baseFontSize", X)`:**

| #   | Pick 1 | Pick 2 | Size label shows | Config written     |
| --- | ------ | ------ | ---------------- | ------------------ |
| 6   | 16     | —      | "16"             | `baseFontSize: 16` |
| 7   | 16     | 24     | "24"             | Last pick wins     |
| 8   | 24     | 16     | "16"             | Reverts            |
| 9   | 8      | 8      | "8"              | Same value twice   |

---

### 16.4 Font Color Dropdown — all 10 colors, re-pick, cross-pick

**Colors:** Black · Dark Red · Red · Orange · Yellow · Green · Blue · Purple · White · Gray

**With selection — wraps in `<span style="color:X">sel</span>`:**

| #   | Selection                                        | Pick 1 | Pick 2 | Result                                                                                                           |
| --- | ------------------------------------------------ | ------ | ------ | ---------------------------------------------------------------------------------------------------------------- |
| 1   | "hello"                                          | Red    | —      | `<span style="color:#FF0000">hello</span>`                                                                       |
| 2   | "hello"                                          | Red    | Red    | Double wrap same color                                                                                           |
| 3   | "hello"                                          | Red    | Blue   | `<span style="color:#0070C0"><span style="color:#FF0000">hello</span></span>`                                    |
| 4   | "hello"                                          | Black  | White  | Nested: white outer, black inner                                                                                 |
| 5   | "hello"                                          | White  | —      | `<span style="color:#FFFFFF">hello</span>` (White menu item has dark bg in dropdown for visibility; same output) |
| 6   | `<span style="color:#FF0000">hi</span>` selected | Blue   | —      | Wraps span: `<span style="color:#0070C0"><span...>hi</span></span>`                                              |

**Without selection — only updates color swatch, no text change:**

| #   | Pick 1 | Pick 2 | Swatch color | Editor change |
| --- | ------ | ------ | ------------ | ------------- |
| 7   | Red    | —      | `#FF0000`    | None          |
| 8   | Red    | Blue   | `#0070C0`    | None          |
| 9   | Blue   | Red    | `#FF0000`    | None          |
| 10  | Red    | Red    | `#FF0000`    | None          |

---

### 16.5 Align Dropdown — all 4 options, re-pick, cross-pick

**Options:** Align Left · Center · Align Right · Justify

**With selection — wraps in `<div style="text-align:X">\n\nsel\n\n</div>`:**

| #   | Selection | Pick 1    | Pick 2 | Result                                                                                          |
| --- | --------- | --------- | ------ | ----------------------------------------------------------------------------------------------- |
| 1   | "hello"   | Left      | —      | `<div style="text-align:left">\n\nhello\n\n</div>`                                              |
| 2   | "hello"   | Left      | Left   | Nested divs — no toggle, no dedup                                                               |
| 3   | "hello"   | Left      | Center | `<div style="text-align:center">\n\n<div style="text-align:left">\n\nhello\n\n</div>\n\n</div>` |
| 4   | "hello"   | Center    | Right  | Nested center inside right                                                                      |
| 5   | "hello"   | Left (×3) | —      | Triple-nested left divs                                                                         |

**Without selection — replaces entire cursor line:**

| #   | Line                                       | Pick 1  | Pick 2 | Result                                                                                                                                                               |
| --- | ------------------------------------------ | ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | `hello`                                    | Left    | —      | `<div style="text-align:left">hello</div>`                                                                                                                           |
| 7   | `hello`                                    | Left    | Center | Pick 1 → `<div style="text-align:left">hello</div>`; Pick 2 cursor is on that line → `<div style="text-align:center"><div style="text-align:left">hello</div></div>` |
| 8   | `hello`                                    | Left    | Left   | Same as #7 but both divs left                                                                                                                                        |
| 9   | `<div style="text-align:left">hello</div>` | Center  | —      | `<div style="text-align:center"><div style="text-align:left">hello</div></div>`                                                                                      |
| 10  | `hello`                                    | Justify | —      | `<div style="text-align:justify">hello</div>`                                                                                                                        |

---

### 16.6 Styles Dropdown — all 11 styles + Clear Formatting, re-pick, cross-pick

**Items:** Heading 1–6 · Page Title · Citation · Quote · Code · Normal · (divider) · 🧹 Clear Formatting

**Heading items use `toggleLinePrefix`:**

| #   | Line       | Pick 1    | Pick 2    | Result                           |
| --- | ---------- | --------- | --------- | -------------------------------- |
| 1   | `hello`    | Heading 1 | —         | `# hello`                        |
| 2   | `# hello`  | Heading 1 | —         | `hello` (toggle off)             |
| 3   | `# hello`  | Heading 1 | Heading 1 | `hello` → `# hello` (alternates) |
| 4   | `hello`    | Heading 1 | Heading 2 | `# hello` → `## hello`           |
| 5   | `hello`    | Heading 2 | Heading 1 | `## hello` → `# hello`           |
| 6   | `hello`    | Heading 1 | Heading 6 | `# hello` → `###### hello`       |
| 7   | `hello`    | Heading 1 | Normal    | `# hello` → `hello`              |
| 8   | `## hello` | Heading 3 | Normal    | `### hello` → `hello`            |

**Page Title uses `toggleLinePrefix("# ")` — same prefix as Heading 1:**

| #   | Line      | Pick                       | Result                                      |
| --- | --------- | -------------------------- | ------------------------------------------- |
| 9   | `hello`   | Page Title                 | `# hello` — identical to Heading 1          |
| 10  | `# hello` | Page Title                 | `hello` — toggles off (same prefix check)   |
| 11  | `# hello` | Heading 1, then Page Title | `hello` → `# hello` (Page Title re-adds it) |

**Citation uses `toggleLinePrefix("> ")`:**

| #   | Line      | Pick 1   | Pick 2 | Result                                                                                                       |
| --- | --------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| 12  | `hello`   | Citation | —      | `> hello`                                                                                                    |
| 13  | `> hello` | Citation | —      | `hello` (toggle off)                                                                                         |
| 14  | `hello`   | Citation | Quote  | `> hello` → `> > hello` (Quote also uses `> `, strips existing `> `, prepends `> ` again — net: `> > hello`) |
| 15  | `> hello` | Quote    | —      | `> ` stripped, `> ` prepended → `> hello` (effectively no-op — same prefix)                                  |

> **Page Title and Heading 1 share `"# "` prefix; Citation and Quote share `"> "` prefix.** Picking one then the other on the same prefix is a no-op (strip → re-prepend same string).

**Code uses `replaceSelection(prefix + sel + suffix)` — NOT `toggleLinePrefix`:**

| #   | Selection                                    | Line    | Pick             | Result                                                               |
| --- | -------------------------------------------- | ------- | ---------------- | -------------------------------------------------------------------- |
| 16  | "hello"                                      | `hello` | Code             | ` ```\nhello\n``` `                                                  |
| 17  | None                                         | `hello` | Code             | ` ```\n\n``` ` at cursor (empty selection)                           |
| 18  | " `\nhello\n` " (entire code block selected) | Code    | Code             | ` ```\n```\nhello\n```\n``` ` — no detection of existing code block  |
| 19  | "hello"                                      | `hello` | Code, Code again | ` ```\n```\nhello\n```\n``` ` on second pick if whole block selected |

**Normal strips heading prefix only (`line.replace(/^#{1,6}\s+/, "")`):**

| #   | Line       | Pick        | Result                                                  |
| --- | ---------- | ----------- | ------------------------------------------------------- |
| 20  | `## hello` | Normal      | `hello`                                                 |
| 21  | `hello`    | Normal      | `hello` (no-op)                                         |
| 22  | `- hello`  | Normal      | `- hello` (bullet NOT stripped — only `#{1,6}` pattern) |
| 23  | `> hello`  | Normal      | `> hello` (blockquote NOT stripped)                     |
| 24  | `hello`    | Normal (×3) | `hello` each time — idempotent                          |

**Clear Formatting (in dropdown) strips all inline + heading:**

| #   | Line                  | Pick       | Result                       |
| --- | --------------------- | ---------- | ---------------------------- |
| 25  | `**bold**`            | Clear      | `bold`                       |
| 26  | `## **heading bold**` | Clear      | `heading bold`               |
| 27  | `hello`               | Clear      | `hello` (no-op)              |
| 28  | `**bold**`            | Clear (×2) | `bold` → `bold` (idempotent) |

---

### 16.7 Tags Dropdown — all 27 tags + Customize Tags

The dropdown shows all `ALL_TAGS` entries. Each applies `applyTag(tag.cmd, editor)`. Behaviors group by notation type:

**Todo-family** (`tag-todo`, `tag-todo-p1`, `tag-todo-p2`) → `toggleLinePrefix`:

| #   | Line             | Pick     | Result                                                                                                                                                                                                  |
| --- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `hello`          | To Do    | `- [ ] hello`                                                                                                                                                                                           |
| 2   | `- [ ] hello`    | To Do    | `hello`                                                                                                                                                                                                 |
| 3   | `hello`          | To Do P1 | `- [ ] 🔴 hello`                                                                                                                                                                                        |
| 4   | `- [ ] 🔴 hello` | To Do P1 | `hello`                                                                                                                                                                                                 |
| 5   | `- [ ] hello`    | To Do P1 | `- [ ] 🔴 hello` (strips `- [ ] `, prepends `- [ ] 🔴 `)                                                                                                                                                |
| 6   | `- [ ] 🔴 hello` | To Do    | `- [ ] hello` (strips `- [ ] 🔴 ` as "has P1 prefix", but wait: `toggleLinePrefix("- [ ] ")` checks `startsWith("- [ ] ")` — `- [ ] 🔴 hello` DOES start with `- [ ] ` → strips `6` chars → `🔴 hello`) |

> **Edge case 6:** To Do on a P1 line strips only the `"- [ ] "` portion, leaving `🔴 hello`.

| #   | Line    | Pick 1   | Pick 2   | Result                                                                                           |
| --- | ------- | -------- | -------- | ------------------------------------------------------------------------------------------------ |
| 7   | `hello` | To Do P1 | To Do P2 | `- [ ] 🔴 hello` → `- [ ] 🟡 hello`                                                              |
| 8   | `hello` | To Do P2 | To Do P2 | `- [ ] 🟡 hello` → `hello`                                                                       |
| 9   | `hello` | To Do    | To Do P1 | `- [ ] hello` → `- [ ] 🔴 hello` (strips `- [ ] `, prepends `- [ ] 🔴 `) — net: `- [ ] 🔴 hello` |

**Highlight** (`tag-highlight`) → `toggleInline(editor, "==")` — behaves like the button:

| #   | Selection   | Line        | Pick           | Result                        |
| --- | ----------- | ----------- | -------------- | ----------------------------- |
| 10  | "hello"     | `hello`     | Highlight      | `==hello==`                   |
| 11  | "==hello==" | `==hello==` | Highlight      | `hello`                       |
| 12  | None        | `hello`     | Highlight      | `====` at cursor              |
| 13  | "hello"     | `hello`     | Highlight (×2) | `==hello==` → `====hello====` |

**Callout tags** (everything except todo-family and highlight) → `editor.replaceRange(notation, cursor)` when not already on that callout; toggle-off when `line.startsWith(firstPart)`:

| #   | Line                                     | Pick               | Result                                                                      |
| --- | ---------------------------------------- | ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 14  | `hello`                                  | Important          | `> [!important]\n> ` inserted at cursor                                     |
| 15  | `> [!important]` (cursor on header line) | Important          | Toggle off: header deleted, `> ` stripped from next line                    |
| 16  | `hello`                                  | Important (×2)     | First inserts callout; second: cursor now on `> [!important]` → toggles off |
| 17  | `hello`                                  | Important          | Question                                                                    | Important inserted; then Question inserted at cursor (on continuation line `> `) — two callouts |
| 18  | `hello`                                  | Critical           | —                                                                           | `> [!danger] Critical\n> ` at cursor                                                            |
| 19  | `> [!danger] Critical`                   | Critical           | —                                                                           | Toggle off                                                                                      |
| 20  | `hello`                                  | Remember for later | —                                                                           | `> [!note] Remember for later\n> `                                                              |
| 21  | `hello`                                  | Idea               | Idea                                                                        | First inserts; second on `> [!tip] 💡 Idea` → toggle off                                        |
| 22  | `hello`                                  | Idea               | Important                                                                   | Two separate callouts at successive cursor positions                                            |
| 23  | Any                                      | Customize Tags…    | —                                                                           | Notice "not yet implemented" shown; no editor change                                            |

**Same tag picked back-to-back (insert then toggle off) — all callout tags follow this pattern:**

| Tag              | First click                      | Second click                           |
| ---------------- | -------------------------------- | -------------------------------------- |
| Question         | `> [!question]\n> ` inserted     | Cursor on `> [!question]` → toggle off |
| Definition       | `> [!info] Definition\n> `       | Toggle off                             |
| Contact          | `> [!tip] Contact\n> `           | Toggle off                             |
| Password         | `> [!warning] Password\n> `      | Toggle off                             |
| Critical         | `> [!danger] Critical\n> `       | Toggle off                             |
| Movie to see     | `> [!note] 🎬 Movie to see\n> `  | Toggle off                             |
| Schedule meeting | `> [!todo] Schedule meeting\n> ` | Toggle off                             |
| _(all others)_   | Insert callout notation          | Toggle off when cursor on header line  |

**Cross-tag: switching between two different callout tags on the same line:**

| #   | Line             | Pick 1    | Pick 2   | Result                                                                                        |
| --- | ---------------- | --------- | -------- | --------------------------------------------------------------------------------------------- |
| 24  | `hello`          | Important | Question | `> [!important]\n> > [!question]\n> ` — P2 inserted at cursor (now on `> ` continuation line) |
| 25  | `> [!important]` | Question  | —        | Question inserted at cursor within header line; does not toggle off Important                 |
| 26  | `> [!important]` | Important | —        | Toggle off Important correctly                                                                |

---

### 16.8 Controls with decorative `▾` but NO dropdown

These render a `▾` caret visually but clicking the button fires the main command only — there is no submenu:

| Control             | `data-cmd`      | What click does              | `▾` behavior                                                                                                   |
| ------------------- | --------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Bullet List         | `bullet-list`   | `toggleLinePrefix("- ")`     | Decorative span inside button — no separate handler                                                            |
| Numbered List       | `numbered-list` | `toggleLinePrefix("1. ")`    | Same                                                                                                           |
| Highlight main area | `highlight`     | `toggleInline(editor, "==")` | The `▾` below is a separate `<div>` but has **no `data-cmd`** — click falls through to parent or is uncaptured |

> **Highlight `▾` note:** The `▾` div below the highlight button has no `data-cmd` attribute. Clicking it does nothing (no handler registered). This is the same for bullet and numbered list carets.

---

## Section 17 — Edge cases

| #   | Scenario                                             | Expected result                                                                                                    |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Click any button while dropdown is open              | `showDropdown` removes existing dropdown first                                                                     |
| 2   | Click outside open dropdown                          | Dropdown closes                                                                                                    |
| 3   | Styles scroll up at offset=0                         | No change, no error                                                                                                |
| 4   | Styles scroll down at offset=9                       | No change, no error                                                                                                |
| 5   | `toggleInline` on already-open markers with no close | Wraps again (no special detection of unclosed markers)                                                             |
| 6   | `tag-highlight` via tag dropdown                     | Calls `toggleInline(editor, "==")` — same as highlight button                                                      |
| 7   | Apply To Do then Important to same line              | Line = `- [ ] Hello`; Important notation inserted at cursor (not start of line); result depends on cursor position |
| 8   | Apply Heading 1 then Heading 2                       | `# Hello` → `toggleLinePrefix("## ")` strips `# Hello` via regex → `## Hello`                                      |
| 9   | Format Painter clicked with no selection in source   | Reads `fpLine` as source; captures bold/italic/underline from entire line                                          |
| 10  | `refreshTagChecks` with `tag-highlight` (`==`)       | Notation = `"=="`, split on `\n` = `["=="]`, trimmed = `"=="`. Checks if line contains `"=="`. Works correctly.    |
