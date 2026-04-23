# Styling Engine — Edge Cases Report (Microsoft Word Spec)

> **Methodology:** Every **Expected (Word)** result describes how Microsoft Word would
> behave for the equivalent operation on rendered formatted text. The **Current (code)**
> column flags where today's TypeScript implementation diverges from that spec — those
> rows are tracked bugs.
>
> **Notation:** `|` = zero-width cursor; `[A, B]` = selection from offset A to B in
> source text. Rendered formatting is shown in the source representation the engine
> would emit (HTML tags or Markdown delimiters). Two equivalent representations
> (e.g. `hello<b> world</b>` vs `hello **world**`) are interchangeable; either is
> acceptable as long as the rendered visual matches Word.

---

## Word's Formatting Model — Principles

These principles drive every "Expected (Word)" result below.

1. **Toggle on a non-empty selection** — three branches:
   - Fully formatted with the target tag → remove from the entire selection.
   - Partially formatted (mixed) → make the entire selection uniformly formatted (apply, do not toggle off).
   - Unformatted → apply to the entire selection.
2. **Cursor-only toggle (zero-width selection)** — never modifies visible text.
   Pressing the toggle only flips the _typing state_ for the next inserted character.
   The source must remain byte-identical (no empty `<u></u>` injected, no MD delimiters added).
3. **Partial selection inside a larger formatted region — punch-out.** The selected
   sub-region is unformatted while text on either side of the selection retains the
   formatting. The outer tag is split into two surrounding fragments.
4. **Span attributes (color, font-family, font-size, background)** — always scoped
   strictly to the selection. Existing attributes outside the selection must not change.
   A partial selection inside a colored region splits the span; the unselected portion
   keeps its color, the selection takes the new color.
5. **Subscript / superscript are mutually exclusive.** Toggling sup on a sub-formatted
   selection swaps the selection only; surrounding sub-text on either side stays sub.
6. **Cross-tag selections** — operate on the selection range; never silently no-op.
7. **Clear formatting** — strips ALL formatting from the selection cleanly. No
   delimiter-character regex artifacts. Equivalent to selecting the rendered text and
   pressing Word's "Clear All Formatting" button.
8. **Inert zones (fenced code, math blocks, tables)** — Word has no equivalent. Treating
   them as no-op is acceptable (and matches user expectation in Obsidian).
9. **Protected ranges (wiki-links, embeds, footnotes)** — Word has no equivalent. Wrapping
   plain text _around_ these inclusions while leaving the inclusions themselves untouched
   matches user expectation in Obsidian.

---

## 1. Cursor Position Relative to Tag Delimiters

For `<u>hello</u>` (length 12): `openingTagStart=0, openingTagEnd=3, closingTagStart=8, closingTagEnd=12`.
Word does not have visible delimiters, so **every cursor-only toggle here must leave the
source byte-identical** and only flip the typing state for the next character.

| #     | Input          | Cursor / Selection                          | Operation       | Expected (Word)             | Current (code)                                           |
| ----- | -------------- | ------------------------------------------- | --------------- | --------------------------- | -------------------------------------------------------- |
| CB-1  | `<u>hello</u>` | cursor at offset 3 (just inside open tag)   | toggleUnderline | `<u>hello</u>` (no change)  | **BUG:** `hello` (full tag removed)                      |
| CB-2  | `<u>hello</u>` | cursor at offset 8 (just inside close tag)  | toggleUnderline | `<u>hello</u>` (no change)  | **BUG:** `hello` (full tag removed)                      |
| CB-3  | `<u>hello</u>` | cursor at offset 1 (inside opening markup)  | toggleUnderline | `<u>hello</u>` (no change)  | **BUG:** `<u></u><u>hello</u>` (empty tag injected)      |
| CB-4  | `<u>hello</u>` | cursor at offset 0 (before tag)             | toggleUnderline | `<u>hello</u>` (no change)  | **BUG:** `<u></u><u>hello</u>` (empty tag injected)      |
| CB-5  | `<u>hello</u>` | cursor at offset 12 (after tag)             | toggleUnderline | `<u>hello</u>` (no change)  | **BUG:** `<u>hello</u><u></u>` (empty tag injected)      |
| CB-6  | `<u>hello</u>` | selection `[0, 12]` (entire tag + content)  | toggleUnderline | `hello`                     | matches                                                  |
| CB-7  | `<u>hello</u>` | selection `[0, 3]` (opening delimiter only) | toggleUnderline | `<u>hello</u>` (no visible) | **BUG:** `<u><u>hello</u></u>` (double-wrap)             |
| CB-8  | `<u>hello</u>` | selection `[8, 12]` (closing delimiter)     | toggleUnderline | `<u>hello</u>` (no visible) | **BUG:** `<u>hello<u></u></u>`                           |
| CB-9  | `<u>hello</u>` | selection `[0, 8]` (open + content)         | toggleUnderline | `hello`                     | **BUG:** `<u><u>hello</u></u>` (should normalize+toggle) |
| CB-10 | `<u>hello</u>` | selection `[3, 12]` (content + close)       | toggleUnderline | `hello`                     | **BUG:** wraps producing `<u>hello</u></u>` artifact     |

---

## 2. Partial vs Full Selections Inside a Tag — Punch-Out Required

Word's defining behavior: a partial selection inside a formatted region punches the
formatting _out of the selection only_. The current implementation does the opposite —
it removes the entire enclosing tag — which is the dominant correctness gap.

| #    | Input                | Selection                                  | Operation       | Expected (Word)                                                                                                        | Current (code)                        |
| ---- | -------------------- | ------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| PF-1 | `<u>hello world</u>` | `"hello"` = `[3, 8]`                       | toggleUnderline | `hello<u> world</u>`                                                                                                   | **BUG:** `hello world` (full removal) |
| PF-2 | `<u>hello world</u>` | `"world"` = `[9, 14]`                      | toggleUnderline | `<u>hello </u>world`                                                                                                   | **BUG:** `hello world`                |
| PF-3 | `<u>hello world</u>` | `"hello world"` = `[3, 14]` (full content) | toggleUnderline | `hello world`                                                                                                          | matches                               |
| PF-4 | `<u>hello world</u>` | cursor at offset 7 (zero-width inside)     | toggleUnderline | `<u>hello world</u>` (no change)                                                                                       | **BUG:** `hello world` (tag removed)  |
| PF-5 | `**hello world**`    | `"hello"` = `[2, 7]`                       | toggleBold      | `hello** world**`                                                                                                      | **BUG:** `hello world`                |
| PF-6 | `**hello world**`    | cursor at offset 2                         | toggleBold      | `**hello world**` (no change)                                                                                          | **BUG:** `hello world`                |
| PF-7 | `==hello==`          | `"hel"` = `[2, 5]`                         | toggleHighlight | `==hel==lo==` rendered as: `hel` unhighlighted, `lo` highlighted → emit `hel==lo==`                                    | **BUG:** `hello` (full removal)       |
| PF-8 | `<sub>hello</sub>`   | `"hel"` = `[5, 8]`                         | toggleSubscript | `<sub>hel</sub>lo` rendered: select unsubbed, rest still sub → `hel<sub>lo</sub>` (and prefix `<sub></sub>` collapsed) | **BUG:** `hello`                      |
| PF-9 | `<u>hello world</u>` | `"lo wor"` = `[5, 11]` (interior partial)  | toggleUnderline | `<u>hel</u>lo wor<u>ld</u>`                                                                                            | **BUG:** `hello world`                |

