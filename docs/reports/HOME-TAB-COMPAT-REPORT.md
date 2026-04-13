# Home Tab — Span/MD Tag Interaction Report (Live Preview / Edit Mode)

> **Testing method:** Observed `cm-line` DOM + `getComputedStyle` in Obsidian Live Preview (edit mode, `source:false`).

**Core rule discovered:** When any inline `<span>` appears on a line that uses MD syntax tokens (`**`, `*`, `~~`, `==`, `##`), the entire line is treated as an HTML block (`cm-html-embed`). MD tokens become literal characters. The inverse is also true — spans INSIDE MD wrappers break the MD parsing.

---

## GROUP: Basic Text — MD Syntax Tokens

| Button | Test Case | DOM Result | MD Renders? | Span Style Applied? | Notes |
| --- | --- | --- | --- | --- | --- |
| Bold | Native `**bold**` | `cm-strong`, font-weight:600 | ✅ Yes | — | |
| Bold | `<span style>**bold**</span>` (span wraps MD) | `cm-html-embed` → literal `**` | ❌ No | ✅ color:red works | MD tokens become plain text |
| Bold | `**<span style>text</span>**` (span inside MD) | `cm-html-embed` → span only | ❌ No | ✅ color:red works | Outer `**` stripped |
| Italic | Native `*italic*` | `cm-em`, font-style:italic | ✅ Yes | — | |
| Italic | `<span style>*italic*</span>` | `cm-html-embed` → literal `*` | ❌ No | ✅ color:red works | Same as bold |
| Italic | `*<span style>text</span>*` | `cm-html-embed` → span only | ❌ No | ✅ color:red works | |
| Strikethrough | Native `~~strike~~` | `cm-strikethrough`, text-decoration:line-through | ✅ Yes | — | |
| Strikethrough | `<span style>~~strike~~</span>` | `cm-html-embed` → literal `~~` | ❌ No | ✅ color:red works | |
| Strikethrough | `~~<span style>text</span>~~` | `cm-html-embed` → span only | ❌ No | ✅ color:red works | |
| Highlight | Native `==text==` | `cm-highlight`, background:rgba(255,208,0,0.4) | ✅ Yes | — | |
| Highlight | `<span style>==text==</span>` | `cm-html-embed` → literal `==` | ❌ No | ✅ bg/color works | |
| Highlight | `==<span style>text</span>==` | `cm-html-embed`, span rendered, no `==` | ❌ No | ✅ bg/color works | |

---

## GROUP: Basic Text — HTML Tags (not MD tokens)

| Button | Test Case | DOM Result | Tag Renders? | Span Style Applied? | Notes |
| --- | --- | --- | --- | --- | --- |
| Underline | Native `<u>text</u>` | `cm-html-embed` → `<u>`, text-decoration:underline | ✅ Yes | — | |
| Underline | `<span style><u>text</u></span>` (span wraps u) | `cm-html-embed` → `<span><u>` | ✅ Yes | ✅ color:red + underline both apply | HTML nesting works |
| Underline | `<u><span style>text</span></u>` (span inside u) | `cm-html-embed` → `<u><span>` | ✅ Yes | ✅ color:red + underline both apply | HTML nesting works |
| Subscript | Native `<sub>2</sub>` | `cm-html-embed` → `<sub>`, vertical-align:sub | ✅ Yes | — | |
| Subscript | `<span style><sub>2</sub></span>` | `cm-html-embed` → `<span><sub>` | ✅ Yes | ✅ color:red + sub positioning | |
| Subscript | `<sub><span style>2</span></sub>` | `cm-html-embed` → `<sub><span>` | ✅ Yes | ✅ color:red + sub positioning | |
| Superscript | Native `<sup>2</sup>` | `cm-html-embed` → `<sup>`, vertical-align:super | ✅ Yes | — | |
| Superscript | `<span style><sup>2</sup></span>` | `cm-html-embed` → `<span><sup>` | ✅ Yes | ✅ color:red + super positioning | |
| Superscript | `<sup><span style>2</span></sup>` | `cm-html-embed` → `<sup><span>` | ✅ Yes | ✅ color:red + super positioning | |
| Font Color | `<span style="color:red">text</span>` | `cm-html-embed`, color:rgb(255,0,0) | ✅ Yes | ✅ | Direct `<span>` color always renders |
| Highlight Color | `<span style="background:yellow">text</span>` | `cm-html-embed`, background:yellow | ✅ Yes | ✅ | Direct `<span>` bg always renders |

---

## GROUP: Styles — Headings

| Button | Test Case | DOM Result | Heading Renders? | Span Style Applied? | Notes |
| --- | --- | --- | --- | --- | --- |
| Heading 1–3 | Native `## Heading` | `cm-header cm-header-2`, styled | ✅ Yes | — | |
| Heading 1–3 | `## <span style="color:red">text</span>` | `cm-html-embed` wraps span, no `cm-header` | ❌ Lost | ✅ color:red works | Heading size/weight stripped entirely |
| Heading 1–3 | `## <span style="font-size:20px">text</span>` | `cm-html-embed`, font-size:20px confirmed | ❌ Lost | ✅ 20px applies | Heading lost, but explicit font-size wins |

