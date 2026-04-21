import { applyTag } from '../../styling-engine/tag-apply/TagApply';
import { removeActiveCallout, removeActiveCheckbox } from '../../styling-engine/tag-apply/helpers';
import { ACTIVE_TAG_KEY_TASK } from '../../styling-engine/tag-apply/constants';
import type { TagDefinition } from '../../../../tabs/home/tags/interfaces';
import type { TagDropdownSelectContext } from './interfaces';

/**
 * Applies the appropriate tag action when a dropdown item is selected,
 * handling toggle-off, callout, task, and custom tag cases.
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
    if (editor) removeActiveCallout(editor);
    setMoreMenuOpen(false);
    return;
  }

  if (tagDefinition.isDisabled) return;

  const calloutKey = tagDefinition.calloutKey;
  const isCurrentlyActive =
    calloutKey !== null && calloutKey !== undefined && activeTagKeys.has(calloutKey);

  if (isCurrentlyActive && tagDefinition.action.type === 'callout') {
    const editor = getEditor();
    if (editor) removeActiveCallout(editor);
    setMoreMenuOpen(false);
    return;
  }

  if (
    isCurrentlyActive &&
    (tagDefinition.action.type === 'task' ||
      (tagDefinition.action.type === 'command' && tagDefinition.calloutKey === ACTIVE_TAG_KEY_TASK))
  ) {
    const editor = getEditor();
    if (editor) removeActiveCheckbox(editor);
    setMoreMenuOpen(false);
    return;
  }

  const editor = getEditor();
  if (editor) {
    applyTag(editor, tagDefinition.action, executeCommand);
  }
  setMoreMenuOpen(false);
}
