# Styling Engine — Behavior Reference

All behaviors discussed and implemented across this session. Cursor position is
shown as `|`. When a selection spans two positions, the format is `|selection|`.

---

## toggleTag

### Removing Existing Tags

| # | Input | Action | Result |
|---|-------|--------|--------|
| 1 | `<u>hel|lo|</u>` | Toggle underline | `hel|lo|` |
| 2 | `**bo|ld|**` | Toggle bold (MD) | `bo|ld|` |
| 3 | `<sub>|2|</sub>` | Toggle subscript | `|2|` |
| 4 | `<sup>|3|</sup>` | Toggle superscript | `|3|` |
| 5 | `<sub>|2|</sub>` | Toggle **superscript** (swap) | `<sup>|2|</sup>` |
| 6 | `<sup>|2|</sup>` | Toggle **subscript** (swap) | `<sub>|2|</sub>` |
| 7 | `*ita|lic|*` | Toggle italic (MD) | `ita|lic|` |
| 8 | `~~str|ike|~~` | Toggle strikethrough (MD) | `str|ike|` |
| 9 | `==high|light|==` | Toggle highlight (MD) | `high|light|` |
| 10 | `<b><i>te|xt|</i></b>` | Toggle bold (HTML) | `<i>te|xt|</i>` |
| 11 | `|<u>hello</u>|` (Ctrl+A, delimiter-inclusive) | Toggle underline | `|hello|` |
| 12 | `|**bold**|` (delimiter-inclusive) | Toggle bold (MD) | `|bold|` |
| 13 | `***bo|th|***` | Toggle bold (MD) | `*bo|th|*` |
| 14 | `***bo|th|***` | Toggle italic (MD) | `**bo|th|**` |

---

### Adding New Tags

| # | Input | Action | Result |
|---|-------|--------|--------|
| 15 | `|hello|` | Toggle underline | `|<u>hello</u>|` |
| 16 | `|hello|` | Toggle bold (MD) | `|**hello**|` |
| 17 | `|hello|` | Toggle italic (MD) | `|*hello*|` |
| 18 | `H|2|O` | Toggle subscript | `H|<sub>2</sub>|O` |

---

### Domain Conversion

| # | Input | Action | Result |
|---|-------|--------|--------|
| 19 | `**bo|ld|**` | Toggle underline (MD→HTML) | `<u><b>bo|ld|</b></u>` |
| 20 | `*ita|lic|*` | Toggle subscript (MD→HTML) | `<sub><i>ita|lic|</i></sub>` |
| 21 | `<u>te|xt|</u>` | Toggle bold/MD (inside HTML) | `<u><b>te|xt|</b></u>` |
| 22 | `<u>te|xt|</u>` | Toggle italic/MD (inside HTML) | `<u><i>te|xt|</i></u>` |
| 23 | `<u>te|xt|</u>` | Toggle strikethrough/MD (inside HTML) | `<u><s>te|xt|</s></u>` |
| 24 | `~~str|uck|~~` | Toggle underline (MD→HTML) | `<u><s>str|uck|</s></u>` |
| 25 | `==high|lighted|==` | Toggle underline (MD→HTML) | `<u><mark>high|lighted|</mark></u>` |

---

### Inert Zones (no-op)

| # | Input | Action | Result |
|---|-------|--------|--------|
| 26 | `\`\`\`\nconst x = 1;\n\`\`\`` (cursor inside) | Toggle bold | No-op |
| 27 | `\| cell1 \| cell2 \|` (cursor inside) | Toggle underline | No-op |
| 28 | `$$\nx^2 + y^2\n$$` (cursor inside) | Toggle bold | No-op |
| 29 | `$x^2$` (cursor `$|x^2$`) | Toggle underline | No-op |
| 30 | `---` (full selection) | Toggle bold | No-op |

---

### Protected Ranges (wikilinks, embeds, links, tags, footnotes)

