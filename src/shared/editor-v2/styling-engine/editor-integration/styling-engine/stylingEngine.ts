// TODO: restore real implementations after engine refactor is complete
import type {
  CalloutTagDefinition,
  CheckboxTagDefinition,
  InlineTodoTagDefinition,
  ObsidianEditor,
  TaskTagDefinition,
} from '../interfaces';

/** STUB — no-op until engine refactor is complete. */
export function addTag(
  _editor: ObsidianEditor,
  _tagDefinition: CalloutTagDefinition | TaskTagDefinition
): void {
  // stub
}

/** STUB — no-op until engine refactor is complete. */
export function toggleTag(_editor: ObsidianEditor, _tagDefinition: InlineTodoTagDefinition): void {
  // stub
}

/** STUB — no-op until engine refactor is complete. */
export function removeTag(
  _editor: ObsidianEditor,
  _tagDefinition: CalloutTagDefinition | CheckboxTagDefinition
): void {
  // stub
}
