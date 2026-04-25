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
    A([Document load / content change]) --> B[buildTagContext content]
    B --> C[Split into lines]
    C --> D{Line in inert zone?}
    D -->|Yes: fenced code / math / tab| E[Skip line, extend inert zone if needed]
    E --> D
    D -->|No| F[Detect line-level tag]

    F --> F1{"Starts with '> [!type]'?"}
    F1 -->|Yes| F2["Record callout tag\ne.g. '> [!note] Title'"]
    F1 -->|No| F3{"Starts with '> ---'?"}
    F3 -->|Yes| F4[Record meeting-details tag]
    F3 -->|No| F5{"Starts with '- [ ]'?"}
    F5 -->|Yes| F6[Record checkbox tag]
    F5 -->|No| F7{"Starts with '- '?"}
    F7 -->|Yes| F8[Record list tag]
    F7 -->|No| F9{"Starts with '# '?"}
    F9 -->|Yes| F10[Record heading tag with level]
    F9 -->|No| F11{"Starts with '> '?"}
    F11 -->|Yes| F12[Record quote tag]
    F11 -->|No| F13{Has margin-left span?}
    F13 -->|Yes| F14[Record indent tag with depth]
    F13 -->|No| G

    F2 & F4 & F6 & F8 & F10 & F12 & F14 --> G[Scan inline content for closing tags]

    G --> H{Encounter protected token?}
    H -->|Yes: wikilink embed mdLink| I["Record as ProtectedRange\nex: [[My Note]] at ch 5–16"]
    I --> H
    H -->|No| J[Match opening delimiter / tag to closing counterpart]
    J --> K{"Match found?"}
    K -->|Yes| L["Create DetectedTag with open+close\nex: open={line:0,ch:0} close={line:0,ch:7} for **hello**"]
    K -->|No unmatched open| M[Discard unmatched delimiter]
    L --> N[Append to tags array]
    M --> N
    N --> O{More lines?}
    O -->|Yes| D
    O -->|No| P[Sort tags by open.start ascending]
    P --> Q([Return TagContext])

    Q --> R{User event}
    R -->|Cursor move| S[getActiveTagsAtCursor context cursor]
    R -->|Selection| T[getEnclosingTags context start end]

    S --> S1["For each tag: open.start ≤ cursor ≤ close.end?\nex: cursor at ch 3 inside **hello** → bold enclosing"]
    S1 --> S2[Collect enclosingTags]
    S2 --> S3[Find line tag on cursor line]
    S3 --> S4([Return ActiveTagsResult])

    T --> T1["For each tag: open.start ≤ selStart AND close.end ≥ selEnd?\nex: select 'ell' inside **hello** → bold encloses it"]
    T1 --> T2([Return DetectedTag[]])
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