| # | Input | Action | Result |
|---|-------|--------|--------|
| 31 | `|Visit [[Note]] here|` | Toggle underline | `<u>Visit </u>[[Note]]<u> here</u>` |
| 32 | `|See ![[image.png]] below|` | Toggle underline | `<u>See </u>![[image.png]]<u> below</u>` |
| 33 | `|See [link](url) end|` | Toggle bold (HTML) | `<b>See </b>[link](url)<b> end</b>` |
| 34 | `|Check #my-tag rest|` | Toggle underline | `<u>Check </u>#my-tag<u> rest</u>` |
| 35 | `|Ref [^1] text|` | Toggle underline | `<u>Ref </u>[^1]<u> text</u>` |
| 36 | `|[[A]][[B]]|` (adjacent, no gap) | Toggle underline | No replacements (nothing to wrap) |

---

### Line Prefix Preservation

| # | Input | Action | Result |
|---|-------|--------|--------|
| 37 | `## |My Title|` | Toggle underline | `## <u>|My Title|</u>` |
| 38 | `- |item text|` | Toggle bold (MD) | `- **|item text|**` |
| 39 | `- |item text|` | Toggle underline | `- <u>|item text|</u>` |
| 40 | `1. |numbered|` | Toggle underline | `1. <u>|numbered|</u>` |
| 41 | `- [ ] |task|` | Toggle underline | `- [ ] <u>|task|</u>` |
| 42 | `- [x] |done|` | Toggle bold (MD) | `- [x] **|done|**` |
| 43 | `  - |nested|` | Toggle underline | `  - <u>|nested|</u>` |
| 44 | `> |callout body|` | Toggle bold (MD) | `> **|callout body|**` |
| 45 | `> |callout body|` | Toggle underline | `> <u>|callout body|</u>` |
| 46 | `> - [ ] |task|` | Toggle bold (MD) | `> - [ ] **|task|**` |

---

### Partial Inner Tag — Wrap Whole Selection and Dissolve Inner Same-Tag

These cover selecting a range that *contains* a same-tag sub-span as a substring.

| # | Input | Action | Result |
|---|-------|--------|--------|
| 47 | `|task **one**|` | Toggle bold (MD) | `**|task one|**` (inner `**` dissolved) |
| 48 | `|task **one**|` | Toggle underline | `<u>|task <b>one</b>|</u>` (MD→HTML) |
| 49 | `|**task one**|` | Toggle bold (MD) | `|task one|` (full removal) |
| 50 | `|<u>task one</u>|` | Toggle bold (MD→HTML) | `<b>|<u>task one</u>|</b>` |
| 51 | `|<b>task one</b>|` | Toggle bold (MD) | `|task one|` (full removal) |
| 52 | `|start *mid* end|` | Toggle italic (MD) | `*|start mid end|*` (inner `*` dissolved) |
| 53 | `|<u>part</u> rest|` | Toggle underline | `<u>|part rest|</u>` (inner `<u>` dissolved) |
| 54 | `  |**bold**|  ` | Toggle bold (MD) | `  |bold|  ` (whitespace-inclusive removal) |

---

### Span Toggle-Off

| # | Input | Action | Result |
|---|-------|--------|--------|
| 55 | `<span style="color: red">te|xt|</span>` | Toggle color-red span | `te|xt|` |

---

### Sub-Selection Punch-Out — Split Tag Around Partial Selection

When a selection is a **proper subset** of a tag's content, pressing the same tag
*punches out* the tag from the selected region, leaving the rest still formatted.

| # | Input | Action | Result |
|---|-------|--------|--------|
| 56 | `<b>task |one|</b>` | Toggle bold (MD) | `<b>task </b>\|one\|<b></b>` |
| 57 | `<b>|task| one</b>` | Toggle bold (MD) | `<b></b>\|task\|<b> one</b>` |
| 58 | `<b>|task one|</b>` (full content) | Toggle bold (MD) | `|task one|` (full removal) |
| 59 | `<u>hello |world|</u>` | Toggle underline | `<u>hello </u>\|world\|<u></u>` |
| 60 | `<b>task |one|</b>` | Toggle underline (different tag) | `<b>task <u>|one|</u></b>` (add, not punch-out) |
| 61 | `**task |one|**` | Toggle bold (MD) | `**task **\|one\|****` |
| 62 | `**|task one|**` (full content) | Toggle bold (MD) | `|task one|` (full removal) |
| 63 | `*task |one|*` | Toggle italic (MD) | `*task *\|one\|**` |
| 64 | `~~task |one|~~` | Toggle strikethrough (MD) | `~~task ~~\|one\|~~~~` |