---

## 3. Span Attribute Application — Selection-Scoped (Never Mutate Outside)

Word's most user-visible invariant: **applying a color/font/size to a selection never
changes text outside that selection.** The current implementation replaces the entire
enclosing span's attribute even on a partial selection — a high-severity bug.

| #    | Input                                                                      | Selection                      | Operation                  | Expected (Word)                                                                                             | Current (code)                                                                                                    |
| ---- | -------------------------------------------------------------------------- | ------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| SA-1 | `<span style="color:red">hello world</span>`                               | `"hello"` (partial)            | applyFontColor("blue")     | `<span style="color:blue">hello</span><span style="color:red"> world</span>` (split)                        | **BUG:** `<span style="color:blue">hello world</span>` (entire span recolored)                                    |
| SA-2 | `<span style="color:red">hello world</span>`                               | full content `"hello world"`   | applyFontColor("blue")     | `<span style="color:blue">hello world</span>`                                                               | matches                                                                                                           |
| SA-3 | `<span style="color:red">hello world</span>`                               | cursor inside                  | applyFontColor("blue")     | `<span style="color:red">hello world</span>` (no visible change; typing state set to blue)                  | **BUG:** entire span recolored                                                                                    |
| SA-4 | `<span style="color:red">hello</span><span style="color:red">world</span>` | `"lo wo"` crossing both        | applyFontColor("blue")     | `<span style="color:red">hel</span><span style="color:blue">lo wo</span><span style="color:red">rld</span>` | **BUG:** double-nested spans (`<span red>hell<span blue>o</span></span><span red><span blue>wo</span>rld</span>`) |
| SA-5 | `hello world`                                                              | `"hello"`                      | applyFontColor("blue")     | `<span style="color:blue">hello</span> world`                                                               | matches                                                                                                           |
| SA-6 | `<span style="color:red"><span style="color:green">hi</span></span>`       | `"hi"` (full content of inner) | applyFontColor("blue")     | `<span style="color:red"><span style="color:blue">hi</span></span>`                                         | matches (innermost replaced)                                                                                      |
| SA-7 | `<span style="color:red">hi</span>`                                        | `"hi"`                         | applyFontColor("red")      | `<span style="color:red">hi</span>` (genuine no-op)                                                         | matches visually; flagged `isNoOp:false`                                                                          |
| SA-8 | `<span style="font-family:Arial">hello</span>`                             | `"hel"` (partial)              | applyFontFamily("Verdana") | `<span style="font-family:Verdana">hel</span><span style="font-family:Arial">lo</span>` (split)             | **BUG:** entire span re-fonted                                                                                    |
| SA-9 | `<span style="font-family:Arial">hello</span>`                             | cursor inside                  | applyFontColor("red")      | unchanged source (typing state set to red)                                                                  | **BUG:** empty inner color span injected                                                                          |

---

## 4. removeTag (Color/Highlight Clear) — Scope to Selection

Word's "No Color" / "Clear Highlight" actions affect only the selected text. The current
implementation matches by property name only and removes the entire enclosing span.

| #    | Input                                                                  | Selection / Operation                         | Expected (Word)                                                  | Current (code)                               |
| ---- | ---------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| RV-1 | `<span style="color:red">hello world</span>`                           | `"hello"` partial → applyFontColorNoColor     | `hello<span style="color:red"> world</span>`                     | **BUG:** entire span removed → `hello world` |
| RV-2 | `<span style="color:red"><span style="color:blue">hello</span></span>` | full `"hello"` → applyFontColorNoColor("red") | `<span style="color:red">hello</span>` (innermost color cleared) | matches                                      |
| RV-3 | `<span style="color:red"><span style="color:blue">hello</span></span>` | full `"hello"` → applyFontColorNoColor(any)   | `<span style="color:red">hello</span>`                           | matches                                      |
| RV-4 | `hello`                                                                | any → applyFontColorNoColor                   | `hello` (no-op)                                                  | matches                                      |
| RV-5 | `hello`                                                                | applyFontColorNoColor(null)                   | `hello` (no-op)                                                  | matches                                      |
| RV-6 | `<span style="color:red">hello world</span>`                           | cursor inside → applyFontColorNoColor         | unchanged source (typing state cleared)                          | **BUG:** entire span removed                 |
| RV-7 | `<span style="color:red">hello world</span>`                           | full content → applyFontColorNoColor          | `hello world`                                                    | matches                                      |

---

## 5. Adjacent Non-Overlapping Same-Type Tags

Crossing a boundary between two same-type tags should _normalize_ — Word renders them as
one continuous formatted run, so toggling off should clear the selection cleanly.

| #    | Input                       | Selection / Operation                | Expected (Word)                                                                            | Current (code)                                                                     |
| ---- | --------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| AN-1 | `<u>hello</u> <u>world</u>` | `"lo wo"` crossing → toggleUnderline | `<u>hel</u>lo wo<u>rld</u>` (selection unformatted, sides keep)                            | **BUG:** `<u>hel<u>lo</u> <u>wo</u>rld</u>` (over-wraps, creates nested same-type) |
| AN-2 | `<u>hello</u> <u>world</u>` | `"lo wo"` crossing → removeUnderline | `<u>hel</u>lo wo<u>rld</u>` (selection cleared)                                            | **BUG:** no-op                                                                     |
| AN-3 | `<b>one</b><b>two</b>`      | `"netw"` crossing → toggleBold       | `<b>o</b>netw<b>o</b>`                                                                     | **BUG:** wraps with extra outer bold                                               |
| AN-4 | `<u>hello</u> <u>world</u>` | `[0, 25]` full → toggleUnderline     | `hello world` (both removed; underlying space stays underlined or not — render-equivalent) | **BUG:** only outermost match unwrapped; second `<u>` survives                     |
| AN-5 | `<b>hello</b><b>world</b>`  | `[0, 22]` full → toggleBold          | `helloworld` (both removed)                                                                | **BUG:** only one removed                                                          |

---

## 6. Nested Tag Scenarios

| #     | Input                        | Selection / Operation               | Expected (Word)                                                                                                                                                                                     | Current (code)                                    |
| ----- | ---------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| NT-1  | `<b><u>hello world</u></b>`  | `"hello"` partial → toggleBold      | `<b><u>hello</u></b><u> world</u>` rendered: select unbolded but still U; rest both B+U → punch-out `<b>` around selection                                                                          | **BUG:** removes entire `<b>`                     |
| NT-2  | `<b><u>hello world</u></b>`  | `"hello"` partial → toggleUnderline | `<b>hello<u> world</u></b>` (punch-out U from selection)                                                                                                                                            | **BUG:** removes entire `<u>`                     |
| NT-3  | `<b><u>hello world</u></b>`  | `"hello world"` full → toggleBold   | `<u>hello world</u>`                                                                                                                                                                                | matches                                           |
| NT-4  | `<u><u>hello</u></u>`        | `"hel"` partial → toggleUnderline   | (already underlined under both) → punch-out: `<u><u>hel</u></u>lo` rendered: `hel` not underlined (both unwrapped from selection), `lo` still doubly underlined → render-equivalent: `hel<u>lo</u>` | **BUG:** unwraps inner only, leaves outer         |
| NT-5  | `<b><i><u>hello</u></i></b>` | `"hello"` full → toggleBold         | `<i><u>hello</u></i>`                                                                                                                                                                               | matches                                           |
| NT-6  | `<b><i><u>hello</u></i></b>` | `"hello"` full → toggleItalic       | `<b><u>hello</u></b>`                                                                                                                                                                               | matches                                           |
| NT-7  | `<b><i><u>hello</u></i></b>` | `"hello"` full → removeAllTags      | `hello`                                                                                                                                                                                             | matches                                           |
| NT-8  | `<b><b>hello</b></b>`        | `"hello"` full → toggleBold         | `hello` (Word treats stacked-same as one bold run; one toggle clears)                                                                                                                               | **BUG:** only inner `<b>` removed; outer survives |
| NT-9  | `<b><b>hello</b></b>`        | `"hello"` full → removeAllTags      | `hello`                                                                                                                                                                                             | matches                                           |
| NT-10 | `<b><u>hello world</u></b>`  | cursor at offset 8 → toggleBold     | unchanged (typing state set)                                                                                                                                                                        | **BUG:** removes `<b>`                            |

