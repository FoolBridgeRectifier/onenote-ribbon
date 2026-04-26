# Engine Refactor Plan — `feat-engine-refactor`

> Replace the old `src/shared/editor/styling-engine/*` with the spec-driven `src/shared/editor-v2/{detection-engine, styling-engine}/*`, then migrate every ribbon button to the new engine and delete the old one.

---

## Branch

`feat-engine-refactor` (already cut from `main`, carrying the in-progress v2 spec/test files).

## Source-of-truth specs

- `src/shared/editor-v2/detection-engine/SPEC.md`
- `src/shared/editor-v2/styling-engine/SPEC.md`

Tests already authored (TDD-red) drive every implementation step:

| Suite | Tests authored |
|---|---|
| `DetectionEngine.build.test.ts` | MD/HTML/span/line tags, inert zones, protected ranges, edge cases |
| `DetectionEngine.cursor.test.ts` | All cursor-position queries, prefix lines, inert zones, protected adjacency |
| `DetectionEngine.query.test.ts` | `getActiveTagsAtCursor`, `getEnclosingTags`, `getTagsInRange`, `insertionFormat` |
| `StylingEngine.add.test.ts` | A1–A18 from SPEC |
| `StylingEngine.add2.test.ts` | Multi-line + protected punch-out |
| `StylingEngine.remove.test.ts` | R1–R20 |
| `StylingEngine.cross.test.ts` | X1–X18, invariants I1–I6 |

Total currently failing: **232** (verified `2026-04-26`).

---

## Phase order (each phase ends green; never proceed with red)

### Phase 1 — DetectionEngine

Implement `buildTagContext`, `getActiveTagsAtCursor`, `getEnclosingTags`, `getTagsInRange`.

Folder layout (every file ≤150 lines, one primary + `constants.ts` + `interfaces.ts` + `helpers.ts` per CONVENTIONS §4):

```
detection-engine/
├── DetectionEngine.ts            ← public API only; delegates to sub-engines
├── constants.ts                  (already present)
├── interfaces.ts                 (already present)
├── helpers.ts                    ← cross-sub-engine pure helpers
├── inert-zones/                  ← detect fenced/math/tab zones; expose isInert(line)
├── line-prefix-detection/        ← detect list/heading/quote/callout/checkbox/indent/meetingDetails
├── protected-tokens/             ← wikilink/embed/mdLink/footnoteRef/code/todo/meetingDetails
├── inline-tag-scanner/           ← MD closing + HTML closing + HTML span scanning
├── span-style-parser/            ← parse `style="..."` → `{ type, value }`
├── tag-context-builder/          ← orchestrates full-doc scan
├── cursor-query/                 ← getActiveTagsAtCursor + insertionFormat
└── range-query/                  ← getEnclosingTags + getTagsInRange
```

**Gate to leave Phase 1**: `cmd /c npx jest src/shared/editor-v2/detection-engine` reports `Tests: <N> passed`, 0 failed.

### Phase 2 — StylingEngine Add path (A1–A18)

Folder layout under `styling-engine/`:

```
add-path/
├── decideAddOrRemove.ts          ← Word-like decision matrix entry
├── add-md-tag/                   ← A1
├── add-html-tag/                 ← A3
├── add-span-tag/                 ← A4/A5/A6 (replace value vs nest)
├── upgrade-md-to-html/           ← A2/A18 (pre-step)
├── extend-existing-tag/          ← A7 (boundary-spanning)
├── multi-line-add/               ← A11/A12/A17
├── protected-punch-out/          ← A10
└── line-tag-add/                 ← A13/A14/A15/A16
```

**Gate**: `StylingEngine.add.test.ts` + `StylingEngine.add2.test.ts` green.

### Phase 3 — Remove path (R1–R20)

```
remove-path/
├── remove-md-tag/                ← R1/R2/R3
├── remove-html-tag/              ← R5/R6
├── remove-span-tag/              ← R7/R8
├── md-html-coexistence/          ← R4/R9
├── mutual-exclusion-swap/        ← R10/R11/R12  (sub ↔ sup)
├── stacked-tag-collapse/         ← R13
├── multi-line-remove/            ← R14/R15
├── line-tag-remove/              ← R16/R17/R18/R19
└── downgrade-html-to-md/         ← R20 (post-step)
```

**Gate**: `StylingEngine.remove.test.ts` green.

### Phase 4 — Cross-type interactions (X1–X18) + invariants (I1–I6)

```
cross-type/
├── line-prefix-swap/             ← X4/X5
├── line-prefix-coexist/          ← X6/X7
├── callout-list-interaction/     ← X8/X16/X18
├── indent-vs-list-tab/           ← X17/X18  (tab in list, span outside)
├── highlight-color-mapping/      ← X13/X14
└── invariants/                   ← I1–I6 enforcement assertions
```

