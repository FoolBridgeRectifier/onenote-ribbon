# Insert Tab — MD/HTML Span Compatibility Report (Detailed)

> Tested in Obsidian Live Preview (edit mode). All findings based on CodeMirror DOM inspection with computed style verification.

---

## GROUP: Tables

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Table | Native `\| Col A \| Col B \|` | `cm-embed-block cm-table-widget markdown-rendered` → `<table class="table-editor">` | ✅ Interactive table widget | — | Obsidian renders MD tables as an editable widget |
| Table | `<span style="color:red">\| Col A \|…\| x \| y \|</span>` | `cm-html-embed` → raw pipe characters shown as plain text | ❌ Table broken | ✅ `color:red` applies to outer span | Multi-line span collapses entire table to inline HTML block |

---

## GROUP: Files

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Attach File | `[[test.pdf]]` | `cm-hmd-internal-link` | ✅ Wikilink recognized | — | Standard wikilink behavior |
| Attach File | `<span style="color:red">[[test.pdf]]</span>` | `cm-html-embed` → `[[test.pdf]]` as literal text | ❌ Link broken | ✅ `color:red` = `rgb(255,0,0)` confirmed | Span wrapper blocks wikilink detection |
| Embed Note | `![[nonexistent-embed]]` | Embed widget placeholder ("click to create"); `cm-line` text content is empty | ✅ Embed widget rendered | — | Source line replaced by widget; cm-line holds no visible text |
| Embed Note | `<span style="color:red">![[nonexistent-embed]]</span>` | `cm-html-embed` → `![[nonexistent-embed]]` as literal text | ❌ Embed broken | ✅ `color:red` applies | Span wrapper prevents `![[]]` recognition |

---

## GROUP: Images

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Image | `![[image.png]]` | Embed widget (same mechanism as Embed Note) | ✅ Image widget rendered | — | Identical to `![[note]]` — Obsidian treats all `![[]]` uniformly |
| Image | `<span style="color:red">![[image.png]]</span>` | `cm-html-embed` → literal text | ❌ Embed broken | ✅ Span style applies | Same result as Embed Note span case |
| Video | Plugin command (Media Extended) | Plugin-managed iframe insert | 🔌 Plugin-dependent | N/A | No span concern at insertion level |

---

## GROUP: Links

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Link | `[Obsidian](https://obsidian.md)` | `cm-url` + `cm-link` — full link tokens | ✅ Clickable link | — | Clean MD link rendering |
| Link | `[<span style="color:red">Obsidian</span>](https://obsidian.md)` | `cm-url` present, `cm-link` absent, `cm-html-embed` present | ❌ Link broken (URL token only) | ✅ `color:red` applies | URL is tokenized but `cm-link` class lost — not a clickable link |
| Link | `<span style="color:red">[Obsidian](https://…)</span>` | `cm-html-embed` → raw `[Obsidian](url)` text | ❌ Link broken | ✅ `color:red` applies | Full link not recognized |
| [[Wikilink]] | `[[Wikilink Target]]` | `cm-hmd-internal-link` | ✅ Clickable wikilink | — | — |
| [[Wikilink]] | `<span style="color:red">[[Wikilink Target]]</span>` | `cm-html-embed` → `[[Wikilink Target]]` as literal text | ❌ Link broken | ✅ `color:red` = `rgb(255,0,0)` confirmed | Consistent with Home Tab finding |

---

## GROUP: Time Stamp

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Date | `2026-04-13` | Plain `cm-line` — no special token | ✅ Plain text visible | — | Date is not an MD token |
| Date | `<span style="color:red">2026-04-13</span>` | `cm-html-embed` wrapping rendered `<span style="color:red">` | ✅ Text visible with style | ✅ `color:red` applies | Plain text in span renders correctly — safe to use |
| Time | `14:30` | Plain `cm-line` | ✅ Plain text visible | — | — |
| Time | `<span style="color:red">14:30</span>` | `cm-html-embed` → span rendered inside | ✅ Text visible with style | ✅ `color:red` applies | Same as Date |
| Date & Time | `2026-04-13 14:30` | Plain `cm-line` | ✅ Plain text visible | — | — |
| Date & Time | `<span style="color:red">2026-04-13 14:30</span>` | `cm-html-embed` → span rendered inside | ✅ Text visible with style | ✅ `color:red` applies | — |

> **Key finding:** Date/Time inserts are plain text — not MD tokens. Wrapping in a `<span>` creates an inline HTML block (`cm-html-embed`) but the span and its `style` attribute render correctly. Plain text insert is simpler; span is safe when styling is needed.

---

## GROUP: Blocks — Callout

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Callout | `> [!note]` / `> Plain callout body text` | `cm-embed-block cm-callout` widget → `<p>Plain callout body text</p>` | ✅ Widget renders | — | Callout outside cursor renders as reading-mode widget |
| Callout | `> [!important]` / `> **Bold** inside callout` | Widget → `<p><strong>Bold</strong> inside callout</p>` | ✅ Bold renders inside widget | — | MD tokens parse correctly inside callout widget |
| Callout | `> [!note]` / `> <span style="color:red">…</span>` | Widget → `<p><span style="color:red">Span inside callout body</span></p>` | ✅ Span text visible | ✅ `color:red` = `rgb(255,0,0)` confirmed | Callout widget uses Obsidian HTML renderer — inline spans fully supported |
| Callout | `> [!question]` / `` > `inline code` `` | Widget → `<p><code>inline code</code></p>` | ✅ Code renders | — | — |

