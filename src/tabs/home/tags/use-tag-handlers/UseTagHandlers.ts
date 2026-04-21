import { useCallback } from 'react';

import {
  applyCallout,
  removeCalloutByKey,
  removeCheckbox,
  toggleInlineTodo,
} from '../../../../shared/editor/styling-engine/stylingEngine';
import { ACTIVE_TAG_KEY_TASK, EDITOR_COMMAND_OPEN_GLOBAL_SEARCH } from '../constants';
import { saveCustomTags } from '../tag-storage/TagStorage';
import type { CustomTag } from '../customize-modal/interfaces';
import type { TagDefinition } from '../interfaces';
import type { AppWithCommands } from '../../../../shared/context/interfaces';
import type { TagHandlersOptions } from './interfaces';
import { selectTagFromDropdown } from './helpers';
import { EDITOR_COMMAND_TOGGLE_CHECKLIST } from './constants';

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
      // Obsidian's public App doesn't expose `commands`; internal API required
      (app as unknown as AppWithCommands).commands.executeCommandById(commandId);
    },
    [app]
  );

  const handleTodo = useCallback(() => {
    const editor = getEditor();
    if (editor && activeTagKeys.has(ACTIVE_TAG_KEY_TASK)) {
      removeCheckbox(editor);
      return;
    }
    executeCommand(EDITOR_COMMAND_TOGGLE_CHECKLIST);
  }, [getEditor, activeTagKeys, executeCommand]);

  // Uses removeCalloutByKey so clicking Important only removes the Important callout,
  // not a nested callout that happens to be innermost.
  const handleImportant = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Important')) {
      removeCalloutByKey(editor, 'Important');
      return;
    }
    applyCallout(editor, 'important', 'Important');
  }, [getEditor, activeTagKeys]);

  const handleQuestion = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Question')) {
      removeCalloutByKey(editor, 'Question');
      return;
    }
    applyCallout(editor, 'question', 'Question');
  }, [getEditor, activeTagKeys]);

  const handleFindTags = useCallback(() => {
    executeCommand(EDITOR_COMMAND_OPEN_GLOBAL_SEARCH);
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
    toggleInlineTodo(editor);
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
