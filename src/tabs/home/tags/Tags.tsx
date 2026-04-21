import { useMemo, useRef, useState } from 'react';

import './tags-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { useEditorState } from '../../../shared/hooks/useEditorState';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { Dropdown } from '../../../shared/components/dropdown/Dropdown';
import { FindTagsIcon, TodoTagButtonIcon } from '../../../assets/icons';
import type { TagOrSeparator } from './interfaces';
import { ALL_TAGS, renderTagItems } from './helpers';
import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from './constants';
import type { CustomTag } from './customize-modal/interfaces';
import { CustomizeTagsModal } from './customize-modal/CustomizeModal';
import { loadCustomTags, buildCustomTagDefinition } from './tag-storage/TagStorage';
import { useTagHandlers } from './use-tag-handlers/UseTagHandlers';
import { TagStack } from './tag-stack/TagStack';

export function TagsGroup() {
  const app = useApp();
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState<CustomTag[]>(loadCustomTags);

  const editorState = useEditorState(app);
  const activeTagKeys = editorState.activeTagKeys;

  // "Remove Tag" is only enabled when cursor is inside a real callout block
  const canRemoveTag = [...activeTagKeys].some(
    (key) =>
      key !== ACTIVE_TAG_KEY_TASK &&
      key !== ACTIVE_TAG_KEY_HIGHLIGHT &&
      !key.startsWith('task-prefix:')
  );

  // Build the displayed tag list by merging custom tags before the footer items
  const allDisplayedTags = useMemo((): TagOrSeparator[] => {
    if (customTags.length === 0) return ALL_TAGS;
    const footerItems = ALL_TAGS.slice(-3);
    const mainItems = ALL_TAGS.slice(0, -3);
    return [
      ...mainItems,
      { isSeparator: true as const },
      ...customTags.map(buildCustomTagDefinition),
      ...footerItems,
    ];
  }, [customTags]);

  const {
    handleTodo,
    handleImportant,
    handleQuestion,
    handleFindTags,
    handleToDoTag,
    handleCustomTagsChange,
    handleTagDropdownSelect,
  } = useTagHandlers({
    app,
    activeTagKeys,
    canRemoveTag,
    setMoreMenuOpen,
    setCustomizeModalOpen,
    setCustomTags,
  });

  return (
    <GroupShell name="Tags">
      <div className="onr-tags-group">
        <TagStack
          activeTagKeys={activeTagKeys}
          handleTodo={handleTodo}
          handleImportant={handleImportant}
          handleQuestion={handleQuestion}
        />

        {/* Narrow accordion trigger: opens the full OneNote tag list */}
        <div className="onr-tags-more">
          <RibbonButton
            ref={moreButtonRef}
            className="onr-more-arrow"
            title="More tags"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            data-cmd="more-tags"
          >
            ?
          </RibbonButton>

          {moreMenuOpen && moreButtonRef.current && (
            <Dropdown
              anchor={moreButtonRef.current}
              className="onr-tags-dropdown"
              onClose={() => setMoreMenuOpen(false)}
            >
              {renderTagItems(
                allDisplayedTags,
                activeTagKeys,
                canRemoveTag,
                handleTagDropdownSelect
              )}
            </Dropdown>
          )}
        </div>

        {/* Big buttons: To Do Tag + Find Tags */}
        <div className="onr-tag-big-buttons">
          <RibbonButton
            size="large"
            className="onr-tag-btn"
            icon={<TodoTagButtonIcon className="onr-icon" />}
            label="To Do Tag"
            title="Insert #todo tag"
            onClick={handleToDoTag}
            data-cmd="todo-tag"
          />
          <RibbonButton
            size="large"
            className="onr-tag-btn"
            icon={<FindTagsIcon className="onr-icon" />}
            label="Find Tags"
            title="Search for tags"
            onClick={handleFindTags}
            data-cmd="find-tags"
          />
        </div>
      </div>

      {/* Customize Tags modal: rendered as a portal over the full page */}
      {customizeModalOpen && (
        <CustomizeTagsModal
          customTags={customTags}
          onChange={handleCustomTagsChange}
          onClose={() => setCustomizeModalOpen(false)}
        />
      )}
    </GroupShell>
  );
}
