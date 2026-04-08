# insert-footnote/tests

Unit and edge-case tests for the Insert Footnote button.

- `insert-footnote.unit.ts` — verifies button exists, inserts the `[^1]` ref, and appends the definition at end of document.
- `insert-footnote.edge.ts` — verifies multi-line notes: definition at last line, ref at cursor line.
