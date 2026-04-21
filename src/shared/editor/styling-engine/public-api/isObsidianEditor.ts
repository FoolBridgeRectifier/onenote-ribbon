import type { ObsidianEditor } from '../interfaces';

/** Returns true when the input is an Obsidian editor instance (has getCursor). */
export function isObsidianEditor(input: unknown): input is ObsidianEditor {
  return input != null && typeof (input as ObsidianEditor).getCursor === 'function';
}