---

## 7. Subscript / Superscript Mutual Exclusion

| #    | Input                          | Selection / Operation                  | Expected (Word)                                                                                                                            | Current (code)                                         |
| ---- | ------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| SS-1 | `<sub>hello world</sub>`       | `"hello"` partial → toggleSuperscript  | `<sup>hello</sup><sub> world</sub>` (swap selection only)                                                                                  | **BUG:** entire tag swapped → `<sup>hello world</sup>` |
| SS-2 | `<sub>hello world</sub>`       | cursor inside → toggleSuperscript      | unchanged (typing state set to sup)                                                                                                        | **BUG:** entire tag swapped                            |
| SS-3 | `<sub>hello world</sub>`       | full content → toggleSuperscript       | `<sup>hello world</sup>`                                                                                                                   | matches                                                |
| SS-4 | `<sub>hello world</sub>`       | `"hello"` partial → toggleSubscript    | `hello<sub> world</sub>` (punch-out)                                                                                                       | **BUG:** entire tag removed                            |
| SS-5 | `hello world`                  | `"hello"` → toggleSuperscript          | `<sup>hello</sup> world`                                                                                                                   | matches                                                |
| SS-6 | `<sup>one</sup><sub>two</sub>` | `"netw"` crossing → toggleSubscript    | `<sup>o</sup>ne<sub>tw</sub><sub>o</sub>` rendered: `<sup>o</sup>ne` plain, `tw` subbed, `o` still subbed → `<sup>o</sup>ne<sub>two</sub>` | **BUG:** outer wrap added                              |
| SS-7 | `<sub>hello world</sub>`       | partial `"lo wor"` → toggleSuperscript | `<sub>hel</sub><sup>lo wor</sup><sub>ld</sub>`                                                                                             | **BUG:** entire tag swapped                            |

---

## 8. Highlight Operation Branches

Word's highlight model: a single "highlight pen" with a current color. Click on selection
applies the current color, or removes it if the selection is fully that color. Color picker
selects a new pen color and applies it to the current selection.

