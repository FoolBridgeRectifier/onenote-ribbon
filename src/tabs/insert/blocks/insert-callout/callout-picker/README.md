# callout-picker

A static dropdown picker used by the Insert Callout button. Presents all 12 Obsidian callout types and inserts `> [!type]\n> ` at the cursor on selection.

## Files

- `CalloutPicker.ts` — the picker class with a static `show(anchor, editor)` method.
- `callout-picker.css` — base styles for the picker dropdown (also applied via inline styles for portability).
