import type {
  CalloutTagDefinition,
  CheckboxTagDefinition,
  InlineTodoTagDefinition,
  ObsidianEditor,
  TaskTagDefinition,
} from '../interfaces';

import { applyCallout } from './apply-callout/applyCallout';
import { removeActiveCallout } from './remove-active-callout/removeActiveCallout';
import { removeCalloutByKey } from './remove-callout-by-key/removeCalloutByKey';

// Phase 8e/8f will replace these legacy delegations with v2-native ports.
import { applyTask } from '../../../../editor/styling-engine/callout-apply/calloutApply';
import { toggleInlineTodoTag } from '../../../../editor/styling-engine/callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag';
import { removeActiveCheckbox } from '../../../../editor/styling-engine/callout-apply/helpers/remove-active-checkbox/RemoveActiveCheckbox';

/** Adds a callout or task to the editor at the cursor. */
export function addTag(
  editor: ObsidianEditor,
  tagDefinition: CalloutTagDefinition | TaskTagDefinition
): void {
  if (tagDefinition.kind === 'callout') {
    if (tagDefinition.calloutType === undefined || tagDefinition.calloutType === null) return;
    applyCallout(editor, tagDefinition.calloutType, tagDefinition.calloutTitle);
    return;
  }

  if (tagDefinition.kind === 'task') {
    applyTask(editor, tagDefinition.taskPrefix ?? '');
  }
}

/** Toggles an inline `#todo` tag at the cursor / selection. */
export function toggleTag(editor: ObsidianEditor, tagDefinition: InlineTodoTagDefinition): void {
  if (tagDefinition.kind === 'inline-todo') {
    toggleInlineTodoTag(editor);
  }
}

/**
 * Removes a callout (named or innermost) or a task checkbox at the cursor.
 * Callouts: when `calloutTitle` is given, removes that specific callout regardless of nesting.
 * Otherwise removes the innermost callout enclosing the cursor.
 */
export function removeTag(
  editor: ObsidianEditor,
  tagDefinition: CalloutTagDefinition | CheckboxTagDefinition
): void {
  if (tagDefinition.kind === 'callout') {
    if (tagDefinition.calloutTitle !== undefined && tagDefinition.calloutTitle !== null) {
      removeCalloutByKey(editor, tagDefinition.calloutTitle);
      return;
    }
    removeActiveCallout(editor);
    return;
  }

  if (tagDefinition.kind === 'checkbox') {
    removeActiveCheckbox(editor);
  }
}