| #     | Source state                            | Operation                                               | Expected (Word)                                                    | Current (code)                            |
| ----- | --------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| HL-1  | `==text==` selection full               | applyHighlightClick (default)                           | `text` (highlight removed)                                         | matches                                   |
| HL-2  | `text` selection full                   | applyHighlightClick (default)                           | `==text==` (default highlight applied)                             | matches                                   |
| HL-3  | `<span bg:#ffff00>text</span>` full     | applyHighlightClick (default = #ffff00)                 | `text` (same color → toggle off)                                   | **BUG:** removes span and adds `==text==` |
| HL-4  | `==<span bg:#ffff00>text</span>==` full | applyHighlightClick (default)                           | `text` (clear all highlight forms)                                 | matches                                   |
| HL-5  | `<span bg:yellow>text</span>` full      | applyHighlightClick (last="yellow")                     | `text` (same color → toggle off)                                   | matches                                   |
| HL-6  | `==text==` full                         | applyHighlightClick (last="yellow")                     | `<span bg:yellow>text</span>` (apply current pen color over MD)    | **BUG:** unchanged                        |
| HL-7  | `<span bg:green>text</span>` full       | applyHighlightClick (last="yellow")                     | `<span bg:yellow>text</span>` (replace color)                      | matches                                   |
| HL-8  | `text` full                             | applyHighlightClick (last="yellow")                     | `<span bg:yellow>text</span>`                                      | matches                                   |
| HL-9  | `<span bg:yellow>hello world</span>`    | partial `"hello"` → applyHighlightClick("yellow")       | `hello<span bg:yellow> world</span>` (selection-scoped removal)    | **BUG:** entire span removed              |
| HL-10 | `<span bg:green>hello world</span>`     | partial `"hello"` → applyHighlightColorSelect("yellow") | `<span bg:yellow>hello</span><span bg:green> world</span>` (split) | **BUG:** entire span recolored            |
| HL-11 | `text`                                  | cursor only → applyHighlightClick                       | `text` unchanged (pen state armed)                                 | **BUG:** wraps cursor in MD/`==`          |

---

## 9. clearFormatting on Selection — Must Be Cleanly Total

Word's "Clear All Formatting" removes every formatting attribute from the selection
without leaving stray delimiters or partial tags.

| #    | Input                                                     | Operation       | Expected (Word)                                                                                                                                                                                                                                                                          | Current (code: `clearFormattingString`)         |
| ---- | --------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| CF-1 | `**bold *italic* bold**`                                  | clearFormatting | `bold italic bold`                                                                                                                                                                                                                                                                       | **BUG:** `*bold italic bold*` (regex artifacts) |
| CF-2 | `**hello**`                                               | clearFormatting | `hello`                                                                                                                                                                                                                                                                                  | matches                                         |
| CF-3 | `__word__word__`                                          | clearFormatting | `wordwordword` (or `word word word` if MD treats `__` as bold)                                                                                                                                                                                                                           | **BUG:** `word__word`                           |
| CF-4 | `<u>text <b>inner</b> more</u>`                           | clearFormatting | `text inner more`                                                                                                                                                                                                                                                                        | **BUG:** unchanged (regex stops at `<`)         |
| CF-5 | `<sub>a<b>b</b>c</sub>`                                   | clearFormatting | `abc`                                                                                                                                                                                                                                                                                    | **BUG:** unchanged                              |
| CF-6 | `<span color:red><span font-size:12px>text</span></span>` | clearFormatting | `text`                                                                                                                                                                                                                                                                                   | matches                                         |
| CF-7 | `==text with ==equals inside==`                           | clearFormatting | `text with ==equals inside` (Word doesn't treat raw `==` as fmt; `=` chars preserved if not real highlight) — for our engine, ideal: detect MD highlight only when balanced; result: `text with ==equals inside==` if not recognized, or `text with =equals inside=` if naively stripped | **BUG:** `text with ==equals inside`            |
| CF-8 | `` `hello` ``                                             | clearFormatting | `hello`                                                                                                                                                                                                                                                                                  | matches                                         |
| CF-9 | `_hello_world_`                                           | clearFormatting | `helloworld_` or render-equivalent without italic                                                                                                                                                                                                                                        | **BUG:** `hello_world` (one `_` left)           |

---

## 10. removeAllTags vs clearFormatting Contrast

In Word there is exactly one "Clear All Formatting" command. Both engine APIs should
converge on identical, complete removal. Current divergences are bugs.

| Dimension                          | `removeAllTags` (engine API)                    | `clearFormattingString` (regex string API)             |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| Works on                           | `StylingContext` (sourceText + offsets)         | Raw string                                             |
| Tag detection                      | Geometric                                       | Character-class regexes                                |
| Content with same-delimiter chars  | Always removes correctly                        | **BUG:** fails or partial match — artifacts remain     |
| Nested HTML (`<u><b>text</b></u>`) | Removes all                                     | **BUG:** outer tag NOT removed when inner HTML present |
| `[[Note]]` in selection            | Removes enclosing tags, leaves `[[Note]]` plain | n/a                                                    |
| Inline code `` `code` ``           | No-op if fully inert                            | Strips `` ` `` delimiters                              |
| Span tags (multiple nested)        | Removes all                                     | Loop-strips, fails on nested non-span                  |
| Heading prefix (`##`)              | `preserveLinePrefix` option                     | `preserveHeadings` option                              |
| MD `==` highlight                  | **BUG:** not recognized as tag                  | Strips via regex                                       |
| MD bold `**` with `*` inside       | Removes correctly                               | **BUG:** fails — `[^*]+` stops at inner `*`            |

---

## 11. Protected Ranges Inside Selections

| #    | Input                           | Selection / Operation               | Expected (Word-equivalent for Obsidian)               | Current (code)                |
| ---- | ------------------------------- | ----------------------------------- | ----------------------------------------------------- | ----------------------------- |
| PR-1 | `hello [[Note]] world`          | full → toggleUnderline (add)        | `<u>hello </u>[[Note]]<u> world</u>` (split wrap)     | matches                       |
| PR-2 | `<u>hello [[Note]] world</u>`   | full → toggleUnderline (remove)     | `hello [[Note]] world`                                | matches                       |
| PR-3 | `<u>hello [[Note]] world</u>`   | full → removeAllTags                | `hello [[Note]] world`                                | matches                       |
| PR-4 | `` `code` ``                    | full → toggleUnderline              | no-op                                                 | matches                       |
| PR-5 | `hello ` `` `code` `` ` world`  | full → toggleUnderline              | `<u>hello </u>` `` `code` `` `<u> world</u>`          | matches                       |
| PR-6 | `[[A]][[B]]` (adjacent, no gap) | full → toggleUnderline              | no-op                                                 | matches                       |
| PR-7 | `<u>hello [[Note]] world</u>`   | partial `"hello"` → toggleUnderline | `hello<u> [[Note]] world</u>` (punch-out, leave wiki) | **BUG:** entire `<u>` removed |

---

## 12. Multi-Line / Per-Line Processing

| #    | Input                        | Selection                   | Operation       | Expected (Word)                                                                   | Current (code)                                            |
| ---- | ---------------------------- | --------------------------- | --------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| ML-1 | `hello\nworld`               | entire                      | toggleUnderline | `<u>hello</u>\n<u>world</u>`                                                      | matches                                                   |
| ML-2 | `<u>hello</u>\n<u>world</u>` | entire                      | toggleUnderline | `hello\nworld`                                                                    | matches                                                   |
| ML-3 | `<u>hello</u>\nworld`        | entire                      | toggleUnderline | `<u>hello</u>\n<u>world</u>` (Word: mixed → make uniform)                         | **BUG:** `hello\n<u>world</u>` (current toggles per line) |
| ML-4 | `<u>hello</u>\nworld`        | first line only             | toggleUnderline | `hello\nworld`                                                                    | matches                                                   |
| ML-5 | `hello\n<u>world</u>`        | second line partial `"wor"` | toggleUnderline | `hello\n<u>wor</u>ld` rendered: `wor` plain, `ld` still U → `hello\nwor<u>ld</u>` | **BUG:** entire `<u>` removed                             |

---

## Summary by Category

| Category                                  | Cases         | Word Principle                                                           |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| Cursor position relative to delimiters    | CB-1 to CB-10 | Cursor-only must never modify visible source                             |
| Partial vs full selection — punch-out     | PF-1 to PF-9  | Partial selection inside formatted region punches out only the selection |
| Span attribute application                | SA-1 to SA-9  | Always selection-scoped; never mutate text outside the selection         |
| removeTag (color/highlight clear)         | RV-1 to RV-7  | Selection-scoped removal; partial inside span splits the span            |
| Adjacent non-overlapping same-type tags   | AN-1 to AN-5  | Crossing selection treats adjacent same-type as one continuous run       |
| Nested tag scenarios                      | NT-1 to NT-10 | Partial inside outer tag punches out the tag around the selection        |
| Sub/sup mutual exclusion                  | SS-1 to SS-7  | Mutual exclusion is selection-scoped, not whole-tag                      |
| Highlight operation branches              | HL-1 to HL-11 | Single pen model: same color toggles off, different color replaces       |
| clearFormatting on selection              | CF-1 to CF-9  | Must remove ALL formatting cleanly; no delimiter regex artifacts         |
| removeAllTags vs clearFormatting contrast | (table)       | Both APIs should converge on identical complete removal                  |
| Protected ranges                          | PR-1 to PR-7  | Add splits around protected ranges; remove is also selection-scoped      |
| Multi-line per-line processing            | ML-1 to ML-5  | Word's mixed-state branch applies (make uniform) on multi-line too       |

---

## Implementation Bug Tracking Index

The following rows mark cases where current code diverges from Word. These should be
opened as engine bugs and fixed in priority order:

1. **Punch-out missing** (highest priority, most user-visible): PF-1, PF-2, PF-4, PF-5, PF-6, PF-7, PF-8, PF-9, NT-1, NT-2, NT-4, NT-10, SS-1, SS-2, SS-4, SS-7, RV-1, RV-6, HL-9, PR-7, ML-5
2. **Span attribute scope leakage**: SA-1, SA-3, SA-4, SA-8, SA-9, HL-10
3. **Cursor-only injection**: CB-1, CB-2, CB-3, CB-4, CB-5, CB-7, CB-8, HL-11
4. **Adjacent same-type normalization**: AN-1, AN-2, AN-3, AN-4, AN-5, NT-8
5. **Highlight branch incoherence**: HL-3, HL-6
6. **clearFormatting regex artifacts**: CF-1, CF-3, CF-4, CF-5, CF-7, CF-9
7. **Multi-line mixed-state uniformity**: ML-3

# Styling Engine â€” Edge Cases Report

> **Methodology:** Every expected result in this report was derived by tracing the actual TypeScript source â€”
> `toggleHtmlTag`, `addHtmlTag`, `removeHtmlTag`, `removeAllTags`, `clearFormattingString`, and the
> geometry predicates in `TagGeometry.ts`. No assumptions were carried over from design notes or prior
> speculative analysis.
>
> **Geometry reminder:**
>
> - _Enclosing match_ (`findEnclosingMatchingTag`): `openingTagEnd <= selectionStart AND closingTagStart >= selectionEnd` â†’ returns **innermost** match
> - _Delimiter-inclusive match_ (`findDelimiterInclusiveMatch`): `openingTagStart >= selectionStart AND closingTagEnd <= selectionEnd` â†’ returns **outermost** match
> - No punch-out behavior exists. Any enclosing match triggers full `unwrapTag`, regardless of whether the selection is partial.
>
> **Notation:** `|` = zero-width cursor position; `[A, B]` = selection from offset A to B.

---

## 1. Cursor Position Relative to Tag Delimiters

These cases apply to **all toggle operations** (`toggleHtmlTag`). The geometry predicate for
enclosing-match removal is `openingTagEnd <= selectionStart AND closingTagStart >= selectionEnd`,
so the **content region** (between opening and closing delimiters) is the enclosing zone.

For `<u>hello</u>` (length 12): `openingTagStart=0, openingTagEnd=3, closingTagStart=8, closingTagEnd=12`

| #     | Input text     | Cursor / Selection                            | Operation       | Expected result                                                    | Trace                                                                                                                                                                    |
| ----- | -------------- | --------------------------------------------- | --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CB-1  | `<u>hello</u>` | cursor at `openingTagEnd` = 3                 | toggleUnderline | `hello`                                                            | `3 <= 3 AND 8 >= 3` â†’ enclosing match â†’ full tag removed                                                                                                             |
| CB-2  | `<u>hello</u>` | cursor at `closingTagStart` = 8               | toggleUnderline | `hello`                                                            | `3 <= 8 AND 8 >= 8` â†’ enclosing match â†’ full tag removed                                                                                                             |
| CB-3  | `<u>hello</u>` | cursor INSIDE opening tag at offset 1         | toggleUnderline | `<u></u><u>hello</u>`                                              | `3 <= 1` fails â†’ no enclosing match; `0 >= 1` fails â†’ no delimiter match â†’ adds empty `<u>` at cursor                                                              |
| CB-4  | `<u>hello</u>` | cursor before tag at offset 0                 | toggleUnderline | `<u></u><u>hello</u>`                                              | `3 <= 0` fails â†’ no match â†’ adds empty tag at offset 0                                                                                                               |
| CB-5  | `<u>hello</u>` | cursor after closing tag at offset 12         | toggleUnderline | `<u>hello</u><u></u>`                                              | `3 <= 12 AND 8 >= 12` fails (8 â‰¥ 12 false) â†’ no enclosing match â†’ adds empty tag                                                                                   |
| CB-6  | `<u>hello</u>` | selection `[0, 12]` full including delimiters | toggleUnderline | `hello`                                                            | `findDelimiterInclusiveMatch`: `0 >= 0 AND 12 <= 12` â†’ match â†’ unwrap                                                                                                |
| CB-7  | `<u>hello</u>` | selection `[0, 3]` opening tag only           | toggleUnderline | `<u><u>hello</u></u>`                                              | Delimiter match needs BOTH delimiters in selection: `closingTagEnd=12 <= 3` fails â†’ no delimiter match; enclosing match also fails â†’ wraps selection â†’ double-wrap |
| CB-8  | `<u>hello</u>` | selection `[8, 12]` closing tag only          | toggleUnderline | `<u>hello<u></u></u>`                                              | `openingTagStart=0 >= 8` fails â†’ no delimiter match; enclosing: `3 <= 8 AND 8 >= 12` fails â†’ wraps selection (empty string after closing)                            |
| CB-9  | `<u>hello</u>` | selection `[0, 8]` opening + content only     | toggleUnderline | `<u><u>hello</u></u>`                                              | Closing at 8â€“12 not in selection: delimiter match fails; enclosing: `3 <= 0` fails â†’ wraps                                                                           |
| CB-10 | `<u>hello</u>` | selection `[3, 12]` content + closing only    | toggleUnderline | `<u>hello</u>` unwrapped wait â€” `3<=3 AND 8>=12` fails â†’ wraps | `3 <= 3` but `8 >= 12` fails â†’ no enclosing match; `0 >= 3` fails â†’ no delimiter match â†’ wraps "hello</u>" creating `<u>hello</u></u>` artifact                    |

---

## 2. Partial vs Full Selections Inside a Tag (No Punch-Out)

> **Key confirmed behavior:** There is **no punch-out**. Any selection where the content region of the
> tag encloses the selection triggers `unwrapTag`, which removes the **entire** tag â€” not just around
> the selected portion. This applies to partial, full-content, and zero-width-cursor selections equally.

| #    | Input text           | Selection                                               | Operation       | Expected result | Trace                                                                                                   |
| ---- | -------------------- | ------------------------------------------------------- | --------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| PF-1 | `<u>hello world</u>` | "hello" = `[3, 8]` (partial start)                      | toggleUnderline | `hello world`   | `3 <= 3 AND 14 >= 8` â†’ enclosing match â†’ **entire** `<u>` removed                                   |
| PF-2 | `<u>hello world</u>` | "world" = `[9, 14]` (partial end)                       | toggleUnderline | `hello world`   | `3 <= 9 AND 14 >= 14` â†’ enclosing match â†’ entire tag removed                                        |
| PF-3 | `<u>hello world</u>` | "hello world" = `[3, 14]` (full content, no delimiters) | toggleUnderline | `hello world`   | Full content enclosed â†’ same: entire tag removed                                                      |
| PF-4 | `<u>hello world</u>` | cursor at offset 7 (zero-width, inside)                 | toggleUnderline | `hello world`   | `3 <= 7 AND 14 >= 7` â†’ enclosed â†’ entire tag removed                                                |
| PF-5 | `**hello world**`    | "hello" = `[2, 7]` (partial MD bold)                    | toggleBold      | `hello world`   | MD bold: openingTagEnd=2, closingTagStart=13; `2 <= 2 AND 13 >= 7` â†’ enclosed â†’ entire `**` removed |
| PF-6 | `**hello world**`    | cursor at `openingTagEnd` = 2                           | toggleBold      | `hello world`   | `2 <= 2 AND 13 >= 2` â†’ boundary inclusive â†’ enclosed â†’ full `**` removed                          |
| PF-7 | `==hello==`          | "hel" = `[2, 5]` (partial highlight)                    | toggleHighlight | `hello`         | `2 <= 2 AND 7 >= 5` â†’ enclosed â†’ entire `==` removed                                                |
| PF-8 | `<sub>hello</sub>`   | "hel" = `[5, 8]` (partial)                              | toggleSubscript | `hello`         | `5 <= 5 AND 12 >= 8` â†’ enclosed â†’ entire `<sub>` removed                                            |

---

## 3. Span Attribute Replacement (addTag with CSS Properties)

> When `addTag` is called for a span CSS property (color, background, font-family, font-size) and an
> **enclosing** span with the **same CSS property name** already exists, the attribute value is
> **replaced in-place** via `replaceOpeningTagAttribute` â€” the ENTIRE existing span's attribute changes,
> regardless of whether the selection is partial or full. The CSS value is NOT used in the geometry
> match â€” only the property NAME is checked.

| #    | Input text                                                                 | Selection                   | Operation                  | Expected result                                                                                                                            | Notes                                                                                                          |
| ---- | -------------------------------------------------------------------------- | --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| SA-1 | `<span style="color:red">hello world</span>`                               | "hello" partial             | applyFontColor("blue")     | `<span style="color:blue">hello world</span>`                                                                                              | Partial selection enclosed by color span â†’ **entire span** color replaced                                    |
| SA-2 | `<span style="color:red">hello world</span>`                               | "hello world" full content  | applyFontColor("blue")     | `<span style="color:blue">hello world</span>`                                                                                              | Full content â†’ same: entire span attribute replaced                                                          |
| SA-3 | `<span style="color:red">hello world</span>`                               | cursor inside               | applyFontColor("blue")     | `<span style="color:blue">hello world</span>`                                                                                              | Zero-width cursor enclosed â†’ entire span attribute replaced                                                  |
| SA-4 | `<span style="color:red">hello</span><span style="color:red">world</span>` | "lo wo" crossing both spans | applyFontColor("blue")     | `<span style="color:red">hell<span style="color:blue">o</span></span><span style="color:red"><span style="color:blue">wo</span>rld</span>` | Neither span encloses crossing selection â†’ no enclosing match â†’ wraps selection in new blue span           |
| SA-5 | `hello world`                                                              | "hello"                     | applyFontColor("blue")     | `<span style="color:blue">hello</span> world`                                                                                              | No existing color span â†’ standard `buildWrapReplacements`                                                    |
| SA-6 | `<span style="color:red"><span style="color:green">hi</span></span>`       | "hi" (inside inner)         | applyFontColor("blue")     | `<span style="color:red"><span style="color:blue">hi</span></span>`                                                                        | `findEnclosingMatchingTag` returns **innermost** (green span) â†’ replaces inner only; outer red unchanged     |
| SA-7 | `<span style="color:red">hi</span>`                                        | "hi"                        | applyFontColor("red")      | `<span style="color:red">hi</span>`                                                                                                        | Same color â†’ `replaceOpeningTagAttribute` sets same value; no visible change, `isNoOp: false`                |
| SA-8 | `<span style="font-family:Arial">hello</span>`                             | "hel" (partial)             | applyFontFamily("Verdana") | `<span style="font-family:Verdana">hello</span>`                                                                                           | Partial selection enclosed â†’ **entire span** font-family replaced                                            |
| SA-9 | `<span style="font-family:Arial">hello</span>`                             | cursor inside               | applyFontColor("red")      | `<span style="font-family:Arial"><span style="color:red"></span>hello</span>`                                                              | Different CSS property â†’ no match for "color" in font-family span â†’ wraps cursor (empty) in new color span |

---

## 4. removeTag: Value Is Ignored in Geometry Matching

> `filterMatchingTagRanges` checks `extracted.propertyName === targetPropertyName` â€” property **name** only.
> The value passed to `removeTag(buildSpanTagDefinition("color", X))` is irrelevant; any span with a `color`
> property is matched and removed.

| #    | Input text                                                             | Operation                       | Expected result                        | Notes                                                                                                             |
| ---- | ---------------------------------------------------------------------- | ------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| RV-1 | `<span style="color:red">hello</span>`                                 | `applyFontColorNoColor("blue")` | `hello`                                | `removeTag(color:blue)` matches the `color:red` span (name match only) â†’ span removed                           |
| RV-2 | `<span style="color:red"><span style="color:blue">hello</span></span>` | `applyFontColorNoColor("red")`  | `<span style="color:red">hello</span>` | `findEnclosingMatchingTag` returns **innermost** color span (blue) â†’ removes inner blue span; outer red remains |
| RV-3 | `<span style="color:red"><span style="color:blue">hello</span></span>` | `applyFontColorNoColor("blue")` | `<span style="color:red">hello</span>` | Same: innermost color span (blue) â†’ removes blue span                                                           |
| RV-4 | `hello`                                                                | `applyFontColorNoColor("red")`  | `hello`                                | No color span present â†’ `findEnclosingMatchingTag` returns null â†’ no-op                                       |
| RV-5 | `hello`                                                                | `applyFontColorNoColor(null)`   | `hello`                                | `fontColor` is null â†’ `removeTag` never called at the application layer â†’ no-op                               |

---

## 5. Adjacent Non-Overlapping Same-Type Tags

> When a selection **crosses the boundary** between two adjacent non-overlapping tags, neither
> geometry predicate fires, so the operation falls through to `buildWrapReplacements`, creating a
> new outer tag that partially overlaps the existing inner tags.

| #    | Input text                  | Selection                     | Operation       | Expected result                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | --------------------------- | ----------------------------- | --------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AN-1 | `<u>hello</u> <u>world</u>` | "lo wo" crossing both         | toggleUnderline | `<u>hel<u>lo</u> <u>wo</u>rld</u>` | Tag#1 closingTagStart=8 < selectionEnd; tag#2 openingTagEnd=16 > selectionStart â†’ no enclosing match â†’ wraps selection                                                                                                                                                                                                                                                                                                                                                                                                                    |
| AN-2 | `<u>hello</u> <u>world</u>` | "lo wo" crossing both         | removeUnderline | no-op                              | `removeHtmlTag`: same geometry fails â†’ `isNoOp: true`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| AN-3 | `<b>one</b><b>two</b>`      | "ne" + "tw" crossing boundary | toggleBold      | `<b>o<b>ne</b><b>tw</b>o</b>`      | No enclosing match â†’ wraps crossing selection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| AN-4 | `<u>hello</u> <u>world</u>` | full `[0, 25]`                | toggleUnderline | `hello world`                      | Both tag spans fit within `[0, 25]` â†’ `findDelimiterInclusiveMatch` returns outermost (larger span) â†’ unwraps it; then inner also unwrapped? No â€” only the outermost match is returned, and `unwrapTag` only removes one tag's delimiters. The second `<u>` remains. Result: `hello </u> <u>world` wait no â€” `findDelimiterInclusiveMatch` returns ONE match (outermost by span size). After unwrapping that one, the inner tag delimiters are still in the text. **Actual result:** only one of the two tags removed per toggle call |

---

## 6. Nested Tag Scenarios

> `findEnclosingMatchingTag` returns the **innermost** matching tag. There is no nested guard.
> The innermost tag that encloses the selection is always wholly unwrapped.

| #    | Input text                   | Selection                         | Operation       | Expected result       | Trace                                                                                                                    |
| ---- | ---------------------------- | --------------------------------- | --------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| NT-1 | `<b><u>hello world</u></b>`  | "hello" (partial, inside both)    | toggleBold      | `<u>hello world</u>`  | `findEnclosingMatchingTag` for bold: `<b>` encloses "hello" and is the only bold tag â†’ unwraps `<b>`                   |
| NT-2 | `<b><u>hello world</u></b>`  | "hello" (partial)                 | toggleUnderline | `<b>hello world</b>`  | `findEnclosingMatchingTag` for underline: `<u>` is the innermost match â†’ unwraps `<u>`                                 |
| NT-3 | `<b><u>hello world</u></b>`  | "hello world" (full content)      | toggleBold      | `<u>hello world</u>`  | Same as NT-1: full content still enclosed by `<b>` â†’ entire `<b>` removed                                              |
| NT-4 | `<u><u>hello</u></u>`        | "hel" (partial, in inner content) | toggleUnderline | `<u>hello</u>`        | Innermost `<u>` encloses "hel" â†’ unwraps inner only; outer `<u>` still present                                         |
| NT-5 | `<b><i><u>hello</u></i></b>` | "hello"                           | toggleBold      | `<i><u>hello</u></i>` | Only `<b>` matches bold â†’ unwraps `<b>`                                                                                |
| NT-6 | `<b><i><u>hello</u></i></b>` | "hello"                           | toggleItalic    | `<b><u>hello</u></b>` | `<i>` is the innermost italic â†’ unwraps `<i>`                                                                          |
| NT-7 | `<b><i><u>hello</u></i></b>` | "hello"                           | removeAllTags   | `hello`               | `findAllEnclosingTags` collects all three; sorted largest-first; all unwrapped                                           |
| NT-8 | `<b><b>hello</b></b>`        | "hello"                           | toggleBold      | `<b>hello</b>`        | Stacked same-type: `findEnclosingMatchingTag` returns innermost (smaller) `<b>` â†’ inner unwrapped; outer `<b>` remains |
| NT-9 | `<b><b>hello</b></b>`        | "hello"                           | removeAllTags   | `hello`               | Both `<b>` tags found as enclosing â†’ both unwrapped                                                                    |

---

## 7. Subscript / Superscript Mutual Exclusion

> `resolveMutuallyExclusiveScriptTag` maps subâ†”sup. If an **enclosing** opposite-type tag exists,
> the **entire** tag is swapped via `buildTagMarkupSwapReplacements`, regardless of selection size.

| #    | Input text                     | Selection                     | Operation         | Expected result                           | Notes                                                                                                                |
| ---- | ------------------------------ | ----------------------------- | ----------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| SS-1 | `<sub>hello world</sub>`       | "hello" (partial)             | toggleSuperscript | `<sup>hello world</sup>`                  | `findEnclosingMatchingTag` for `<sup>` fails; checks mutually exclusive `<sub>` â†’ matches â†’ swaps **entire** tag |
| SS-2 | `<sub>hello world</sub>`       | cursor inside                 | toggleSuperscript | `<sup>hello world</sup>`                  | Zero-width cursor enclosed by `<sub>` â†’ mutual exclusive swap                                                      |
| SS-3 | `<sub>hello world</sub>`       | "hello world" (full content)  | toggleSuperscript | `<sup>hello world</sup>`                  | Full content â†’ swap                                                                                                |
| SS-4 | `<sub>hello world</sub>`       | "hello" (partial)             | toggleSubscript   | `hello world`                             | `findEnclosingMatchingTag` for `<sub>` matches directly â†’ unwraps entire `<sub>`                                   |
| SS-5 | `hello world`                  | "hello"                       | toggleSuperscript | `<sup>hello</sup> world`                  | No sub/sup present â†’ wraps selection only                                                                          |
| SS-6 | `<sup>one</sup><sub>two</sub>` | "ne" + "tw" crossing boundary | toggleSubscript   | `<sup>o<sub>ne</sub><sub>tw</sub>o</sup>` | Neither tag encloses crossing selection; no mutual exclusive match â†’ adds new `<sub>` around selection             |

---

## 8. Highlight Operation Branches

> `applyHighlightClick` has three distinct branches. The branch taken depends on whether
> `lastHighlightColor === DEFAULT_HIGHLIGHT_COLOR` and whether `editorState.highlightColor === lastHighlightColor`.

| #     | Source state                                                     | `lastHighlightColor`      | `editorState.highlightColor` | Operation                            | Net result                                    | Branch logic                                                                                                                                           |
| ----- | ---------------------------------------------------------------- | ------------------------- | ---------------------------- | ------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HL-1  | `==text==`                                                       | `DEFAULT_HIGHLIGHT_COLOR` | `null`                       | `applyHighlightClick`                | `text`                                        | Branch 1: `removeBackgroundSpan(null)` â†’ no-op; `toggleTag(==)` â†’ enclosed â†’ removes `==`                                                        |
| HL-2  | plain `text`                                                     | `DEFAULT_HIGHLIGHT_COLOR` | `null`                       | `applyHighlightClick`                | `==text==`                                    | Branch 1: `removeBackgroundSpan(null)` â†’ no-op; `toggleTag(==)` â†’ no `==` found â†’ adds `==`                                                      |
| HL-3  | `<span style="background:#ffff00">text</span>`                   | `DEFAULT_HIGHLIGHT_COLOR` | `"#ffff00"`                  | `applyHighlightClick`                | `==text==`                                    | Branch 1: removes background span â†’ `text`; then `toggleTag(==)` â†’ no `==` â†’ adds `==`                                                           |
| HL-4  | `==<span style="background:#ffff00">text</span>==`               | `DEFAULT_HIGHLIGHT_COLOR` | `"#ffff00"`                  | `applyHighlightClick`                | `text`                                        | Branch 1: removes background span â†’ `==text==`; then toggles `==` â†’ enclosed â†’ removes                                                           |
| HL-5  | `<span style="background:yellow">text</span>`                    | `"yellow"`                | `"yellow"`                   | `applyHighlightClick`                | `text`                                        | Branch 2 (`editorState === last`): only removes background span; `==` never touched                                                                    |
| HL-6  | `==text==`                                                       | `"yellow"`                | `"yellow"`                   | `applyHighlightClick`                | `==text==`                                    | Branch 2: removes background span (none present â†’ no-op); does NOT touch `==` â†’ unchanged                                                          |
| HL-7  | `<span style="background:green">text</span>`                     | `"yellow"`                | `"green"`                    | `applyHighlightClick`                | `<span style="background:yellow">text</span>` | Branch 3: remove `==` (no-op); remove background:green â†’ `text`; add background:yellow                                                               |
| HL-8  | plain `text`                                                     | `"yellow"`                | `null`                       | `applyHighlightClick`                | `<span style="background:yellow">text</span>` | Branch 3: remove MD (no-op); `highlightColor` null â†’ skip inner remove; add yellow span                                                              |
| HL-9  | plain `text`                                                     | â€”                       | any                          | `applyHighlightNoColor(null)`        | `text`                                        | `removeTag(MD)` â†’ no-op; `highlightColor` null â†’ skips background removal                                                                          |
| HL-10 | `==text==`                                                       | â€”                       | â€”                          | `applyHighlightNoColor(null)`        | `text`                                        | Removes `==`; skips background span (highlightColor null)                                                                                              |
| HL-11 | `<span style="background:yellow">text</span>`                    | â€”                       | â€”                          | `applyHighlightNoColor("yellow")`    | `text`                                        | Removes `==` (no-op); removes background:yellow span                                                                                                   |
| HL-12 | `==text==`                                                       | â€”                       | â€”                          | `applyHighlightColorSelect("green")` | `<span style="background:green">text</span>`  | Removes `==` â†’ `text`; adds background:green span; representation switches from MD to span                                                           |
| HL-13 | `==text==` and `<span background:green>text</span>` both present | â€”                       | â€”                          | `applyHighlightColorSelect("blue")`  | `<span style="background:blue">text</span>`   | Removes `==` (â†’ `<span background:green>text</span>`); `addTag(background:blue)` â†’ enclosing green span matched â†’ replaces greenâ†’blue in-place |

---

## 9. clearFormatting Regex Limits

> `clearFormattingString` uses character-class negation regexes. Content containing the **same
> delimiter character** inside the markup causes partial matches or failures, leaving artifacts.
> This is distinct from `removeAllTags` which uses geometric tag detection.

| #    | Input                                                                     | `clearFormattingString` output  | Notes                                                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CF-1 | `**bold *italic* bold**`                                                  | `*bold italic bold*`            | Outer `**` NOT stripped (`[^*]+` stops at inner `*`). Single-star regex `/\*([^*]+)\*/g` then matches `*bold *` and `* bold*` â†’ removes them. Artifacts: single `*` at each end remains. |
| CF-2 | `**hello**`                                                               | `hello`                         | Simple case: `[^*]+` = "hello" â†’ `**` stripped cleanly                                                                                                                                   |
| CF-3 | `__word__word__`                                                          | `word__word`                    | First `__word__` stripped; remaining `__word` has no closing `__`                                                                                                                          |
| CF-4 | `<u>text <b>inner</b> more</u>`                                           | `<u>text <b>inner</b> more</u>` | `<u>([^<]+)</u>` uses `[^<]+` â†’ stops at `<b>` â†’ outer `<u>` NOT stripped; `<b>inner</b>` also not stripped by the `<u>` pattern                                                       |
| CF-5 | `<sub>a<b>b</b>c</sub>`                                                   | `<sub>a<b>b</b>c</sub>`         | Same: `[^<]+` fails on nested HTML â†’ entire outer `<sub>` left intact                                                                                                                    |
| CF-6 | `<span style="color:red"><span style="font-size:12px">text</span></span>` | `text`                          | Span loop strips inner span first; then outer span; loop terminates â†’ clean                                                                                                              |
| CF-7 | `==text with ==equals inside==`                                           | `text with ==equals inside`     | `[^=]+` stops before first `=` in content; matches `==text with ==` (first `==` closing); replaces with `text with ` â†’ remaining `==equals inside==` then matched â†’ `equals inside`    |
| CF-8 | `` `hello` ``                                                             | `hello`                         | ``/`([^`]+)`/g`` strips inline code delimiters                                                                                                                                             |
| CF-9 | `_hello_world_`                                                           | `hello_world`                   | First `_hello_` stripped; remaining `world_` has no closing `_`                                                                                                                            |

---

## 10. removeAllTags vs clearFormatting Contrast

| Dimension                          | `removeAllTags` (engine API)                                          | `clearFormattingString` (regex string API)                                     |
| ---------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Works on                           | `StylingContext` (sourceText + offsets)                               | Raw string                                                                     |
| Tag detection                      | Geometric: `findAllEnclosingTags` + `findAllTagsWithinSelection`      | Character-class regexes (`[^*]+`, `[^<]+`, etc.)                               |
| Content with same-delimiter chars  | Always removes correctly                                              | Fails or partially matches (artifacts remain)                                  |
| Nested HTML (`<u><b>text</b></u>`) | Removes all, largest-first                                            | Outer tag NOT removed when inner HTML present (`[^<]+` fails)                  |
| `[[Note]]` in selection            | Removes enclosing tags, leaves `[[Note]]` as plain text               | Not applicable                                                                 |
| Inline code `` `code` ``           | `isFullyInert` â†’ no-op if all content inert; wraps around otherwise | Strips `` ` `` via ``/`([^`]+)`/g``                                            |
| Span tags                          | Removes all span tags geometrically                                   | Strips via loop: `<span[^>]*>([^<]*)</span>` (fails if nested content has `<`) |
| Heading prefix (`##`)              | Controlled by `preserveLinePrefix` option                             | `preserveHeadings` option for `##` only                                        |
| MD `==` highlight                  | No effect (not recognized as HTML tag)                                | Stripped via `/==([^=]+)==/g`                                                  |
| MD bold `**` with `*` inside       | Removes correctly (not regex-based)                                   | Fails: `[^*]+` stops at inner `*`                                              |

