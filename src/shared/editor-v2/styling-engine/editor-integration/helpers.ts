// TODO: restore real implementations after engine refactor is complete
import type { HtmlTagDefinition, ObsidianEditor, LegacyCopiedFormat } from './interfaces';

/** STUB — no-op until engine refactor is complete. */
export function toggleTagInEditor(
  _editor: ObsidianEditor,
  _htmlTagDefinition: HtmlTagDefinition
): void {
  // stub
}

/** STUB — no-op until engine refactor is complete. */
export function addTagInEditor(
  _editor: ObsidianEditor,
  _htmlTagDefinition: HtmlTagDefinition
): void {
  // stub
}

/** STUB — no-op until engine refactor is complete. */
export function removeTagInEditor(
  _editor: ObsidianEditor,
  _htmlTagDefinition: HtmlTagDefinition
): void {
  // stub
}

/** STUB — no-op until engine refactor is complete. */
export function removeAllTagsInEditor(_editor: ObsidianEditor): void {
  // stub
}

/** STUB — returns null until engine refactor is complete. */
export function copyFormatFromEditor(_editor: ObsidianEditor): LegacyCopiedFormat | null {
  return null;
}