**Gate**: `StylingEngine.cross.test.ts` green; full v2 suite green.

### Phase 5 — `removeAllTags` and `copyFormat`

```
remove-all-tags/                  ← collect enclosing + interior, sort last-to-first, dedupe
copy-format/                      ← collect at cursor, return CopiedFormat
paste-reconciliation/             ← public helper that toggles missing tags onto destination
```

Add `RemoveAllTags.test.ts` and `CopyFormat.test.ts` (new TDD red files written first).

**Gate**: every v2 test file green.

### Phase 6 — Editor-integration adapter

Build `src/shared/editor-v2/styling-engine/editor-integration/` with the same public surface the buttons currently consume from the old engine:

| Old import (to delete) | New import (drop-in) |
|---|---|
| `addTagInEditor` from `editor/.../editor-integration/helpers` | `addTagInEditor` from `editor-v2/.../editor-integration/helpers` |
| `toggleTagInEditor` (same path) | same name, new path |
| `buildSpanTagDefinition` from `tag-manipulation/TagManipulation` | re-exported from new adapter |
| Constants `SUBSCRIPT_TAG`, `SUPERSCRIPT_TAG`, `HIGHLIGHT_MD_TAG` | re-exported via `editor-v2/.../constants.ts` |
| `convertMarkdownTokensToHtml` from `markdown-to-html-conversion/...` | new helper in `add-path/upgrade-md-to-html/` (re-exported) |
| Type `ObsidianEditor` | re-exported from `editor-v2/.../interfaces.ts` |

Write adapter unit tests proving signature parity against the old engine for every consumed function.

**Gate**: adapter tests green; `npx tsc --noEmit` passes.

### Phase 7 — Migrate buttons (one PR-shaped commit per file)

Order (lowest-risk first):

1. `src/tabs/home/basic-text/script-buttons/ScriptButtons.tsx`
2. `src/tabs/home/basic-text/font-picker/helpers.ts` (+ `helpers.test.ts`)
3. `src/tabs/home/basic-text/highlight-text-color/helpers.ts` (+ `helpers.test.ts`)
4. `src/tabs/home/basic-text/align-button/AlignButton.tsx`
5. `src/tabs/home/basic-text/helpers.ts`
6. `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts` and `helpers.ts`
7. Any handler that bypassed the engine (Tags stack, Styles, Clipboard paste reconciliation) — replace bespoke logic with `toggleTag` / `removeAllTags` / `copyFormat`.

For each migrated file:
- swap import paths (and constant names if renamed)
- run the file’s own colocated `*.test.ts(x)` — must stay green
- if behavior diverges from a snapshot, the snapshot is wrong → re-record once spec-conformance is verified manually

**Gate**: `npm test` whole-suite green; `npm run lint` clean; `npm run build` succeeds; **MCP live-Obsidian smoke-check every migrated button** (bold, italic, highlight, color, font, align, sub/sup, list, heading, quote, indent, callout, checkbox, format painter copy/paste).

### Phase 8 — Delete old engine

Once `grep` shows zero importers of `src/shared/editor/styling-engine/**`:

- Delete the folder.
- Delete now-orphaned tests (`*.test.ts` under that tree).
- Run `npm test`, `npm run lint`, `npm run build`.
- Run `npm run test:e2e` (full coverage suite).
- MCP final regression of every Home-tab and Insert-tab button.

**Final gate**: 0 references to `shared/editor/styling-engine`; full `npm test` green; full `npm run test:e2e` green; live MCP regression clean.

---

## File-length discipline

Every file in Phases 1–5 must obey CONVENTIONS §4 (one primary + `constants.ts` + `interfaces.ts` + `helpers.ts` per folder, ≤150 lines excluding imports). When a file would exceed 150 lines it is split into a new sub-subfolder following the same shape.

## Test discipline

- Tests are colocated next to the implementation (per CONVENTIONS §8). The 7 existing engine spec test files stay where they are (they are the public-API surface). Internal sub-engine helpers each get their own colocated `*.test.ts` covering every parameter variation and return path.
- No new logical block ships without exact unit tests.
- Run `cmd /c npx jest <path>` after every step. Never claim a phase complete without seeing `0 failed`.

## Rollback plan

Branch is feature-isolated. If Phase 7 reveals a behavior regression that can’t be hot-fixed:

1. Revert that single button-migration commit.
2. Continue Phase 8 only after the offending button passes both unit and MCP regression on the new engine.
3. Old engine stays in tree until **every** button is migrated **and** its MCP smoke-check is green.