---

## 11. Protected Ranges Inside Selections

> `buildWrapReplacements` splits wrap around `structureContext.protectedRanges` (wiki-links,
> inline code, etc.) when **adding** a tag. `removeAllTags` and `unwrapTag` do NOT consult
> protected ranges â€” they remove the enclosing tag entirely.

| #    | Input text                      | Selection | Operation                | Expected result                      | Notes                                                                                                      |
| ---- | ------------------------------- | --------- | ------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | --- | ---- | ------------------------------ | ---- | --------------- | -------------------------------------------- | --------------------------------- |
| PR-1 | `hello [[Note]] world`          | full      | toggleUnderline (add)    | `<u>hello </u>[[Note]]<u> world</u>` | Protected range splits wrap into separate segments                                                         |
| PR-2 | `<u>hello [[Note]] world</u>`   | full      | toggleUnderline (remove) | `hello [[Note]] world`               | `findEnclosingMatchingTag` matches â†’ `unwrapTag` â†’ removes entire `<u>`; `[[Note]]` left as plain text |
| PR-3 | `<u>hello [[Note]] world</u>`   | full      | removeAllTags            | `hello [[Note]] world`               | Geometric removal: removes `<u>`; `[[Note]]` left as plain text (no protected-range check in remove path)  |
| PR-4 | `` `code` ``                    | full      | toggleUnderline          | no-op                                | `detectStructureContext` â†’ `isFullyInert: true` â†’ early return                                         |     | PR-5 | `hello ` `` `code` `` ` world` | full | toggleUnderline | `<u>hello </u>` `` `code` `` `<u> world</u>` | Inert zone in middle → split wrap |
| PR-6 | `[[A]][[B]]` (adjacent, no gap) | full      | toggleUnderline          | no-op                                | Protected ranges fill entire selection → nothing to wrap                                                   |