---

## GROUP: Tags

| Button | Test Case | DOM Result | Tag Renders? | Span Style Applied? | Notes |
| --- | --- | --- | --- | --- | --- |
| To Do | Native `- [ ] task` | `task-list-label` + `<input type=checkbox>` | ✅ Checkbox renders | — | |
| To Do | `- [ ] **bold** task` | Checkbox + `cm-strong` (font-weight:600) | ✅ Both render | — | Bold works inside todo |
| To Do | `- [ ] <span style="color:red">text</span>` | Checkbox + `cm-html-embed` → span | ✅ Checkbox preserved | ✅ color:red works | Checkbox and span coexist |
| To Do | `- [x] <span style="color:blue">text</span>` | `data-task="x"` (checked) + `cm-html-embed` | ✅ Checked state preserved | ✅ color:blue works | |
| Important | Native `> [!important]` callout | `cm-hmd-callout` rendered | ✅ Yes | — | |
| Important | `> [!important]` body with bold | `cm-quote cm-quote-1` + `cm-strong` | ✅ Bold works in callout | — | MD formatting works in callouts |
| Important | `> [!important]` body with `<span style>` | Raw literal HTML text: `<span style="color:red">` visible as characters | ❌ Not rendered | ❌ No | HTML stripped in callout context |
| Question | `> [!question]` with `<span style>` | Same as important — literal `<span>` text | ❌ Not rendered | ❌ No | |

---

## GROUP: Basic Text — Bullet List / Numbered List / Indent

| Button | Test Case | DOM Result | List Renders? | Span Style Applied? | Notes |
| --- | --- | --- | --- | --- | --- |
| Bullet List | Native `- item` | `cm-formatting-list-ul` + bullet | ✅ Yes | — | |
| Bullet List | `- <span style="color:red">item</span>` | Bullet preserved + `cm-html-embed` | ✅ Bullet preserved | ✅ color:red works | |
| Bullet List | `- **bold** and *italic*` | `cm-strong` + `cm-em` inside list | ✅ Both render | — | MD formatting works in lists |
| Numbered List | Native `1. item` | `cm-formatting-list-ol` + number | ✅ Yes | — | |
| Numbered List | `2. <span style="color:red">item</span>` | Number preserved + `cm-html-embed` | ✅ Number preserved | ✅ color:red works | |
| Numbered List | `3. ==highlight==` | `cm-highlight` inside numbered list | ✅ Highlight works | — | |
| Indent | `  - Level 2 item` | `cm-hmd-list-indent` + `cm-list-2` | ✅ Indent preserved | — | |
| Indent | `  - <span style="color:red">item</span>` | `cm-hmd-list-indent-1` + `cm-html-embed` | ✅ Indent preserved | ✅ color:red works | |
| Indent | `  - **bold** in level 2` | `cm-list-2 cm-strong` | ✅ Both preserved | — | |
| Indent | `    - ==highlight== in level 3` | `cm-list-3 cm-highlight` | ✅ Both preserved | — | |

---

## GROUP: Email & Meetings — Wikilinks

| Button | Test Case | DOM Result | Link Renders? | Span Style Applied? | Notes |
| --- | --- | --- | --- | --- | --- |
| Meeting Details | Native `[[2026-04-13]]` | `cm-hmd-internal-link` + `cm-underline`, color:rgb(138,92,245) | ✅ Clickable link | — | |
| Meeting Details | `<span style="color:red">[[link]]</span>` | `cm-html-embed` → span, `[[]]` as plain text | ❌ Wikilink broken | ✅ color:red works | Link detection blocked by span wrapper |

---

## Summary: Rules of Interaction

| Scenario | MD Token renders? | Span style renders? | Safe to combine? |
| --- | --- | --- | --- |
| Span wraps MD token (`**`, `*`, `~~`, `==`) | ❌ Tokens become literal | ✅ Yes | ❌ No — breaks MD |
| Span inside MD token | ❌ Outer MD lost | ✅ Yes | ❌ No — breaks MD |
| Span with HTML tag (`<u>`, `<sub>`, `<sup>`) | ✅ HTML renders | ✅ Yes | ✅ Yes — fully compatible |
| Span inside callout body (`> ...`) | N/A | ❌ Span shown as raw text | ❌ No — use MD formatting only |
| Span inside list/todo item | ✅ List structure preserved | ✅ Yes | ✅ Yes — safe |
| Span wraps wikilink `[[]]` | ❌ Link broken | ✅ Yes | ❌ No — breaks wikilink |
| Span inside heading `##` | ❌ Heading class lost | ✅ Yes | ❌ No — heading styling lost |
| Nested spans | ✅ All span styles stack | ✅ Yes | ✅ Yes — safe |
