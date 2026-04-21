import type { App } from 'obsidian';
import type { CustomTag } from '../../../../tabs/home/tags/customize-modal/interfaces';
import type { TagDefinition } from '../../../../tabs/home/tags/interfaces';

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
