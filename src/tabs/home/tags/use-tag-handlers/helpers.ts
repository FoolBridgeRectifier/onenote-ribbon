import {
  applyCallout,
  applyTask,
  removeInnermostCallout,
  removeCalloutByKey,
} from '../../../../shared/editor/styling-engine/stylingEngine';
import { ACTIVE_TAG_KEY_TASK } from '../constants';
import type { TagDefinition } from '../interfaces';
import type { TagDropdownSelectContext } from './interfaces';

/**
 * Applies the appropriate callout action when a dropdown item is selected,
 * handling toggle-off (by key), callout apply, task apply, and command execution.
 */
export function selectTagFromDropdown(
  tagDefinition: TagDefinition,
  context: TagDropdownSelectContext
): void {
  const {
    getEditor,
    activeTagKeys,
    canRemoveTag,
    executeCommand,
    setMoreMenuOpen,
    setCustomizeModalOpen,
  } = context;

  if (tagDefinition.isCustomizeTags) {
    setCustomizeModalOpen(true);
    setMoreMenuOpen(false);
    return;
  }

  if (tagDefinition.isRemoveTag) {
    if (!canRemoveTag) return;
    const editor = getEditor();
    if (editor) removeInnermostCallout(editor);
    setMoreMenuOpen(false);
    return;
  }

  if (tagDefinition.isDisabled) return;

  const calloutKey = tagDefinition.calloutKey;
  const isCurrentlyActive =
    calloutKey !== null && calloutKey !== undefined && activeTagKeys.has(calloutKey);

  if (isCurrentlyActive && tagDefinition.action.type === 'callout') {
    const editor = getEditor();
    // Remove the specific named callout, not necessarily the innermost
    if (editor && calloutKey) removeCalloutByKey(editor, calloutKey);
    setMoreMenuOpen(false);
    return;
  }

  if (
    isCurrentlyActive &&
    (tagDefinition.action.type === 'task' ||
      (tagDefinition.action.type === 'command' && calloutKey === ACTIVE_TAG_KEY_TASK))
  ) {
    const editor = getEditor();
    // Re-apply with the same prefix rather than removing the checkbox entirely.
    // This lets multiple task buttons replace each other when the line already has a task.
    const taskPrefix = tagDefinition.action.type === 'task' ? tagDefinition.action.taskPrefix : '';
    if (editor) applyTask(editor, taskPrefix);
    setMoreMenuOpen(false);
    return;
  }

  // Apply the action: callout, task, or editor command
  if (tagDefinition.action.type === 'callout') {
    const editor = getEditor();
    if (editor) applyCallout(editor, tagDefinition.action.calloutType, tagDefinition.action.calloutTitle);
  } else if (tagDefinition.action.type === 'task') {
    const editor = getEditor();
    if (editor) applyTask(editor, tagDefinition.action.taskPrefix);
  } else if (tagDefinition.action.type === 'command') {
    executeCommand(tagDefinition.action.commandId);
  }

  setMoreMenuOpen(false);
}