---

## 12. Multi-Line / Per-Line Processing

> `shouldProcessPerLine` triggers when selection spans multiple lines of block-level content.
> Each line is processed independently via `toggleTagPerLine` / `addTagPerLine`.

| #    | Input text                   | Selection       | Operation       | Expected result              | Notes                                                         |
| ---- | ---------------------------- | --------------- | --------------- | ---------------------------- | ------------------------------------------------------------- |
| ML-1 | `hello\nworld`               | entire          | toggleUnderline | `<u>hello</u>\n<u>world</u>` | Per-line: each line wrapped independently                     |
| ML-2 | `<u>hello</u>\n<u>world</u>` | entire          | toggleUnderline | `hello\nworld`               | Per-line: each line has enclosing `<u>` → each removed        |
| ML-3 | `<u>hello</u>\nworld`        | entire          | toggleUnderline | `hello\n<u>world</u>`        | Mixed: first line has tag (remove), second line doesn't (add) |
| ML-4 | `<u>hello</u>\nworld`        | first line only | toggleUnderline | `hello\nworld`               | Single-line path: `<u>` encloses "hello" → removed            |

---

## Summary by Category

| Category                                 | Cases              | Key Insight                                                                                           |
| ---------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| Cursor position relative to delimiters   | CB-1 to CB-10      | Boundary is inclusive on content side; cursor inside tag markup is NOT enclosed                       |
| Partial vs full selection (no punch-out) | PF-1 to PF-8       | Any enclosed selection (partial, full, or zero-width) removes the **entire** tag                      |
| Span attribute replacement               | SA-1 to SA-9       | `addTag` replaces value in-place for same property; only innermost matching span updated              |
| removeTag value ignored                  | RV-1 to RV-5       | CSS value passed to `removeTag` is irrelevant; only property NAME is matched; innermost span returned |
| Adjacent non-overlapping tags            | AN-1 to AN-4       | Crossing selection falls through to add, creating outer wrap over existing inner tags                 |
| Nested tag scenarios                     | NT-1 to NT-9       | Innermost match always unwrapped; no nested guard; `removeAllTags` removes all enclosing tags         |
| Sub/sup mutual exclusion                 | SS-1 to SS-6       | Partial/cursor selection inside opposite-type tag still triggers full tag swap                        |
| Highlight operation branches             | HL-1 to HL-13      | Three branches in `applyHighlightClick`; `applyHighlightNoColor(null)` skips background removal       |
| clearFormatting regex limits             | CF-1 to CF-9       | `[^*]+` and `[^<]+` patterns fail on content containing delimiter chars; artifacts remain             |
| removeAllTags vs clearFormatting         | — (contrast table) | Geometric detection always correct; regex-based fails on complex nesting                              |
| Protected ranges                         | PR-1 to PR-6       | Add operations split around protected ranges; remove operations ignore them                           |
| Multi-line per-line processing           | ML-1 to ML-4       | Each line processed independently; mixed-state lines each toggle independently                        |
