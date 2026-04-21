import { useCallback } from 'react';

import {
  addTag,
  removeTag,
  toggleTag,
} from '../../../../shared/editor/styling-engine/stylingEngine';
import { ACTIVE_TAG_KEY_TASK, EDITOR_COMMAND_OPEN_GLOBAL_SEARCH } from '../constants';
import { saveCustomTags } from '../tag-storage/TagStorage';
import type { CustomTag } from '../customize-modal/interfaces';
import type { TagDefinition } from '../interfaces';
import type { AppWithCommands } from '../../../../shared/context/interfaces';
import type { TagHandlersOptions } from './interfaces';
import { selectTagFromDropdown } from './helpers';
import { EDITOR_COMMAND_TOGGLE_CHECKLIST, CALLOUT_TITLE_WITH_CONTENT_PATTERN } from './constants';

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
      // eslint-disable-next-line strict-structure/no-double-cast -- Obsidian's public App doesn't expose `commands`; internal API required
      (app as unknown as AppWithCommands).commands.executeCommandById(commandId);
    },
    [app]
  );

  const handleTodo = useCallback(() => {
    const editor = getEditor();
    if (editor) {
      const lineContent = editor.getLine(editor.getCursor().line);

      // Use applyTask directly for callout-title lines because Obsidian's native
      // toggle-checklist command doesn't understand callout headers and would
      // insert the task marker before the "[!type]" bracket.
      const isOnCalloutTitleLine = CALLOUT_TITLE_WITH_CONTENT_PATTERN.test(lineContent);

      if (activeTagKeys.has(ACTIVE_TAG_KEY_TASK) || isOnCalloutTitleLine) {
        addTag(editor, { kind: 'task', taskPrefix: '' });
        return;
      }
    }
    executeCommand(EDITOR_COMMAND_TOGGLE_CHECKLIST);
  }, [getEditor, activeTagKeys, executeCommand]);

  // Uses removeCalloutByKey so clicking Important only removes the Important callout,
  // not a nested callout that happens to be innermost.
  const handleImportant = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Important')) {
      removeTag(editor, { kind: 'callout', calloutTitle: 'Important' });
      return;
    }
    addTag(editor, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' });
  }, [getEditor, activeTagKeys]);

  const handleQuestion = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Question')) {
      removeTag(editor, { kind: 'callout', calloutTitle: 'Question' });
      return;
    }
    addTag(editor, { kind: 'callout', calloutType: 'question', calloutTitle: 'Question' });
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
    toggleTag(editor, { kind: 'inline-todo' });
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
