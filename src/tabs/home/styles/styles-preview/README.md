# styles-preview

Renders the two visible style preview cards. Exposes a `refresh(panel)` method consumed by `StylesScroll` via the orchestrator callback.

## Files

- `StylesPreview.ts` — renders cards at `offset` and `offset+1`; handles click-to-apply; `refresh()` updates labels and inline styles in place.
