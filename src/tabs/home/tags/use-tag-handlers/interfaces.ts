import type { App } from 'obsidian';
import type { CustomTag } from '../customize-modal/interfaces';

export interface TagHandlersOptions {
  app: App;
  activeTagKeys: Set<string>;
  canRemoveTag: boolean;
  setMoreMenuOpen: (open: boolean) => void;
  setCustomizeModalOpen: (open: boolean) => void;
  setCustomTags: (tags: CustomTag[]) => void;
}
