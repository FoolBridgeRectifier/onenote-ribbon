/**
 * v2 adapter shim for `detectActiveTagKeys`. v2 detection-engine has its own
 * detection API, but consumers (editorStateHelpers) currently rely on the
 * legacy active-tag-key shape. Re-export here so callers depend on the v2
 * boundary, allowing future replacement without touching call sites.
 */
export { detectActiveTagKeys } from '../../../editor/styling-engine/callout-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