#### Full Content Removal — All Tag Types

| # | Input | Action | Result |
|---|-------|--------|--------|
| 65 | `*|task one|*` | Toggle italic (MD) | `|task one|` |
| 66 | `~~|task one|~~` | Toggle strikethrough (MD) | `|task one|` |
| 67 | `==|task one|==` | Toggle highlight (MD) | `|task one|` |
| 68 | `<u>|task one|</u>` | Toggle underline | `|task one|` |
| 69 | `<b>|task one|</b>` | Toggle bold (HTML) | `|task one|` |
| 70 | `<i>|task one|</i>` | Toggle italic (HTML) | `|task one|` |
| 71 | `<s>|task one|</s>` | Toggle strikethrough (HTML) | `|task one|` |
| 72 | `<mark>|task one|</mark>` | Toggle highlight (HTML) | `|task one|` |
| 73 | `<sub>|task one|</sub>` | Toggle subscript | `|task one|` |
| 74 | `<sup>|task one|</sup>` | Toggle superscript | `|task one|` |

---

### Cursor-Only (Zero-Width) Behavior

| # | Input | Action | Result |
|---|-------|--------|--------|
| 75 | `hello| world` (cursor, inside `<u>`) | Toggle underline | `hello|` (removes enclosing `<u>`) |
| 76 | `hello| world` (cursor, plain text) | Toggle underline | `hello<u></u>| world` |
| 77 | `hello| world` (cursor, plain text) | Toggle bold (MD) | `hello****| world` |
| 78 | `` (empty) | Toggle underline | `<u></u>` |

---

## removeTag

| # | Input | Action | Result |
|---|-------|--------|--------|
| 79 | `<u>hel|lo|</u>` | Remove underline | `hel|lo|` |
| 80 | `<u>hel|lo|</u>` | Remove bold (not present) | No-op |
| 81 | `**bo|ld|**` | Remove bold (MD) | `bo|ld|` |
| 82 | `<u><u>te|xt|</u></u>` | Remove underline | `<u>te|xt|</u>` (innermost removed) |
| 83 | `|<u>hello</u>|` (delimiter-inclusive) | Remove underline | `|hello|` |
| 84 | `<span style="color: red">task |one|</span>` (partial) | Remove color-red span | `<span style="color: red">task </span>\|one\|<span style="color: red"></span>` **[punch-out]** |
| 85 | `<span style="color: red">|task one|</span>` (full content) | Remove color-red span | `|task one|` |
| 86 | `<span style="color: red">task| one</span>` (zero-width) | Remove color-red span | `task| one` (full removal) |
| 87 | `<u>hello |world|</u>` (partial) | Remove underline | `<u>hello </u>\|world\|<u></u>` **[punch-out]** |
| 88 | `<b><i>te|xt|</i></b>` (selection inside nested `<i>`) | Remove bold | `<i>te|xt|</i>` (full removal, nested guard) |
| 89 | `<u>te|xt|</u>` (cursor) | Remove underline | `te|xt|` |
| 90 | `<u>te|xt|</u>` (cursor) | Remove bold (not present) | No-op |

---

## addTag

