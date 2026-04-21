import { useCallback } from 'react';

import { applyTag } from '../../styling-engine/tag-apply/TagApply';
import {
  removeActiveCallout,
  removeActiveCheckbox,
  toggleInlineTodoTag,
} from '../../styling-engine/tag-apply/helpers';
import { ACTIVE_TAG_KEY_TASK } from '../../styling-engine/tag-apply/constants';
import { saveCustomTags } from '../../../../tabs/home/tags/tag-storage/TagStorage';
import type { CustomTag } from '../../../../tabs/home/tags/customize-modal/interfaces';
import type { TagDefinition } from '../../../../tabs/home/tags/interfaces';
import type { AppWithCommands } from '../../../context/interfaces';
import type { TagHandlersOptions } from './interfaces';
import { EDITOR_COMMAND_TOGGLE_CHECKLIST } from './constants';
import { selectTagFromDropdown } from './helpers';

export function useTagHandlers({
  app,
  activeTagKeys,
  canRemoveTag,
  setMoreMenuOpen,
  setCustomizeModalOpen,
  setCustomTags,
}: TagHandlersOptions) {
  const getEditor = useCallback(() => app.workspace.activeEditor?.editor, [app]);

  const executeCommand = useCallback(
    (commandId: string) => {
      (app as unknown as AppWithCommands).commands.executeCommandById(commandId); // eslint-disable-line strict-structure/no-double-cast -- Obsidian's public App doesn't expose `commands`; internal API required
    },
    [app]
  );

  const handleTodo = useCallback(() => {
    const editor = getEditor();
    if (editor && activeTagKeys.has(ACTIVE_TAG_KEY_TASK)) {
      removeActiveCheckbox(editor);
      return;
    }
    executeCommand(EDITOR_COMMAND_TOGGLE_CHECKLIST);
  }, [getEditor, activeTagKeys, executeCommand]);

  const handleImportant = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Important')) {
      removeActiveCallout(editor);
      return;
    }
    applyTag(
      editor,
      { type: 'callout', calloutType: 'important', calloutTitle: 'Important' },
      executeCommand
    );
  }, [getEditor, activeTagKeys, executeCommand]);

  const handleQuestion = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Question')) {
      removeActiveCallout(editor);
      return;
    }
    applyTag(
      editor,
      { type: 'callout', calloutType: 'question', calloutTitle: 'Question' },
      executeCommand
    );
  }, [getEditor, activeTagKeys, executeCommand]);

  const handleFindTags = useCallback(() => {
    executeCommand('global-search:open');
    const searchInputElement = document.querySelector(
      'input[placeholder*="Search"]'
    ) as HTMLInputElement | null;
    if (searchInputElement) {
      searchInputElement.value = '#';
      searchInputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [executeCommand]);

  const handleToDoTag = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    toggleInlineTodoTag(editor);
  }, [getEditor]);

  const handleCustomTagsChange = useCallback(
    (updatedTags: CustomTag[]) => {
      saveCustomTags(updatedTags);
      setCustomTags(updatedTags);
    },
    [setCustomTags]
  );

  const handleTagDropdownSelect = useCallback(
    (tagDefinition: TagDefinition) => {
      selectTagFromDropdown(tagDefinition, {
        getEditor,
        activeTagKeys,
        canRemoveTag,
        executeCommand,
        setMoreMenuOpen,
        setCustomizeModalOpen,
      });
    },
    [getEditor, activeTagKeys, canRemoveTag, executeCommand, setMoreMenuOpen, setCustomizeModalOpen]
  );

  return {
    handleTodo,
    handleImportant,
    handleQuestion,
    handleFindTags,
    handleToDoTag,
    handleCustomTagsChange,
    handleTagDropdownSelect,
  };
}
