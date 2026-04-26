# Detection Engine v2 — Specification

## Purpose

Scan the full document once on load. Maintain an ordered list of all detected tags in a `TagContext`. Rebuild the context (debounced) after every content change. Expose a query API for the styling engine to ask "what tags are active here?".

---

## Public API

| Function                | Signature                                                 | Description                                                             |
| ----------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `buildTagContext`       | `(content: string) → TagContext`                          | Full document scan. Call on load and after debounced change.            |
| `getActiveTagsAtCursor` | `(context, cursorPosition) → ActiveTagsResult`            | Returns all closing tags enclosing the cursor plus the active line tag. |
| `getEnclosingTags`      | `(context, selectionStart, selectionEnd) → DetectedTag[]` | Returns all tags whose range fully covers the selection.                |

---

## Tag Categories

| Category      | Examples                                                            | Has open/close? | Has line prefix? |
| ------------- | ------------------------------------------------------------------- | --------------- | ---------------- |
| MD Closing    | `**bold**`, `*italic*`, `~~strike~~`, `==highlight==`, `` `code` `` | Yes             | No               |
| HTML Closing  | `<b>`, `<i>`, `<s>`, `<u>`, `<sub>`, `<sup>`                        | Yes             | No               |
| HTML Span     | `<span style="color:red">`, `<span style="font-size:14pt">`         | Yes             | No               |
| Single / Line | `- `, `# `, `> `, `<span style="margin-left:24px"/>`                | open only       | Yes              |
| Special       | `- [ ] `, `> [!type]`, `#todo`, meeting-details block               | open only       | Yes (block)      |

---

## Inert Zones — never scan inside

| Zone               | Marker                |
| ------------------ | --------------------- |
| Fenced code block  | ` ```...``` `         |
| Math block         | `$$...$$`             |
| Tab-indented block | Line starts with `\t` |

Detection skips all tag-scanning inside inert zones. Tags that start outside and would extend into an inert zone are truncated at the zone boundary.

---

## Protected Tokens — recorded but not split

| Token         | Type        |
| ------------- | ----------- |
| `[[...]]`     | wikilink    |
| `![[...]]`    | embed       |
| `[text](url)` | mdLink      |
| `[^ref]`      | footnoteRef |

These are recorded as `ProtectedRange` entries in `TagContext`. The styling engine uses them to punch out around these tokens.

---

## Logic Diagram

```mermaid
flowchart TD
    A([Document load or content change]) --> B[buildTagContext]
    B --> C[Split document into lines]
    C --> LOOP_START

    LOOP_START{More lines?} -- yes --> D
    LOOP_START -- no --> P

    D{Line in inert zone?} -- "fenced-code / math / tab-indent" --> E[Skip line; advance inert-zone boundary]
    E --> LOOP_START
    D -- "not inert" --> F[Detect line-level prefix tag]

    F --> F1{Callout header?}
    F1 -- "yes: '> !type ...'" --> F2[Record callout tag with calloutType]
    F1 -- no --> F3{Meeting-details header?}
    F3 -- "yes: '> ---'" --> F4[Record meeting-details tag]
    F3 -- no --> F5{Checkbox prefix?}
    F5 -- "yes: '- space checkbox'" --> F6[Record checkbox tag]
    F5 -- no --> F7{List prefix?}
    F7 -- "yes: '- content'" --> F8[Record list tag]
    F7 -- no --> F9{Heading prefix?}
    F9 -- "yes: one or more # chars" --> F10[Record heading tag with headingLevel]
    F9 -- no --> F11{Quote prefix?}
    F11 -- "yes: '> content'" --> F12[Record quote tag]
    F11 -- no --> F13{Indent span present?}
    F13 -- yes --> F14[Record indent tag with indentDepth]
    F13 -- "no prefix" --> G

    F2 --> G
    F4 --> G
    F6 --> G
    F8 --> G
    F10 --> G
    F12 --> G
    F14 --> G

    G[Scan inline content after prefix]

    G --> SCAN{Protected token next?}
    SCAN -- "yes: wikilink / embed / mdLink" --> PROT[Record ProtectedRange for token; advance past it]
    PROT --> SCAN
    SCAN -- "no protected token" --> MATCH[Match opening delimiter or tag to closing counterpart]
    MATCH --> FOUND{Match found?}
    FOUND -- yes --> DTAG[Create DetectedTag with open and close positions]
    FOUND -- "no: unmatched open" --> DISCARD[Discard unmatched delimiter]
    DTAG --> APPEND[Append to tags array]
    DISCARD --> APPEND
    APPEND --> SCAN_MORE{More inline content?}
    SCAN_MORE -- yes --> SCAN
    SCAN_MORE -- no --> LOOP_START

    P[Sort all tags by open.start ascending]
    P --> Q([Return TagContext])

    Q --> EVT{User event}
    EVT -- cursor-move --> CUR[getActiveTagsAtCursor]
    EVT -- selection --> SEL[getEnclosingTags]

    CUR --> CUR1["For each tag: open.start <= cursor <= close.end?"]
    CUR1 --> CUR2[Collect enclosingTags]
    CUR2 --> CUR3[Find line tag on cursor line]
    CUR3 --> CUR4([Return ActiveTagsResult])

    SEL --> SEL1["For each tag: open.start <= selStart AND close.end >= selEnd?"]
    SEL1 --> SEL2([Return matching DetectedTag array])
```

---

## Examples at Each Detection Path

| Path        | Input                               | Detected Tag                                                   |
| ----------- | ----------------------------------- | -------------------------------------------------------------- |
| MD bold     | `**hello**`                         | `type='bold', isHTML=false, open={0,0→0,2}, close={0,7→0,9}`   |
| MD italic   | `*world*`                           | `type='italic', isHTML=false, open={0,0→0,1}, close={0,6→0,7}` |
| HTML bold   | `<b>hi</b>`                         | `type='bold', isHTML=true, open={0,0→0,3}, close={0,5→0,9}`    |
| Span color  | `<span style="color:red">hi</span>` | `type='color', isHTML=true, isSpan=true`                       |
| Fenced code | ` ```\ncode\n``` `                  | Nothing inside; inert zone recorded                            |
| List line   | `- item`                            | `type='list', open={0,0→0,2}, no close`                        |
| Heading h2  | `## Title`                          | `type='heading', headingLevel=2, open={0,0→0,3}`               |
| Callout     | `> [!note] My Note`                 | `type='callout', calloutType='note', open={0,0→0,3}`           |
| Wikilink    | `[[Page]]`                          | ProtectedRange recorded; not a tag                             |
| Checkbox    | `- [ ] task`                        | `type='checkbox', open={0,0→0,6}`                              |
| Indent span | `<span style="margin-left:48px"/>`  | `type='indent', indentDepth=2`                                 |