> **Important:** Callout bodies in the rendered widget (cursor outside block) use Obsidian's full HTML renderer. Both MD tokens and inline `<span>` styles work. This contrasts with the raw CodeMirror source lines (cursor inside block) where `<span>` shows as literal text.

---

## GROUP: Blocks — Code Block

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Code Block | ` ```javascript ` fence | `HyperMD-codeblock-begin` / `HyperMD-codeblock-bg` / `HyperMD-codeblock-end` | ✅ Syntax fence renders | — | Content inside fence is never HTML-parsed |
| Code Block | Inline `` `const x = 1` `` | `cm-inline-code` | ✅ Inline code renders | — | — |

---

## GROUP: Symbols — Math

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Math `$$` | `$$\nE = mc^2\n$$` | `math math-block cm-embed-block` widget | ✅ Block math widget | — | Renders as math widget; not an HTML context |
| Math `$$` | `$x^2 + y^2 = r^2$` | `cm-math` span | ✅ Inline math renders | — | — |

---

## GROUP: Symbols — Horizontal Rule

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Horiz. Rule | `---` | `class="hr cm-line"` — `<hr>` element in `cm-content` | ✅ Horizontal rule renders | — | CodeMirror uses dedicated `hr` line class |
| Horiz. Rule | `<span style="color:red">---</span>` | `cm-html-embed` → literal `---` text | ❌ Rule broken | ✅ Span style applies | Consistent with all other MD tokens wrapped in span |

---

## GROUP: Symbols — Footnote

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| Footnote | Inline `[^1]` ref | `cm-footref` tokens on inline line | ✅ Footnote ref rendered | — | |
| Footnote | `[^1]: First definition.` | `HyperMD-footnote cm-line` + `cm-hmd-footnote` | ✅ Definition line recognized | — | — |
| Footnote | `<span style="color:red">[^1]</span>` | `cm-html-embed` → `[^1]` as literal text | ❌ Ref not recognized | ✅ `color:red` applies | Span blocks footnote detection |

---

## GROUP: Symbols — #Tag

| Button | Test Case | DOM Result | Renders? | Span Style Applied? | Notes |
|--------|-----------|-----------|----------|---------------------|-------|
| #Tag | `#test-tag` | `cm-formatting-hashtag cm-hashtag-begin cm-tag-test-tag` + `cm-hashtag-end` | ✅ Tag recognized | — | Full hashtag tokenization |
| #Tag | `<span style="color:red">#wrapped-tag</span>` | `cm-html-embed` → `#wrapped-tag` as literal text | ❌ Tag not recognized | ✅ `color:red` applies | Tag inside span breaks recognition |
| #Tag | `text <span style="color:blue">styled</span> then #tag-after-span` | Span → `cm-html-embed` with `color:blue`; `#tag-after-span` → `cm-hashtag-begin + cm-hashtag-end` | ✅ Tag outside span recognized | ✅ `color:blue` applies to span | Tag after a span on the same line is still tokenized — span only blocks what is inside it |

---

## Summary

| Button | Insert bare? | Span-wrap safe? | Span style works? | Notes |
|--------|-------------|-----------------|-------------------|-------|
| Table | ✅ Renders as widget | ❌ Raw pipe text | ✅ | Never wrap table in span |
| Attach File | ✅ `cm-hmd-internal-link` | ❌ Link broken | ✅ | Insert `[[file]]` bare |
| Embed Note | ✅ Embed widget | ❌ Embed broken | ✅ | Insert `![[note]]` bare |
| Image | ✅ Embed widget | ❌ Embed broken | ✅ | Insert `![[img]]` bare |
| Video | 🔌 Plugin | N/A | N/A | Plugin command |
| Link | ✅ `cm-url + cm-link` | ❌ Link broken | ✅ | No span anywhere in `[text](url)` |
| [[Wikilink]] | ✅ `cm-hmd-internal-link` | ❌ Link broken | ✅ | Same as Home Tab finding |
| Date | ✅ Plain text | ✅ Renders with style | ✅ | Not an MD token — span is safe |
| Time | ✅ Plain text | ✅ Renders with style | ✅ | Not an MD token — span is safe |
| Date & Time | ✅ Plain text | ✅ Renders with style | ✅ | Not an MD token — span is safe |
| Template | 🔌 Plugin | N/A | N/A | Content varies |
| Callout | ✅ Widget | ✅ Span in body renders | ✅ | Widget uses HTML renderer — full span support in body |
| Code Block | ✅ `HyperMD-codeblock` | N/A | N/A | Content never HTML-parsed |
| Math `$$` | ✅ `cm-embed-block.math` | N/A | N/A | Math context, not HTML |
| Horiz. Rule | ✅ `hr cm-line` | ❌ Rule broken | ✅ | Insert `---` bare |
| Footnote | ✅ `cm-footref` | ❌ Ref broken | ✅ | Insert `[^n]` bare |
| #Tag | ✅ `cm-hashtag` | ❌ Tag broken | ✅ | Tag outside span on same line still works |
