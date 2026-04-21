import type { App, Editor } from 'obsidian';
import type { CustomTag } from '../customize-modal/interfaces';
import type { TagDefinition } from '../interfaces';

/** Options passed to the useTagHandlers hook. */
export interface TagHandlersOptions {
  app: App;
  activeTagKeys: Set<string>;
  canRemoveTag: boolean;
  setMoreMenuOpen: (open: boolean) => void;
  setCustomizeModalOpen: (open: boolean) => void;
  setCustomTags: (tags: CustomTag[]) => void;
}

/** Return type of the useTagHandlers hook. */
export interface TagHandlers {
  handleTodo: () => void;
  handleImportant: () => void;
  handleQuestion: () => void;
  handleFindTags: () => void;
  handleToDoTag: () => void;
  handleCustomTagsChange: (updatedTags: CustomTag[]) => void;
  handleTagDropdownSelect: (tagDefinition: TagDefinition) => void;
}

/** Context passed to selectTagFromDropdown with all required state and callbacks. */
export interface TagDropdownSelectContext {
  getEditor: () => Editor | undefined;
  activeTagKeys: Set<string>;
  canRemoveTag: boolean;
  executeCommand: (commandId: string) => void;
  setMoreMenuOpen: (open: boolean) => void;
  setCustomizeModalOpen: (open: boolean) => void;
}