| # | Input | Action | Result |
|---|-------|--------|--------|
| 91 | `|hello world|` | Add underline | `<u>|hello world|</u>` |
| 92 | `<span style="color: red">te|xt|</span>` | Add color-blue span | `<span style="color: blue">te|xt|</span>` (attribute replaced) |
| 93 | `<span style="color: red">te|xt|</span>` | Add font-family Arial span | `<span style="color: red"><span style="font-family: Arial">te|xt|</span></span>` (different property, nested) |
| 94 | `<u>hel|lo|</u>` | Add underline (already present) | `<u><u>hel|lo|</u></u>` (double-wrap, add-only) |
| 95 | `` ```\ncode\n``` `` (cursor inside) | Add underline | No-op |
| 96 | `<span style="font-size: 12pt">te|xt|</span>` | Add font-size 16pt | `<span style="font-size: 16pt">te|xt|</span>` (attribute replaced) |
| 97 | `hello| world` (cursor, plain text) | Add underline | `hello<u></u>| world` |

---

## removeAllTags

| # | Input | Action | Result |
|---|-------|--------|--------|
| 98 | `<u><b>hel|lo|</b></u>` | Remove all tags | `hel|lo|` |
| 99 | `**bo|ld|** and <u>underline</u>` | Remove all tags | `bo|ld| and <u>underline</u>` (only enclosing bold removed) |
| 100 | `|plain text|` | Remove all tags | No-op |
| 101 | `<u><b><i>te|xt|</i></b></u>` | Remove all tags | `te|xt|` |
| 102 | `|<u><b>bold</b></u>|` (delimiter-inclusive) | Remove all tags | `|bold|` |
| 103 | `` ```\ncode\n``` `` (cursor inside) | Remove all tags | No-op |
| 104 | `<u>**te|xt|**</u>` | Remove all tags | `te|xt|` (mixed HTML + MD) |
| 105 | `## <u>Ti|tle|</u>` | Remove all tags (preserveLinePrefix) | `## Ti|tle|` |
| 106 | `|<u><b>text</b></u>|` | Remove all tags | `|text|` |
| 107 | `|**bold**|` | Remove all tags | `|bold|` |
| 108 | `***bo|th|***` | Remove all tags | `bo|th|` |
| 109 | `|**bold** and <u>underline</u>|` (full) | Remove all tags | `|bold and underline|` |

---

## copyFormat

| # | Input | Action | Result |
|---|-------|--------|--------|
| 110 | `<u><b>te|xt|</b></u>` | Copy format | Returns `{ domain: 'html', tagDefinitions: [b, u] }` |
| 111 | `|plain text|` | Copy format | Returns `{ domain: 'markdown', tagDefinitions: [] }` |
| 112 | `**bo|ld|**` | Copy format | Returns `{ domain: 'markdown', tagDefinitions: [bold] }` |
| 113 | `<span style="color: red">te|xt|</span>` | Copy format | Returns `{ domain: 'html', tagDefinitions: [span { color: 'red' }] }` |
| 114 | `<u><span style="color: blue"><b>te|xt|</b></span></u>` | Copy format | Returns `{ domain: 'html', tagDefinitions: [b, span { color: 'blue' }, u] }` |

---

## Edge Cases

| # | Input | Action | Result |
|---|-------|--------|--------|
| 115 | `<u>hel|lo|</u>` (zero-width cursor inside) | Toggle underline | `hello` (enclosing tag removed) |
| 116 | `|` (empty text, cursor) | Toggle underline | `<u></u>` |

---

## Notes

- **Punch-out split**: When a partial (non-empty, non-full) selection is inside a
  tag and the same tag is toggled or removed, the tag is *split around the selection*
  — the selected text loses the formatting while content outside the selection retains it.
- **Nested guard**: The punch-out is suppressed when the selection sits entirely inside
  a *nested sub-tag* of the outer tag being removed (e.g. selecting text inside `<i>`
  while removing the enclosing `<b>`). In that case a full removal is performed instead.
- **Delimiter-inclusive**: Selecting text that includes the tag delimiters (e.g. Ctrl+A)
  still correctly removes the tag rather than toggling it off and back on.
- **Domain conversion**: Applying an HTML-only tag (underline, subscript, superscript)
  to MD-formatted text automatically converts the MD tags to their HTML equivalents first.
