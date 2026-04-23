# Styling Engine — Newly Discovered Edge Cases (Word Spec)

> **Scope:** This report catalogs edge cases **not present** in
> [STYLING-ENGINE-EDGE-CASES.md](./STYLING-ENGINE-EDGE-CASES.md). It was produced by
> dispatching multiple research agents over the home-tab surface (basic-text,
> font-picker, highlight, styles, tags, clipboard, email, navigate) plus structural
> and exotic categories.
>
> **Methodology:** Each row's **Expected (Word)** column reflects the behavior
> Microsoft Word (or, for Obsidian-only constructs like wiki-links and callouts,
> the Word-equivalent "least-surprising" behavior) would produce on the equivalent
> rendered formatted text.
>
> **Notation:** `|` = zero-width cursor; `[A, B]` = source-text offset selection;
> `<SHY>` = U+00AD soft hyphen; `<NBSP>` = U+00A0; `<ZWJ>` = U+200D.
>
> **Brainstorming rounds:** Two parallel rounds were dispatched. Round 1 produced
> ~190 cases across four scopes; Round 2 produced ~35 rare/exotic cases. After
> Round 2 no fundamentally new categories surfaced — additional rounds would
> mostly cross-combine existing categories (e.g. "RTL text inside a folded
> heading inside a callout"). Combinatorial enumeration is left to the test suite.

---

## Table of Contents

1. [Basic Text Toggles — New Geometry & Mixed-Format Cases](#1-basic-text-toggles)
2. [Span Attribute (Color/Font/Size/Background) — New Cases](#2-span-attribute-cases)
3. [Styles, Tags, Clipboard, Email, Navigate](#3-block-and-action-groups)
4. [Structural & Cross-Cutting](#4-structural-and-cross-cutting)
5. [Rare / Exotic — Round 2](#5-rare-and-exotic)
6. [Aggregated Summary & Test-Authoring Guidance](#6-summary)

---

## 1. Basic Text Toggles

### 1.1 Selection Geometry Variations

| #    | Input                     | Selection                                                   | Operation       | Expected (Word)                                                   |
| ---- | ------------------------- | ----------------------------------------------------------- | --------------- | ----------------------------------------------------------------- |
| SG-1 | `<u>hello\nworld</u>`     | `"lo\nwo"` = `[5, 11]` (crosses soft line break)            | toggleUnderline | `<u>hel</u>lo\nwo<u>rld</u>` (punch-out spans the break)          |
| SG-2 | `<u>hello</u>unformatted` | cursor at offset 9 (just after `</u>`, before `u`)          | toggleUnderline | unchanged source; typing state set                                |
| SG-3 | `<u>hello</u> `           | selection `[8, 10]` (closing tag + trailing space)          | toggleUnderline | `<u>hello</u> ` (no visible change)                               |
| SG-4 | `<b>a</b> <i>b</i>`       | `" <i>b"` = `[5, 10]` (space + italic open + content)       | toggleBold      | `<b>a</b><b> </b><b><i>b</i></b>` rendered: `a`+space+italic-bold |
| SG-5 | `<u>hello</u>`            | reversed selection `[8, 3]` (anchor > focus)                | toggleUnderline | normalize to `[3, 8]` and treat as full-content removal: `hello`  |
| SG-6 | `line\n<u>hello\n</u>`    | selection crossing pre-tag newline + tag + post-tag newline | toggleUnderline | `<u>line</u>\n<u>hello</u>\n` (per-line uniformity)               |
| SG-7 | `<u>hello</u>`            | `[14, 14]` past EOF zero-width                              | toggleUnderline | clamp to `[12, 12]`; no-op                                        |
| SG-8 | `<b>a</b><i>b</i>`        | `"</b><i"` = `[5, 8]` (pure markup, no content)             | toggleBold      | unchanged source (no text content to format)                      |
| SG-9 | `<u>  </u>`               | cursor at offset 4 (between the two spaces)                 | toggleUnderline | unchanged source (cursor-only)                                    |

### 1.2 Mixed Markdown + HTML

| #    | Input                           | Selection                              | Operation       | Expected (Word)                                                                                                     |
| ---- | ------------------------------- | -------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| MH-1 | `<b>**hello**</b>`              | `"hello"` (full inner content)         | toggleBold      | `hello` (collapse double-bold representation; Word doesn't double-apply)                                            |
| MH-2 | `**<u>hi</u>**`                 | `"<u>h"` = `[2, 4]` (markup + char)    | toggleUnderline | unchanged or render-equivalent `**<u>hi</u>**` (already underlined in selected region; partial-mixed → uniform)     |
| MH-3 | `<b>hi</b>**there**`            | `"i</b>**the"` = `[4, 14]` crossing    | toggleItalic    | `<b>h<i>i</i></b><i>**the**</i>re` (selection italicized; both rep formats survive)                                 |
| MH-4 | `***bold-italic***`             | `"bold"` = `[3, 7]` partial            | toggleBold      | `*bold*-italic*` rendered: italic-only on "bold", italic on "-italic" both still wrapped — ie punch-out bold        |
| MH-5 | `_<i>text</i>_`                 | `"_<i>t"` = `[0, 4]` MD+HTML crossing  | toggleItalic    | `text</i>_` then re-normalize → `text` (selection italicized while one form already present → toggle off uniformly) |
| MH-6 | `<u>**_mixed_**</u>`            | `"_mixed_**</u>"` = `[10, 18]` partial | removeAllTags   | `<u>**mixed**</u>` (italic delimiters punched out from selection only)                                              |
| MH-7 | `==<span bg:yellow>hi</span>==` | `"<span bg"` = `[2, 10]` (MD+HTML)     | toggleHighlight | `<span bg:yellow>hi</span>` (outer MD `==` toggled off; inner span untouched)                                       |
| MH-8 | `**hello \`code\` world\*\*`    | `"lo \`co"`=`[6, 12]` crossing code    | toggleBold      | `**hel**lo \`code\` **world**` (punch-out around protected inline code)                                             |

### 1.3 Whitespace-Only & Boundary Selections

| #    | Input                         | Selection                     | Operation       | Expected (Word)                                                         |
| ---- | ----------------------------- | ----------------------------- | --------------- | ----------------------------------------------------------------------- |
| WB-1 | `<u>   </u>`                  | all 3 spaces                  | toggleUnderline | `   `                                                                   |
| WB-2 | `<u>   </u>`                  | middle 2 spaces               | toggleUnderline | `<u> </u>  ` (punch-out middle 2; trailing collapsed empty tag dropped) |
| WB-3 | `<u>hello </u>`               | last char + trailing space    | toggleUnderline | `<u>hell</u>o `                                                         |
| WB-4 | `<u> hello</u>`               | leading space + first 2 chars | toggleUnderline | ` he<u>llo</u>`                                                         |
| WB-5 | `<u>\thello</u>`              | tab + first char              | toggleUnderline | `\th<u>ello</u>`                                                        |
| WB-6 | `<u>hello  </u>`              | last char + 2 trailing spaces | toggleUnderline | `<u>hell</u>o  `                                                        |
| WB-7 | `<u>hello\nworld</u>`         | only the `\n`                 | toggleUnderline | `<u>hello</u>\n<u>world</u>` (split around the newline)                 |
| WB-8 | `<u>hello</u>   <u>world</u>` | `</u>   <u` (markup + spaces) | toggleUnderline | unchanged (no non-markup content to format)                             |
| WB-9 | `**   **`                     | all 3 spaces                  | toggleBold      | `   `                                                                   |

### 1.4 Lists & Alignment Combinations

| #    | Input                                   | Selection                             | Operation              | Expected (Word)                                                              |
| ---- | --------------------------------------- | ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| LA-1 | `- hello world`                         | `"lo wor"` partial                    | toggleBold             | `- hel**lo wor**ld` (preserve list prefix)                                   |
| LA-2 | `- item\nparagraph text`                | entire (mixed list + paragraph)       | toggleBold             | `- **item**\n**paragraph text**` (per-line uniformity)                       |
| LA-3 | `\t\t- item text`                       | `"item"` partial                      | toggleUnderline        | `\t\t- <u>item</u> text` (preserve indent + list prefix)                     |
| LA-4 | `- hello world`                         | entire line                           | applyAlignment(center) | Center alignment applies to list-item text; marker stays left                |
| LA-5 | `<span align:center>hello world</span>` | `"lo wor"` partial                    | toggleBold             | `<span align:center>hel<b>lo wor</b>ld</span>`                               |
| LA-6 | `## Heading\n<u>text</u>`               | full both lines                       | toggleBold             | `## **Heading**\n<u>**text**</u>` (preserve heading prefix; nest formats)    |
| LA-7 | `- **hello** world`                     | `"**hel"` (crosses MD bold delimiter) | toggleUnderline        | `- <u>**hel</u>**lo** world` (or normalize → `- <u>**hel**</u>**lo** world`) |
| LA-8 | `\t- **bold** item`                     | line indent operation                 | applyIndent            | `\t\t- **bold** item` (formatting preserved on indent)                       |

### 1.5 Sub/Sup Boundary & Mutual Exclusion

| #     | Input                               | Selection                                      | Operation         | Expected (Word)                                                                                    |
| ----- | ----------------------------------- | ---------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| SS-A1 | `<sub>a</sub><sup>b</sup>`          | `"a</s"` = crosses sub→sup boundary            | toggleSuperscript | `<sup>a</sup><sup>b</sup>` (mixed-state → uniform sup)                                             |
| SS-A2 | `<sub>hello</sub> <sup>world</sup>` | full both + space                              | toggleSubscript   | `<sub>hello world</sub>` (uniform sub; sup swapped)                                                |
| SS-A3 | `<sub><sup>text</sup></sub>`        | `"text"` full inner                            | toggleSuperscript | `<sub>text</sub>` (innermost sup removed; outer sub kept)                                          |
| SS-A4 | `<sub></sub>`                       | cursor inside empty                            | toggleSuperscript | unchanged (cursor-only no-op)                                                                      |
| SS-A5 | `<sub>a</sub><sup>b</sup>`          | `"a</sub><s"` (mid-sub through opening of sup) | toggleSubscript   | `<sub>a</sub><sup><sub>b</sub></sup>` rendered: a sub, b sub-of-sup → render-equiv `<sub>ab</sub>` |
| SS-A6 | `<sub>₁</sub><sup>₂</sup>`          | both Unicode subscript digits + boundaries     | clearFormatting   | `₁₂`                                                                                               |

### 1.6 Empty Tag Content

| #    | Input                                        | Selection               | Operation       | Expected (Word)                                                               |
| ---- | -------------------------------------------- | ----------------------- | --------------- | ----------------------------------------------------------------------------- |
| ET-1 | `<b></b>`                                    | cursor inside empty     | toggleBold      | unchanged (cursor-only)                                                       |
| ET-2 | `<u></u>`                                    | full `[0, 7]` empty tag | toggleUnderline | empty source ``                                                               |
| ET-3 | `<u></u><b>text</b><i></i>`                  | full all three tags     | removeAllTags   | `text`                                                                        |
| ET-4 | `<b><u></u></b>`                             | full nested empty       | removeAllTags   | empty                                                                         |
| ET-5 | `<span style="color:red"></span>`            | full empty span         | toggleBold      | unchanged (no content to wrap)                                                |
| ET-6 | `hello<span style="color:blue"></span>world` | crosses empty span      | toggleBold      | `**hello**<span style="color:blue"></span>**world**` (wrap around empty span) |

### 1.7 Format Painter

| #    | Source format                                             | Apply target                                | Expected (Word)                                                             |
| ---- | --------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| FP-1 | cursor-only inside `<u>hello</u>` (typing state captured) | apply to `world` (full word)                | `<u>world</u>`                                                              |
| FP-2 | mixed `**<u>text</u>**`                                   | apply to `hello` plain                      | `**<u>hello</u>**`                                                          |
| FP-3 | empty `<b></b>` (no captured format)                      | apply to `word`                             | unchanged target (nothing to apply)                                         |
| FP-4 | cursor mid-tag `<u>hel                                    | lo</u>`                                     | apply twice to `world` and `more`                                           | both targets get `<u>` (typing state persists across multiple paint applications) |
| FP-5 | partial selection around `[[wiki]]`                       | apply to text containing another `[[note]]` | format applied around protected ranges in target                            |
| FP-6 | `<span color:red>text</span>`                             | apply to existing `<u>word</u>`             | `<u><span color:red>word</span></u>` (stack attributes; preserve underline) |

---

## 2. Span Attribute Cases

### 2.1 Multi-Property Spans — Partial Selection

| #    | Input                                                                           | Selection               | Operation              | Expected (Word)                                                                                                                               |
| ---- | ------------------------------------------------------------------------------- | ----------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| MP-1 | `<span color:red><span font-size:14pt>hello</span></span>`                      | `"hel"` partial         | applyFontColor("blue") | `<span color:blue><span font-size:14pt>hel</span></span><span color:red><span font-size:14pt>lo</span></span> ` (split outer)                 |
| MP-2 | `<span color:red><span font-size:14pt>hello</span></span>`                      | `"llo"` partial         | applyFontSize("16pt")  | `<span color:red><span font-size:14pt>he</span><span font-size:16pt>llo</span></span>` (split inner)                                          |
| MP-3 | `<span color:red><span font-size:14pt>hello</span></span>`                      | full content            | applyFontColor("blue") | `<span color:blue><span font-size:14pt>hello</span></span>`                                                                                   |
| MP-4 | `<span color:red><span font-size:14pt>hello world</span></span>`                | `"hello"` partial inner | removeColorSpan        | selection-scoped: split outer color, keep size: `<span font-size:14pt>hello</span><span color:red><span font-size:14pt> world</span></span> ` |
| MP-5 | `<span style="color:red;font-size:14pt">hello world</span>` (single multi-prop) | `"hello"` partial       | applyFontColor("blue") | `<span style="color:blue;font-size:14pt">hello</span><span style="color:red;font-size:14pt"> world</span>`                                    |

### 2.2 Nested Same-Property Crossing Boundary

| #     | Input                                                                      | Selection           | Operation              | Expected (Word)                                                                     |
| ----- | -------------------------------------------------------------------------- | ------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| NSP-1 | `<span color:red>hello</span><span color:red>world</span>`                 | `"lo wor"` crossing | applyFontColor("blue") | `<span color:red>hel</span><span color:blue>lo wor</span><span color:red>ld</span>` |
| NSP-2 | `<span color:red>hello</span><span color:red>world</span>`                 | `"lo wor"` crossing | removeColorSpan        | `<span color:red>hel</span>lo wor<span color:red>ld</span>`                         |
| NSP-3 | `<span font-size:12pt>a</span><span font-size:12pt>b</span>`               | `"ab"` full         | applyFontSize("14pt")  | `<span font-size:14pt>ab</span>` (normalize then replace)                           |
| NSP-4 | `<span color:red>a</span><span color:red>b</span><span color:red>c</span>` | `"bc"` crossing     | removeColorSpan        | `<span color:red>a</span>bc`                                                        |

### 2.3 Selection Crossing Different-Property Spans

| #     | Input                                                                      | Selection           | Operation                  | Expected (Word)                                                                       |
| ----- | -------------------------------------------------------------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| CSP-1 | `<span color:red>hello</span><span color:blue>world</span>`                | `"lo wo"` crossing  | applyFontColor("green")    | `<span color:red>hel</span><span color:green>lo wo</span><span color:blue>rld</span>` |
| CSP-2 | `<span color:red>a</span> plain <span color:blue>b</span>`                 | full `"a plain b"`  | applyFontColor("yellow")   | `<span color:yellow>a plain b</span>` (uniform)                                       |
| CSP-3 | `<span font-family:Arial>text</span><span font-family:Verdana>more</span>` | `"t more"` crossing | applyFontFamily("Georgia") | `<span font-family:Arial>tex</span><span font-family:Georgia>t more</span>`           |

### 2.4 Special Color Values (Empty / Inherit / Transparent / Null)

| #     | Input                                | Selection         | Operation                     | Expected (Word)                                                      |
| ----- | ------------------------------------ | ----------------- | ----------------------------- | -------------------------------------------------------------------- |
| EMP-1 | `hello world`                        | `"hello"`         | applyFontColor("")            | unchanged (empty value treated as no-op)                             |
| EMP-2 | `<span color:red>hello</span>`       | `"hello"`         | applyFontColor("transparent") | `<span color:transparent>hello</span>` (visible-but-invisible color) |
| EMP-3 | `hello world`                        | `"hello"`         | applyFontColor("inherit")     | `<span color:inherit>hello</span> world`                             |
| EMP-4 | `<span color:red>hello world</span>` | `"hello"` partial | applyFontColor("transparent") | `<span color:transparent>hello</span><span color:red> world</span>`  |
| EMP-5 | `<span color:red>hello</span>`       | `"hello"`         | applyFontColor(null)          | `hello` (null = clear)                                               |

### 2.5 Whitespace at Span Edges

| #     | Input                             | Selection           | Operation              | Expected (Word)                                                                     |
| ----- | --------------------------------- | ------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| WSE-1 | `<span color:red> hello </span>`  | `" he"` partial     | removeColorSpan        | ` he<span color:red>llo </span>` (split; leading space loses color along with text) |
| WSE-2 | `<span color:red>  text  </span>` | `" text "` interior | applyFontColor("blue") | `<span color:red> </span><span color:blue> text </span><span color:red> </span>`    |
| WSE-3 | `<span color:red> \n </span>`     | `"\n"` only         | applyFontColor("blue") | `<span color:red> </span><span color:blue>\n</span><span color:red> </span>`        |
| WSE-4 | `<span color:red>\t</span>`       | `"\t"` full         | applyFontColor("blue") | `<span color:blue>\t</span>`                                                        |

### 2.6 Combined Formatting (Span + Bold/Underline)

| #     | Input                                            | Selection       | Operation              | Expected (Word)                                                                                          |
| ----- | ------------------------------------------------ | --------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| CMB-1 | `<b><span color:red>hello</span></b>`            | `"hello"` full  | applyFontColor("blue") | `<b><span color:blue>hello</span></b>`                                                                   |
| CMB-2 | `<b><span color:red>hello</span></b>`            | `"hel"` partial | applyFontColor("blue") | `<b><span color:blue>hel</span><span color:red>lo</span></b>` (split inner span; bold preserved)         |
| CMB-3 | `<u><span font-size:14pt>hello world</span></u>` | `"llo"` partial | applyFontSize("16pt")  | `<u><span font-size:14pt>he</span><span font-size:16pt>llo</span><span font-size:14pt> world</span></u>` |
| CMB-4 | `<b><u><span color:red>text</span></u></b>`      | `"text"` full   | removeColorSpan        | `<b><u>text</u></b>`                                                                                     |
| CMB-5 | `<b><span color:red>hello</span></b>`            | `"he"` partial  | toggleBold (remove)    | `he<b><span color:red>llo</span></b>`                                                                    |

### 2.7 Cursor at Span Boundary

| #     | Input                                | Cursor                                        | Operation              | Expected (Word)                            |
| ----- | ------------------------------------ | --------------------------------------------- | ---------------------- | ------------------------------------------ |
| SCR-1 | `<span color:red>hello</span>`       | offset 24 (just inside opening tag's content) | applyFontColor("blue") | unchanged source; typing state set to blue |
| SCR-2 | `<span color:red>hello</span>`       | offset 29 (just inside closing tag)           | applyFontColor("blue") | unchanged source; typing state set         |
| SCR-3 | `red text` (no span)                 | offset 8 (after `text`)                       | applyFontColor("red")  | unchanged source; typing state set         |
| SCR-4 | `<span color:red>hello</span> world` | inside `world` after span                     | applyFontColor("blue") | unchanged source; typing state set         |

### 2.8 Highlight Pen State Combinations

| #     | Source                                                            | Pen color | Operation                 | Expected (Word)                                                         |
| ----- | ----------------------------------------------------------------- | --------- | ------------------------- | ----------------------------------------------------------------------- |
| HPS-1 | `<span bg:yellow>part1</span> plain <span bg:yellow>part2</span>` | yellow    | applyHighlightClick       | mixed → uniform: `<span bg:yellow>part1 plain part2</span>`             |
| HPS-2 | `<span bg:yellow>part1</span> plain <span bg:green>part2</span>`  | yellow    | applyHighlightClick       | uniform: `<span bg:yellow>part1 plain part2</span>`                     |
| HPS-3 | `<span bg:yellow>hello</span>`                                    | green     | applyHighlightClick       | `<span bg:green>hello</span>` (replace)                                 |
| HPS-4 | `text`                                                            | yellow    | applyHighlightClick       | `<span bg:yellow>text</span>`                                           |
| HPS-5 | `<span bg:yellow>hello</span> world <span bg:yellow>again</span>` | yellow    | partial `"lo wo"` → click | `<span bg:yellow>hel</span>lo wo<span bg:yellow>rld...`-style punch-out |

### 2.9 Markdown `==` Mixed with Span Backgrounds

| #    | Input                                    | Selection             | Operation                          | Expected (Word)                                                                |
| ---- | ---------------------------------------- | --------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| MD-1 | `==hello== world`                        | `"hello world"` full  | applyFontColor("blue")             | `<span color:blue>==hello== world</span>` then normalize → renderer-equivalent |
| MD-2 | `<span bg:yellow>==hello==</span> world` | full                  | applyHighlightNoColor              | `hello world` (clear both forms)                                               |
| MD-3 | `==<span bg:yellow>hello</span>==`       | `"hello"` inner full  | applyHighlightColorSelect("green") | `<span bg:green>hello</span>` (replace; outer MD removed)                      |
| MD-4 | `==hello== <span bg:green>world</span>`  | `"hello world"` cross | toggleHighlight (off)              | `hello world`                                                                  |

### 2.10 Adjacent Same-Color Spans

| #     | Input                                                               | Selection        | Operation                  | Expected (Word)                                                       |
| ----- | ------------------------------------------------------------------- | ---------------- | -------------------------- | --------------------------------------------------------------------- |
| ADJ-1 | `<span color:red>a</span> <span color:red>b</span>`                 | `"a b"` crossing | removeColorSpan            | `a b`                                                                 |
| ADJ-2 | `<span color:red>a</span> <span color:red>b</span>`                 | `"a b"` crossing | applyFontColor("blue")     | `<span color:blue>a b</span>`                                         |
| ADJ-3 | `<span font-family:Arial>a</span>x<span font-family:Arial>b</span>` | `"a"` first only | applyFontFamily("Verdana") | `<span font-family:Verdana>a</span>x<span font-family:Arial>b</span>` |
| ADJ-4 | `<span color:red>a</span><span color:red>b</span>`                  | `"ab"` crossing  | removeColorSpan            | `ab`                                                                  |

### 2.11 Idempotent Reapply

| #     | Input                                 | Selection       | Operation                | Expected (Word)                 |
| ----- | ------------------------------------- | --------------- | ------------------------ | ------------------------------- |
| IDP-1 | `<span color:red>text</span>`         | `"text"`        | applyFontColor("red")    | unchanged source; `isNoOp:true` |
| IDP-2 | `<span color:red>hello</span>`        | `"hel"` partial | applyFontColor("red")    | unchanged source                |
| IDP-3 | `<span font-family:Arial>text</span>` | `"text"`        | applyFontFamily("Arial") | unchanged                       |
| IDP-4 | `<span font-size:12pt>text</span>`    | `"text"`        | applyFontSize("12pt")    | unchanged                       |

### 2.12 Font-Size with Sub/Sup

| #    | Input                                          | Selection | Operation             | Expected (Word)                                                   |
| ---- | ---------------------------------------------- | --------- | --------------------- | ----------------------------------------------------------------- |
| FS-1 | `<sub><span font-size:12pt>hello</span></sub>` | `"hello"` | applyFontSize("14pt") | `<sub><span font-size:14pt>hello</span></sub>`                    |
| FS-2 | `<sup>2</sup>`                                 | `"2"`     | applyFontSize("18pt") | `<sup><span font-size:18pt>2</span></sup>`                        |
| FS-3 | `<sub><span color:red>x</span></sub>`          | `"x"`     | applyFontSize("10pt") | `<sub><span color:red><span font-size:10pt>x</span></span></sub>` |
| FS-4 | `<span font-size:14pt>hello</span>`            | `"hello"` | toggleSubscript       | `<sub><span font-size:14pt>hello</span></sub>`                    |

### 2.13 Color Format Variations

| #     | Input                                     | Operation                 | Expected (Word)                                                    |
| ----- | ----------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| CFV-1 | `<span color:#FF0000>text</span>`         | applyFontColor("red")     | `<span color:red>text</span>` (recognize hex == named; idempotent) |
| CFV-2 | `<span color:rgb(255,0,0)>text</span>`    | applyFontColor("blue")    | `<span color:blue>text</span>` (replace)                           |
| CFV-3 | `<span color:red>text</span>`             | applyFontColor("#0000FF") | `<span color:#0000FF>text</span>`                                  |
| CFV-4 | `<span color:hsl(0,100%,50%)>text</span>` | applyFontColor("green")   | `<span color:green>text</span>`                                    |

### 2.14 Whitespace-Only Span Content

| #    | Input                         | Selection       | Operation              | Expected (Word)                      |
| ---- | ----------------------------- | --------------- | ---------------------- | ------------------------------------ |
| WO-1 | `<span color:red>   </span>`  | `"   "` full    | removeColorSpan        | `   ` (spaces remain plain)          |
| WO-2 | `text   text`                 | middle 3 spaces | applyFontColor("red")  | `text<span color:red>   </span>text` |
| WO-3 | `<span color:red> \n </span>` | full            | applyFontColor("blue") | `<span color:blue> \n </span>`       |

### 2.15 Remove One Property of Multi-Property Span

| #     | Input                                                            | Selection         | Operation          | Expected (Word)                                                                              |
| ----- | ---------------------------------------------------------------- | ----------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| ROP-1 | `<span color:red><span font-size:14pt>hello world</span></span>` | `"hello"` partial | removeColorSpan    | `<span font-size:14pt>hello</span><span color:red><span font-size:14pt> world</span></span>` |
| ROP-2 | `<span color:red><span font-size:14pt>hello</span></span>`       | full              | removeColorSpan    | `<span font-size:14pt>hello</span>`                                                          |
| ROP-3 | `<span color:red><span font-size:14pt>hello</span></span>`       | full              | removeFontSizeSpan | `<span color:red>hello</span>`                                                               |

### 2.16 Selection Crossing Span Edge to Outside

| #     | Input                                                              | Selection                         | Operation               | Expected (Word)                                                                                                                                                                          |
| ----- | ------------------------------------------------------------------ | --------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPO-1 | `<span color:red>hel</span>lo`                                     | `"ello"` (inside → outside)       | applyFontColor("blue")  | `<span color:red>hel</span><span color:blue>lo</span>` — wait, `e` is inside red so: `<span color:red>h</span><span color:blue>ello</span>` (re-color inside red part for selection too) |
| SPO-2 | `plain text<span color:blue>more</span>`                           | `"t more"` (outside → inside)     | applyFontColor("green") | `plain tex<span color:green>t more</span>` (selection is uniform green; replaces blue inside selection)                                                                                  |
| SPO-3 | `<span color:red>hello</span> world <span color:blue>again</span>` | `"lo world a"` crossing two spans | applyFontColor("green") | `<span color:red>hel</span><span color:green>lo world a</span><span color:blue>gain</span>`                                                                                              |

### 2.17 Re-coloring Plain Text

| #     | Input                                     | Operation                          | Expected (Word)                      |
| ----- | ----------------------------------------- | ---------------------------------- | ------------------------------------ |
| REC-1 | `hello world`                             | applyFontColor("red") on `"hello"` | `<span color:red>hello</span> world` |
| REC-2 | `text` (previously colored, now stripped) | applyFontColor("red")              | `<span color:red>text</span>`        |

### 2.18 Selection Including Span Delimiter Chars

| #     | Input                          | Selection                                                | Operation               | Expected (Word)                                                           |
| ----- | ------------------------------ | -------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| DEL-1 | `<span color:red>text</span>`  | full delimiter-inclusive `[0, 31]`                       | applyFontColor("blue")  | `<span color:blue>text</span>` (recognize as delimiter-inclusive replace) |
| DEL-2 | `<span color:red>hello</span>` | partial delimiter-end `[7, 30]` (mid-attr through close) | applyFontColor("green") | unchanged or render-equivalent (markup-only selection has no text)        |

### 2.19 Cursor After Span Close

| #     | Input                              | Cursor                 | Operation              | Expected (Word)                     |
| ----- | ---------------------------------- | ---------------------- | ---------------------- | ----------------------------------- |
| POS-1 | `<span color:red>text</span> more` | offset 32 (post-close) | applyFontColor("blue") | unchanged; typing state set to blue |
| POS-2 | `<span color:red>text</span>`      | offset 31 (at end)     | applyFontSize("14pt")  | unchanged; typing state set to 14pt |

### 2.20 Nested Different-Color Spans, Partial Selection

| #     | Input                                                        | Selection                          | Operation               | Expected (Word)                                                                                                                      |
| ----- | ------------------------------------------------------------ | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| NCS-1 | `<span color:red><span color:blue>hello</span> world</span>` | `"llo wo"` crossing inner boundary | applyFontColor("green") | `<span color:red><span color:blue>he</span><span color:green>llo wo</span>rld</span>` (split inner + outer; selection uniform green) |
| NCS-2 | `<span color:red>a<span color:blue>b</span>c</span>`         | `"abc"` all                        | removeColorSpan         | `abc`                                                                                                                                |
| NCS-3 | `<span color:red>a<span color:blue>b</span>c</span>`         | `"b"` inner only                   | applyFontColor("green") | `<span color:red>a<span color:green>b</span>c</span>`                                                                                |

### 2.21 Zero-Width Selection (Cursor Bracketed as Selection)

| #    | Input                         | Selection                  | Operation              | Expected (Word)             |
| ---- | ----------------------------- | -------------------------- | ---------------------- | --------------------------- |
| ZW-1 | `<span color:red>text</span>` | `[8, 8]` zero-width inside | applyFontColor("blue") | unchanged; typing state set |
| ZW-2 | `hello world`                 | `[5, 5]` zero-width gap    | applyFontColor("red")  | unchanged; typing state set |

### 2.22 Font-Family Replacement & Removal

| #    | Input                                        | Selection         | Operation                  | Expected (Word)                                                               |
| ---- | -------------------------------------------- | ----------------- | -------------------------- | ----------------------------------------------------------------------------- |
| FF-1 | `<span font-family:Arial>text</span>`        | `"text"`          | applyFontFamily("Verdana") | `<span font-family:Verdana>text</span>`                                       |
| FF-2 | `<span font-family:Arial>hello world</span>` | `"hello"` partial | applyFontFamily("Verdana") | `<span font-family:Verdana>hello</span><span font-family:Arial> world</span>` |
| FF-3 | `<span font-family:Arial>text</span>`        | `"text"`          | removeFontFamilySpan       | `text`                                                                        |

### 2.23 Rapid Sequence of Span Operations

| #     | Starting input  | Sequence                                                                             | Expected (Word)                                                                                                |
| ----- | --------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| SEQ-1 | `hello`         | applyFontColor("red") → applyFontSize("14pt") → applyFontFamily("Arial") on full sel | `<span color:red><span font-size:14pt><span font-family:Arial>hello</span></span></span>` (nested in op order) |
| SEQ-2 | result of SEQ-1 | removeColorSpan                                                                      | `<span font-size:14pt><span font-family:Arial>hello</span></span>`                                             |
| SEQ-3 | result of SEQ-1 | removeFontSizeSpan                                                                   | `<span color:red><span font-family:Arial>hello</span></span>`                                                  |

### 2.24 Highlight Pen Exact-Match Toggle Off

| #    | Input                                | Pen color | Operation                 | Expected (Word)                                  |
| ---- | ------------------------------------ | --------- | ------------------------- | ------------------------------------------------ |
| HM-1 | `<span bg:yellow>text</span>`        | yellow    | applyHighlightClick       | `text`                                           |
| HM-2 | `<span bg:#FFFF00>text</span>`       | yellow    | applyHighlightClick       | `text` (recognize equivalent color formats)      |
| HM-3 | `<span bg:yellow>hello world</span>` | yellow    | partial `"hello"` → click | `hello<span bg:yellow> world</span>` (punch-out) |

### 2.25 Font-Size Inheritance & Override

| #    | Input                                     | Selection         | Operation             | Expected (Word)                                                               |
| ---- | ----------------------------------------- | ----------------- | --------------------- | ----------------------------------------------------------------------------- |
| FI-1 | `<span font-size:20pt>hello world</span>` | `"hello"` partial | applyFontSize("12pt") | `<span font-size:12pt>hello</span><span font-size:20pt> world</span>` (split) |
| FI-2 | inherited body size + `hello`             | `"hello"`         | applyFontSize("14pt") | `<span font-size:14pt>hello</span>` (explicit overrides inherited)            |

### 2.26 Adjacent Spans of Different Properties

| #     | Input                                                   | Selection       | Operation              | Expected (Word)                                                                                         |
| ----- | ------------------------------------------------------- | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| ADP-1 | `<span color:red>a</span><span font-size:14pt>b</span>` | `"ab"` crossing | applyFontColor("blue") | `<span color:blue>a</span><span color:blue><span font-size:14pt>b</span></span>` (uniform color across) |
| ADP-2 | same                                                    | `"ab"` crossing | applyFontSize("16pt")  | `<span color:red><span font-size:16pt>a</span></span><span font-size:16pt>b</span>` (uniform size)      |

---

## 3. Block and Action Groups

### 3.1 Styles Dropdown — Block-Level Application

| #    | Input                            | Selection / cursor        | Operation         | Expected (Word)                                             |
| ---- | -------------------------------- | ------------------------- | ----------------- | ----------------------------------------------------------- |
| ST-1 | `# Heading 1\nNormal text`       | cursor on Normal line     | apply "Heading 2" | `# Heading 1\n## Normal text` (only cursor line transforms) |
| ST-2 | `## Heading 2\n### Heading 3`    | cursor on H2 line         | apply "Heading 1" | `# Heading 2\n### Heading 3`                                |
| ST-3 | `# Heading 1\nNormal`            | full both lines           | apply "Normal"    | `Heading 1\nNormal` (mixed → uniform Normal)                |
| ST-4 | `- list item\n- another`         | cursor on first list item | apply "Heading 2" | `## list item\n- another`                                   |
| ST-5 | `> quote\n> quote 2`             | full both                 | apply "Normal"    | `quote\nquote 2`                                            |
| ST-6 | fenced code block, cursor inside | apply "Heading 1"         |                   | no-op (inert zone)                                          |
| ST-7 | `- [ ] Task\n  - subtask`        | cursor on subtask         | apply "Heading 2" | `- [ ] Task\n## subtask` (lose indent + list marker)        |
| ST-8 | `> [!important]\n> callout text` | full both lines           | apply "Quote"     | `> callout text` (callout type stripped; plain blockquote)  |

### 3.2 Tags Group

| #    | Input                          | Selection / cursor      | Operation           | Expected (Word-equivalent)                                                         |
| ---- | ------------------------------ | ----------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| TG-1 | `some text`                    | cursor only             | toggle "#todo"      | `some text #todo` (insert at end of line; or at cursor based on plugin convention) |
| TG-2 | `some text`                    | partial `"so"`          | toggle "#urgent"    | `#urgent so me text` (line-level tag association; substring not wrapped)           |
| TG-3 | `This is #urgent text`         | cursor inside `#urgent` | toggle "#urgent"    | `This is text` (toggle off — remove tag from line)                                 |
| TG-4 | `This is #urgent text`         | selection `"urgent"`    | toggle "#important" | `This is #important text` (replace tag occurrence)                                 |
| TG-5 | `Line 1 #tag1\nLine 2 #tag2`   | full both lines         | toggle "#shared"    | `Line 1 #tag1 #shared\nLine 2 #tag2 #shared` (per-line add)                        |
| TG-6 | `> [!important]\nCallout body` | cursor on callout title | toggle "Important"  | `Callout body` (remove callout structure entirely)                                 |
| TG-7 | `> [!note]\nNote body`         | selection `"> [!note]"` | toggle "Question"   | `> [!question]\nNote body`                                                         |
| TG-8 | `Text with #tag [link](url)`   | partial `"#tag [l"`     | toggle "#other"     | `Text with #other [link](url)` (link preserved; tag replaced)                      |

### 3.3 Clipboard

| #    | Input / clipboard                                         | Selection / cursor           | Operation             | Expected (Word)                                                                               |
| ---- | --------------------------------------------------------- | ---------------------------- | --------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| CB-1 | `**bold text**`                                           | cursor only                  | Copy                  | clipboard = current word `bold` (Word: copies word at cursor) or empty if no auto-word-select |
| CB-2 | `**bold text**`                                           | cursor only                  | Cut                   | Word's "Use smart cut/paste" setting applies; default: no-op or cut line                      |
| CB-3 | `**bold start** middle <u>under</u>`                      | partial `"start middle und"` | Copy                  | clipboard preserves rendered formatting of selected range only                                |
| CB-4 | clipboard = plain text; document `==highlight==`          | partial inside highlight     | Paste plain           | replaces selection with plain text inside surviving `==…==` wrapping                          |
| CB-5 | clipboard = `<b>bold content</b>`; doc `<u>underline</u>` | partial inside `<u>`         | Paste keep-formatting | `<u>unde</u><b>bold content</b><u>rline</u>` (split underline; bold survives)                 |
| CB-6 | clipboard = formatted; cursor at `<b>bold                 | </b>` boundary               | cursor at end of bold | Paste                                                                                         | pasted content adopts left-side formatting (bold) per Word convention |
| CB-7 | clipboard = `> [!note]\nContent`                          | partial in normal paragraph  | Paste                 | block structure splits paragraph; callout becomes its own line                                |
| CB-8 | clipboard = colored span; cursor inside `==highlight==`   | cursor only                  | Paste keep-formatting | inserted span inherits highlight + color (stack)                                              |

### 3.4 Format Painter — Cross-Group

| #     | Source format                                  | Apply target      | Expected (Word)                                                                        |
| ----- | ---------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------- |
| FPC-1 | mixed nested `**bold italic *text***`          | plain `text`      | `**text**` (only outermost layer applied; Word's painter copies single primary format) |
| FPC-2 | `<span color:red>red text</span>`              | `#tag` (tag text) | `<span color:red>#tag</span>` (color wraps tag syntax intact)                          |
| FPC-3 | `> [!important]\nCallout` (block-level)        | normal paragraph  | paragraph becomes callout block                                                        |
| FPC-4 | `## Heading 2 **bold**` (mixed block + inline) | normal paragraph  | paragraph becomes H2; inline bold copied per Word convention                           |

### 3.5 Email / Navigate

| #    | Scenario                                    | Operation             | Expected (Word-equivalent)                                            |
| ---- | ------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| EM-1 | document with mixed heading + bold + italic | Email Page            | export preserves all formatting (heading, bold, italic) as HTML email |
| EM-2 | cursor only on title line                   | Email Page            | exports the entire document, not partial                              |
| EM-3 | document with callout block                 | Email Page            | callout converted to plain blockquote (email clients lack callout)    |
| EM-4 | document with `[link](url)`                 | Email Page            | link preserved as `<a href="url">` in email HTML                      |
| NV-1 | multi-level headings, cursor anywhere       | Fold All              | fold collapses; cursor remains; scroll snaps to keep cursor visible   |
| NV-2 | selection across H3 + content               | Fold All → Unfold All | selection preserved through fold/unfold cycle                         |
| NV-3 | callout inside list                         | Fold All              | callout folds with parent list                                        |

### 3.6 Cross-Feature Combinations

| #    | Input                                     | Selection / cursor         | Operation             | Expected (Word)                                                                 |
| ---- | ----------------------------------------- | -------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| XF-1 | `**bold** *italic* __underline__`         | full all three             | apply "Heading 1"     | `# **bold** *italic* __underline__` (heading prefix added; inline preserved)    |
| XF-2 | `**bold [[link]] text**`                  | partial bold→link          | apply "Normal"        | `bold [[link]] text` (bold removed; link preserved)                             |
| XF-3 | `==highlight **bold**==`                  | inner `"bold"`             | apply "Heading 2"     | `## ==highlight **bold**==` (heading wraps line; inline kept)                   |
| XF-4 | `> [!important]\n> **Bold callout text**` | full callout type + body   | remove callout + bold | `> Bold callout text` (callout stripped; bold removed)                          |
| XF-5 | `Text with <span color:red>#tag</span>`   | partial colored tag `"ta"` | toggle different tag  | `Text with <span color:red>#new</span>` (tag swapped; color preserved on whole) |
| XF-6 | `- [ ] **important** task`                | full task line             | toggle task off       | `**important** task` (task syntax removed; bold preserved)                      |

### 3.7 Tags + Links

| #    | Input                   | Selection / cursor  | Operation         | Expected (Word-equivalent)                                                  |
| ---- | ----------------------- | ------------------- | ----------------- | --------------------------------------------------------------------------- |
| TL-1 | `[link text](url) #tag` | cursor inside link  | toggle "#urgent"  | `[link text](url) #urgent #tag` (tag added at end of line, not inside link) |
| TL-2 | `#tag [link](url) text` | crossing tag→link   | toggle "#other"   | `#other tag [link](url) text` (tag replaced; link preserved)                |
| TL-3 | `[#important](url)`     | full `"#important"` | apply "Heading 1" | `# [#important](url)` (heading wraps; link survives)                        |

### 3.8 Callout Multi-Line & Nesting

| #    | Input                                   | Selection / cursor         | Operation          | Expected (Word-equivalent)                                                           |
| ---- | --------------------------------------- | -------------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| CL-1 | `> [!note]\n> Line 1\n> Line 2`         | cursor on Line 2 body      | toggle "Important" | `> [!important]\n> Line 1\n> Line 2` (entire callout retypes — type is block-scoped) |
| CL-2 | `> [!note]\n> Note text\n\nNormal para` | crossing callout boundary  | toggle callout off | callout fully unwrapped: `Note text\n\nNormal para`                                  |
| CL-3 | `> [!note]\n>   - nested list`          | nested list inside callout | apply "Heading 2"  | only list line transforms: `> [!note]\n>   ## nested list` or escapes callout        |

### 3.9 Clipboard + Tags

| #    | Clipboard                      | Cursor        | Operation | Expected (Word-equivalent)                                           |
| ---- | ------------------------------ | ------------- | --------- | -------------------------------------------------------------------- |
| CT-1 | `#tag1 #tag2` plain text       | clean line    | Paste     | pasted as literal text (do not auto-activate as tag triggers)        |
| CT-2 | `> [!note]\nCallout structure` | mid-paragraph | Paste     | paragraph splits: text-before, callout block on own line, text-after |

---

## 4. Structural and Cross-Cutting

### 4.1 Block Boundary Cases

| #    | Input                        | Selection                       | Operation       | Expected (Word)                                                  |
| ---- | ---------------------------- | ------------------------------- | --------------- | ---------------------------------------------------------------- |
| BB-1 | `hello\nworld`               | full both lines                 | toggleUnderline | `<u>hello</u>\n<u>world</u>` (per-line)                          |
| BB-2 | `hello\n\nworld`             | full incl. empty line           | toggleUnderline | `<u>hello</u>\n\n<u>world</u>` (skip empty line)                 |
| BB-3 | `## Heading\nBody text`      | from heading start through body | toggleBold      | `## **Heading**\n**Body text**` (preserve heading prefix)        |
| BB-4 | `> Quote line\nRegular text` | crossing blockquote boundary    | toggleUnderline | `> <u>Quote line</u>\n<u>Regular text</u>` (preserve `>` prefix) |
| BB-5 | `hello\n\n\nworld`           | full incl. multiple empty lines | toggleItalic    | `<i>hello</i>\n\n\n<i>world</i>`                                 |

### 4.2 Line-Prefix Preservation

| #    | Input               | Selection (text only)     | Operation       | Expected (Word)                      |
| ---- | ------------------- | ------------------------- | --------------- | ------------------------------------ |
| LP-1 | `## Heading text`   | `"Heading text"` only     | toggleBold      | `## **Heading text**`                |
| LP-2 | `- List item`       | `"List item"` only        | toggleBold      | `- **List item**`                    |
| LP-3 | `1. Ordered item`   | `"Ordered item"` only     | toggleUnderline | `1. <u>Ordered item</u>`             |
| LP-4 | `> Quote content`   | `"Quote content"` only    | toggleItalic    | `> *Quote content*`                  |
| LP-5 | `- [ ] Task text`   | `"Task text"` only        | toggleBold      | `- [ ] **Task text**`                |
| LP-6 | `> > Nested quote`  | `"Nested quote"` only     | toggleUnderline | `> > <u>Nested quote</u>`            |
| LP-7 | `    Indented code` | text after 4-space indent | toggleBold      | no-op if indented code block (inert) |

### 4.3 Inert-Zone Partial Entry

| #    | Input                                           | Selection                  | Operation       | Expected (Word-equivalent)                                     |
| ---- | ----------------------------------------------- | -------------------------- | --------------- | -------------------------------------------------------------- |
| IZ-1 | `hello \`code\` world`                          | partial entering backticks | toggleUnderline | `<u>hello </u>\`code\`<u> world</u>` (split around inert)      |
| IZ-2 | `Text before \`code` (unclosed code)            | full                       | toggleBold      | `<b>Text before \`code</b>` (unclosed treated as plain)        |
| IZ-3 | `text before\n\`\`\`\ncode\n\`\`\`\ntext after` | crossing fence             | toggleUnderline | only outside-fence portions formatted; fence content untouched |
| IZ-4 | `$x = 1$` inline math                           | full                       | toggleBold      | no-op (inert)                                                  |
| IZ-5 | `Before $ math $ After`                         | partial entering math      | toggleItalic    | `<i>Before </i>$ math $<i> After</i>`                          |
| IZ-6 | markdown table full                             | full                       | toggleUnderline | no-op                                                          |

### 4.4 Frontmatter & Comments

| #    | Input                            | Selection                   | Operation       | Expected (Word-equivalent)                   |
| ---- | -------------------------------- | --------------------------- | --------------- | -------------------------------------------- |
| FM-1 | `---\ntitle: Note\n---\nContent` | crosses frontmatter+content | toggleBold      | frontmatter preserved; only `Content` bolded |
| FM-2 | `---\nmeta\n---`                 | full frontmatter only       | toggleUnderline | no-op                                        |
| FM-3 | unclosed `---`                   | full                        | toggleBold      | treat as horizontal rule or fail gracefully  |
| HC-1 | `hello <!-- comment --> world`   | full                        | toggleBold      | `<b>hello </b><!-- comment --><b> world</b>` |
| HC-2 | full HTML comment only           | full                        | toggleUnderline | no-op                                        |
| HC-3 | `before<!--no space-->after`     | full                        | toggleItalic    | `<i>before</i><!--no space--><i>after</i>`   |
| HC-4 | unclosed comment                 | full                        | toggleUnderline | fail gracefully or wrap entire selection     |

### 4.5 Embedded HTML Attributes

| #    | Input                                                          | Selection         | Operation              | Expected (Word-equivalent)                                                       |
| ---- | -------------------------------------------------------------- | ----------------- | ---------------------- | -------------------------------------------------------------------------------- |
| EA-1 | `<span data-custom="value">hello world</span>`                 | `"hello"` partial | toggleBold             | split preserves data-attr: `<span data-custom="value"><b>hello</b> world</span>` |
| EA-2 | `<b class="important">text</b>`                                | `"tex"` partial   | toggleUnderline        | `<b class="important"><u>tex</u>t</b>` (class preserved on punch-out side)       |
| EA-3 | `<span style="color:red" data-id="123">content</span>`         | partial content   | toggleItalic           | all attributes preserved on split spans                                          |
| EA-4 | `<div id="wrapper" aria-label="x"><b>bold</b> text</div>`      | full              | toggleUnderline        | nested attributes preserved                                                      |
| EA-5 | `<span style="color:red" class="x" data-foo="bar">text</span>` | full              | applyFontColor("blue") | `<span style="color:blue" class="x" data-foo="bar">text</span>`                  |
| TC-1 | `<b class="important">text</b>`                                | `"tex"` partial   | toggleBold             | `<b class="important">tex</b>t` (class preserved on remaining bold side)         |
| TC-2 | `<u class="highlight">content</u>`                             | full              | toggleUnderline        | `content` (class lost with tag — acceptable)                                     |
| TC-3 | `<i class="citation">text</i>`                                 | partial           | toggleItalic           | class preserved on punch-out                                                     |

### 4.6 Self-Closing & Malformed Recovery

| #    | Input                                 | Selection | Operation       | Expected (Word-equivalent)                                    |
| ---- | ------------------------------------- | --------- | --------------- | ------------------------------------------------------------- |
| SC-1 | `hello<br />world`                    | full      | toggleUnderline | `<u>hello</u><br /><u>world</u>`                              |
| SC-2 | `line1<hr />line2`                    | full      | toggleBold      | `<b>line1</b><hr /><b>line2</b>`                              |
| SC-3 | `text<img src="x" />more`             | full      | toggleItalic    | `<i>text</i><img src="x" /><i>more</i>`                       |
| MF-1 | `<b>hello` (unclosed)                 | `"hello"` | toggleBold      | normalize: close tag → `hello` (recover)                      |
| MF-2 | `hello</b>` (orphan close)            | full      | toggleBold      | `<b>hello</b>` (ignore orphan, apply)                         |
| MF-3 | `<b>a<b>b</b>` (unclosed nested)      | full      | toggleBold      | normalize then toggle off → `ab`                              |
| MF-4 | `<b>hello<i>world</b></i>` mismatched | full      | toggleBold      | best-effort: treat as `<b>hello</b><i>world</i>`; remove bold |
| MF-5 | `<b style=>hello</b>` broken attr     | full      | toggleBold      | tolerate or skip; do not corrupt                              |

### 4.7 Unicode Boundaries

| #    | Input                          | Selection                          | Operation       | Expected (Word)                                  |
| ---- | ------------------------------ | ---------------------------------- | --------------- | ------------------------------------------------ |
| UB-1 | `hello 😀 world`               | the emoji as 2-byte surrogate pair | toggleBold      | `hello <b>😀</b> world` (surrogate-pair safe)    |
| UB-2 | `e\u0301` (combining acute)    | full grapheme                      | toggleUnderline | `<u>é</u>` (grapheme cluster respected)          |
| UB-3 | `hello\u200Dworld` (ZWJ)       | full                               | toggleItalic    | `<i>hello\u200Dworld</i>` (ZWJ preserved inside) |
| UB-4 | `שלום world` (RTL + LTR)       | full                               | toggleBold      | `<b>שלום world</b>` (bidi-safe)                  |
| UB-5 | `👨‍👩‍👧‍👦` (family ZWJ sequence)     | full sequence                      | toggleUnderline | `<u>👨‍👩‍👧‍👦</u>` (atomic cluster)                     |
| UB-6 | `ಕನ್ನಡ text` (Kannada complex) | crossing grapheme                  | toggleItalic    | grapheme boundaries respected                    |

### 4.8 Performance & Round-Trip

| #    | Scenario                                                                  | Operation                   | Expected (Word)                         |
| ---- | ------------------------------------------------------------------------- | --------------------------- | --------------------------------------- |
| LS-1 | huge doc 1000+ lines, 50+ tags                                            | removeAllTags on entire doc | clean removal; sub-second perf          |
| LS-2 | deeply nested tags (10 levels) × 100 occurrences                          | toggleBold full             | outermost removed; geometric ops O(n)   |
| LS-3 | 1MB text + 100K tags                                                      | toggleUnderline             | completes without stack/memory issues   |
| RT-1 | `hello world` → toggleBold → toggleBold                                   |                             | byte-identical to original              |
| RT-2 | `<b>hello</b> world` → full toggleBold → full toggleBold                  |                             | byte-identical to original              |
| RT-3 | `**bold *italic* bold**` → clearFormatting → toggleBold → clearFormatting |                             | three-cycle: ends as `bold italic bold` |
| RT-4 | `<u><b>text</b></u>` → toggleUnderline → toggleUnderline                  |                             | byte-identical or render-equivalent     |

### 4.9 Format Painter Across Leaves

| #     | Sequence                                                                                  | Expected (Word-equivalent)                      |
| ----- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| FPL-1 | activate painter from `<u>text</u>` → switch leaf to different note → select text → paint | format applies in new leaf                      |
| FPL-2 | activate painter → cursor moves within same note → select text → paint                    | format unchanged; applies                       |
| FPL-3 | activate painter (red) → leave + return → select → paint                                  | painter state intact                            |
| FPL-4 | activate painter → source text edited externally → return → paint                         | gracefully no-op or re-anchor to current cursor |

### 4.10 Undo / Redo

| #    | Sequence                                                      | Expected                                                                        |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| UR-1 | toggleBold → toggleItalic → toggleUnderline on same selection | three undo steps (or one grouped per Word's "format toggles within typing run") |
| UR-2 | toggleBold then undo                                          | cursor / selection restored                                                     |
| UR-3 | toggleBold → undo → redo                                      | byte-identical formatting recovered                                             |
| UR-4 | toggleBold + toggleItalic in rapid succession; single undo    | both reversed (grouped) — Word convention                                       |
| UR-5 | toggleBold → undo → edit text → redo                          | redo gracefully no-ops or re-applies if range still valid                       |

### 4.11 Live State / Concurrency

| #     | Scenario                                                                         | Expected                                        |
| ----- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| LES-1 | toggleBold starts on `[0, 10]`; selection externally changes to `[5, 15]` mid-op | atomic on captured `[0, 10]`                    |
| LES-2 | multi-step toggle (remove + add) with mid-op MD↔HTML conversion                  | re-detect domain; no double-wrap                |
| LES-3 | removeAllTags with `preserveLinePrefix`; line prefix changes during op           | preserve original-intent prefix                 |
| CC-1  | three rapid Ctrl+B presses                                                       | net state odd-count = bold; queued sequentially |
| CC-2  | rapid bold, italic, underline on different ranges                                | each independent; no interference               |
| CC-3  | toggleBold twice in immediate succession on same selection                       | net no-op                                       |

### 4.12 Markdown Delimiter Ambiguity

| #    | Input                      | Selection / operation           | Expected (Word-equivalent)                                               |
| ---- | -------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| MA-1 | `*a *b* c*`                | full → toggleItalic             | resolve as nested → `<i>a *b* c</i>` (longest delim first)               |
| MA-2 | `_a_b_` (intra-word)       | full → toggleItalic             | treat as not-italic per CommonMark; toggle adds `<i>_a_b_</i>` literally |
| MA-3 | `**a*b**`                  | full → toggleBold               | parse as bold containing literal `*`: `<b>a*b</b>`                       |
| MA-4 | `***bold italic***`        | full → toggleBold               | remove only bold layer → `*bold italic*`                                 |
| MA-5 | `_text_more_text_`         | partial `[0, 5]` → toggleItalic | ambiguous — fail gracefully or treat selected as plain                   |
| MA-6 | `**text *italic* **text**` | crossing italic boundary        | apply bold to selection; preserve italic structure where possible        |

---

## 5. Rare and Exotic

### 5.1 IME / Composition Input

| #     | Scenario                                                                               | Operation       | Expected                                                          |
| ----- | -------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------- |
| IME-1 | mid-Japanese composition (uncommitted underline visible) + selection on committed text | toggleBold      | abort composition cleanly; apply bold to committed-text selection |
| IME-2 | committed `こんにちは` partial selection                                               | applyFontColor  | applied on grapheme boundaries (not byte)                         |
| IME-3 | Chinese pinyin candidate menu open                                                     | toggleUnderline | apply only after IME commits; close menu                          |
| IME-4 | Korean Hangul composition; cursor inside composition buffer                            | toggleItalic    | no-op; flip typing state for next committed char                  |

### 5.2 Word Selection by Double-Click & Grapheme Boundaries

| #     | Scenario                                                                 | Operation       | Expected                                             |
| ----- | ------------------------------------------------------------------------ | --------------- | ---------------------------------------------------- |
| WDC-1 | text with multi-codepoint emoji `👨‍👩‍👧`; double-click on emoji              | toggleBold      | full grapheme cluster selected as one unit           |
| WDC-2 | combining diacritics `café` (`e` + combining acute); double-click on `e` | toggleBold      | grapheme respected; `café` wrapped together          |
| WDC-3 | RTL Arabic with ZWJ; double-click                                        | toggleUnderline | RTL clustering respected; hidden join marks included |
| WDC-4 | `it's` / `don't` (apostrophe); double-click                              | toggleBold      | per Word: full word incl. apostrophe                 |

### 5.3 Drag-Select Reverse

| #    | Scenario                                             | Operation       | Expected                                   |
| ---- | ---------------------------------------------------- | --------------- | ------------------------------------------ |
| DR-1 | drag from 10 to 5; selection normalized to `[5, 10]` | toggleBold      | applied to `[5, 10]`; direction immaterial |
| DR-2 | drag backward inside `<b>` from end to mid           | toggleBold      | partial punch-out                          |
| DR-3 | drag backward across 3 adjacent same tags            | toggleUnderline | mixed → uniform application                |

### 5.4 Triple-Click Line Select

| #    | Scenario                                           | Operation       | Expected                               |
| ---- | -------------------------------------------------- | --------------- | -------------------------------------- |
| TC-1 | bullet list `- hello world` triple-click           | toggleBold      | preserve `- ` prefix; bold the rest    |
| TC-2 | heading `## My Heading` triple-click               | toggleUnderline | preserve `## `; underline content      |
| TC-3 | blockquote with hard wrap; triple-click            | toggleBold      | selects logical line, not display line |
| TC-4 | line with soft hyphen `exam<SHY>ple`; triple-click | toggleBold      | SHY included; whole line bolded        |

### 5.5 Folded Heading Selection

| #    | Scenario                                                       | Operation      | Expected                                           |
| ---- | -------------------------------------------------------------- | -------------- | -------------------------------------------------- |
| FH-1 | folded heading; selection spans visible + hidden text          | toggleBold     | apply to entire source range; fold state unchanged |
| FH-2 | `### Heading\nfolded content` selection of both                | applyFontColor | both colored in source                             |
| FH-3 | nested headings, outer folded, inner not; cross-fold selection | removeAllTags  | all formatting removed from full range             |

### 5.6 Live Preview vs Source Mode

| #    | Scenario                                                           | Operation       | Expected                                                     |
| ---- | ------------------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| LP-1 | selection in Live Preview; operation triggered                     | toggleBold      | engine maps visual sel → source offsets; correct application |
| LP-2 | mode switches mid-operation                                        | toggleUnderline | cancel safely or apply on source offsets                     |
| LP-3 | rendered MD `**bold**` selected in Live Preview                    | applyFontColor  | source offsets correctly identified                          |
| LP-4 | cursor at visual end-of-line where source line continues (wrapped) | toggleItalic    | typing state set on source offset                            |

### 5.7 Smart Quotes / Autocorrect

| #    | Scenario                                                                            | Expected                                         |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| SQ-1 | autocorrect rewrites `"hello` → `"hello"` after selection captured; toggleBold runs | engine adjusts to post-autocorrect offsets       |
| SQ-2 | autocorrect rewrites `dont` → `don't`; selection re-aligns                          | applied to correct substring                     |
| SQ-3 | autocorrect changes word length mid-operation                                       | offset tracking survives; consistent application |

### 5.8 Line Endings (CRLF vs LF)

| #    | Scenario                                                         | Operation      | Expected                                      |
| ---- | ---------------------------------------------------------------- | -------------- | --------------------------------------------- |
| LE-1 | multi-line selection in CRLF doc; offsets calculated on LF basis | toggleBold     | normalize internally; correct application     |
| LE-2 | offset mismatch due to `\r\n` byte-counting                      | applyFontColor | explicit normalization; no corruption         |
| LE-3 | external paste with CRLF                                         | Paste          | CRLF preserved; post-paste offsets stay valid |

### 5.9 Bidi Text Direction Overrides

| #    | Scenario                                               | Operation       | Expected                             |
| ---- | ------------------------------------------------------ | --------------- | ------------------------------------ |
| BD-1 | `hello עברית world` with LRM/RLM marks; full selection | toggleBold      | bidi marks preserved; uniform format |
| BD-2 | `<bdo dir="rtl">hello</bdo>` partial selection         | toggleUnderline | BDO preserved; punch-out within      |
| BD-3 | Arabic with Farsi variation marks (`پ` vs `ب`)         | toggleItalic    | variation marks preserved            |

### 5.10 Invisible Characters

| #    | Scenario                                                         | Operation              | Expected                                        |
| ---- | ---------------------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| IC-1 | text with soft hyphen U+00AD; selection includes SHY             | toggleBold             | SHY preserved inside `<b>`                      |
| IC-2 | text with NBSP U+00A0; selection crosses NBSP                    | applyFontColor("blue") | NBSP included; renders non-breaking under color |
| IC-3 | text with narrow no-break space U+202F; selection includes NNBSP | toggleUnderline        | NNBSP preserved                                 |

### 5.11 Selection Inside Markdown Link URL / Wiki-Link Alias

| #     | Scenario                                                      | Operation                                        | Expected                                               |
| ----- | ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ | ------------------------------ | -------------------- |
| MLU-1 | cursor inside `(http://example.com)` portion of `[text](url)` | toggleBold                                       | URL is protected; no-op (or warning)                   |
| MLU-2 | selection spans link text + URL                               | toggleUnderline                                  | text portion formatted; URL untouched                  |
| MLU-3 | full link (text + url) selection                              | clearFormatting                                  | clears text formatting; preserves link structure + URL |
| WLA-1 | wiki-link `[[Note                                             | alias text]]` selection inside alias             | toggleBold                                             | alias formatted: `[[Note       | <b>alias text</b>]]` |
| WLA-2 | wiki-link with `[[Note                                        | **bold alias**]]` partial selection inside alias | toggleBold                                             | punch-out applied within alias |
| WLA-3 | selection spans note name + alias                             | toggleUnderline                                  | target name protected; only alias portion formatted    |

### 5.12 Triple-Nested & Mixed Self-Closing

| #     | Scenario                                                 | Operation       | Expected                                                             |
| ----- | -------------------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| TN-1  | `<b><b><b>text</b></b></b>` partial selection            | toggleBold      | normalize then punch-out: `<b>tex</b>t<b></b>` or fully clean `text` |
| TN-2  | `**___hello___**` partial `"hel"`                        | toggleBold      | resolve innermost match; punch out bold layer                        |
| MSC-1 | `<b>text<br />more text</b>` selection crossing `<br />` | toggleBold      | `text<br /><b>more text</b>` or split-wrap; BR preserved             |
| MSC-2 | `<u>hello<img />world</u>` selection crossing img        | toggleUnderline | `<u>hel</u>lo<img /><u>world</u>` (split around image)               |
| MSC-3 | `**text [link](url) more**` selection crossing link      | toggleBold      | link protected; partial bold punch-out around it                     |

### 5.13 Modal / Dropdown / Search Open

| #    | Scenario                                                                  | Operation       | Expected                                           |
| ---- | ------------------------------------------------------------------------- | --------------- | -------------------------------------------------- |
| MD-1 | font color picker open; Ctrl+B pressed                                    | toggleBold      | apply to selection; close picker (Word convention) |
| MD-2 | autocomplete `@mention` menu open; Ctrl+I pressed                         | toggleItalic    | queue or ignore until menu closes                  |
| MD-3 | search-and-replace overlay active during replace-all                      | toggleBold      | format does not interfere; queued                  |
| MD-4 | search panel open with highlights; format applied to non-highlighted text | toggleUnderline | applied; highlights remain                         |

### 5.14 Empty / Single-Char / EOF

| #      | Scenario                                               | Operation                                   | Expected                                                    |
| ------ | ------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------- |
| EM-1   | empty document, cursor at 0                            | toggleBold                                  | no-op; typing state set                                     |
| EM-2   | empty document, multiple toggles before typing         | toggleBold → toggleItalic → toggleUnderline | typing state stacks; `<b><i><u>x</u></i></b>` on first char |
| SC-1   | document `a`, cursor at 0                              | toggleBold                                  | no-op; typing state                                         |
| SC-2   | document `a`, cursor at 1                              | toggleUnderline                             | no-op; typing state                                         |
| SC-3   | document `a`, full selection `[0, 1]`                  | toggleBold                                  | `<b>a</b>`                                                  |
| SC-4   | document `a`, toggleBold at 0 then type `x`            |                                             | `<b>x</b>a`                                                 |
| EOF-1  | `hello\nworld\n`, selection `"world\n"` incl. trailing | toggleBold                                  | `hello\n<b>world</b>\n` (trailing newline outside)          |
| EOF-2  | `text\n`, full selection                               | removeAllTags                               | `text\n`                                                    |
| PEOF-1 | document `hello`, selection `[5, 5]` past end          | toggleBold                                  | no-op                                                       |
| PEOF-2 | document `hello`, sel `[3, 5]` then cursor `[5, 5]`    | toggleUnderline                             | no-op                                                       |

### 5.15 Invalid / Programmatic Selection Ranges

| #    | Scenario                          | Operation       | Expected                              |
| ---- | --------------------------------- | --------------- | ------------------------------------- |
| IR-1 | `hello world` selection `[10, 5]` | toggleBold      | normalize to `[5, 10]`; bold `"worl"` |
| IR-2 | `hello` selection `[-1, 3]`       | toggleUnderline | clamp to `[0, 3]`; `<u>hel</u>lo`     |
| IR-3 | `hello` selection `[2, 100]`      | applyFontColor  | clamp to `[2, 5]`                     |
| IR-4 | `[NaN, 10]` or `[5, undefined]`   | toggleBold      | error gracefully; no source change    |

### 5.16 Undo of No-Ops

| #    | Scenario                                                       | Expected                                |
| ---- | -------------------------------------------------------------- | --------------------------------------- |
| UN-1 | `<b>hello</b>` full → toggleBold (real removal) → undo         | reverts to `<b>hello</b>`               |
| UN-2 | `hello`, cursor-only toggleBold (no source change), undo       | should NOT consume undo slot            |
| UN-3 | multiple consecutive cursor-only no-op toggles, multiple undos | only real source mutations consume undo |

### 5.17 Read-Only / Preview Mode

| #    | Scenario                                            | Operation       | Expected                                         |
| ---- | --------------------------------------------------- | --------------- | ------------------------------------------------ |
| RO-1 | editor in preview mode; bold shortcut pressed       | toggleBold      | no-op; user notified or silent                   |
| RO-2 | file marked read-only; format command triggered     | toggleUnderline | rejected with error                              |
| RO-3 | Focus mode active; selection outside focused region | toggleItalic    | depends on Obsidian setting; consistent behavior |

### 5.18 External Clipboard (MS Word / Browser)

| #     | Scenario                                                                                      | Operation     | Expected                                                                   |
| ----- | --------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------- |
| ExC-1 | format painter holds red color; clipboard from Word with HTML blue span; paste over selection | painter+paste | apply order well-defined; final color predictable                          |
| ExC-2 | painter holds bold+italic+red; target inside blue span                                        | applyPainter  | full painter applied; underlying blue replaced or nested per convention    |
| ExC-3 | external Word HTML paste over partial selection inside formatted text                         | paste         | inserted content honors clipboard formatting; surrounding format preserved |

### 5.19 Selection Across Embeds

| #    | Scenario                                                                | Operation       | Expected                                 |
| ---- | ----------------------------------------------------------------------- | --------------- | ---------------------------------------- |
| EB-1 | `text ![[Note]] text`; selection spans both                             | toggleBold      | embed protected; text portions wrapped   |
| EB-2 | inline `![alt](url.png)`; selection crosses alt boundary                | toggleUnderline | preserve image; format only outside      |
| EB-3 | large embed renders as block; selection from after embed back to before | toggleItalic    | embed preserved; text portions formatted |

### 5.20 Final Misc

| #    | Scenario                                                    | Operation                    | Expected                                                    |
| ---- | ----------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------- |
| MX-1 | `👨‍👩‍👧‍👦family❤️text` selection across emoji clusters            | toggleBold                   | clusters preserved as units                                 |
| MX-2 | undo deep chain: 10 ops → undo 5 → redo 3 → new format      | toggleBold                   | redo branch discarded; new branch starts                    |
| MX-3 | rapid sequence of two format commands queued                | toggleBold then toggleItalic | both apply cleanly per concurrency model                    |
| MX-4 | very-large selection `[0, 1000000]`                         | toggleBold                   | sub-second; UI stays responsive                             |
| MX-5 | source corrupted with unpaired tags `<b>hello</i>world</b>` | toggleUnderline on `"llo"`   | best-effort; do not crash                                   |
| MX-6 | callout placeholder marker: `> [!note]` empty               | toggleBold                   | placeholder preserved; not selectable or selection rejected |

---

## 6. Summary

### Aggregated Counts

| Section                       | Cases    |
| ----------------------------- | -------- |
| 1. Basic text toggles         | 51       |
| 2. Span attribute cases       | 75       |
| 3. Block & action groups      | 45       |
| 4. Structural & cross-cutting | 47       |
| 5. Rare & exotic              | 65+      |
| **Total NEW edge cases**      | **283+** |

### Recommended Test-Authoring Priority

1. **Punch-out & selection-scope correctness** (largest user-visible bug class): 1.1, 1.6, 2.1–2.6, 3.1, 4.2, 5.11.
2. **Cursor-only no-op invariant**: 1.1 (CB-3 to CB-5 from main report), 1.6 (ET-1), 2.7, 5.14.
3. **Multi-property and same-property normalization**: 2.1–2.4, 2.10.
4. **Block boundary & line-prefix preservation**: 4.1–4.2, 1.4.
5. **Inert-zone & protected-range correctness**: 4.3, 5.11.
6. **Idempotency & round-trip stability**: 2.11, 4.8.
7. **Highlight pen state model**: 2.8, 2.24, 3.2.
8. **External integration (clipboard, format painter, IME)**: 3.3–3.4, 5.1, 5.7, 5.18.
9. **Robustness (malformed input, invalid ranges)**: 4.6, 5.15.
10. **Performance & concurrency**: 4.8, 4.11, 5.13, 5.20.

### Termination Note

After two parallel rounds of agent brainstorming, no fundamentally new categories
emerged in Round 2 beyond the structural cross-products of categories defined in
Round 1. Further enumeration would consist of cross-combinations (e.g. "RTL inside
folded callout with smart-quote autocorrect mid-IME") best handled by property-based
or fuzz testing rather than hand-authored cases.
