/**
 * v2 adapter shim for the legacy `stylingEngine` public API.
 *
 * Consumers (use-tag-handlers, command palette, etc.) call `addTag` / `toggleTag`
 * with callout / task / inline-todo "kind"-based tag definitions. v2 detection-engine
 * recognises these but v2 styling-engine does not yet provide apply paths for them,
 * so we delegate to the legacy engine here. This keeps callers behind the v2 boundary
 * so Phase 8 can excise everything the v2 engine *does* own without touching callers.
 */
export {
  toggleTag,
  addTag,
  removeTag,
  removeAllTags,
  copyFormat,
} from '../../../../editor/styling-engine/stylingEngine';
