import { useMemo, useRef, useState } from 'react';

import './tags-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { Dropdown } from '../../../shared/components/dropdown/Dropdown';
import {
  FindTagsIcon,
  ImportantTagIcon,
  QuestionTagIcon,
  TodoTagButtonIcon,
  TodoTagIcon,
} from '../../../assets/icons';
import { isTagSeparator, isTagGroupHeader } from './interfaces';
import type { TagOrSeparator } from './interfaces';
import { ALL_TAGS } from './helpers';
import { ACTIVE_TAG_KEY_HIGHLIGHT, ACTIVE_TAG_KEY_TASK } from './constants';
import { useActiveTagKeys } from './use-active-tag-keys/UseActiveTagKeys';
import type { CustomTag } from './customize-modal/interfaces';
import { CustomizeTagsModal } from './customize-modal/CustomizeModal';
import { loadCustomTags, buildCustomTagDefinition } from './tag-storage/TagStorage';
import { TagDropdownItem } from './tag-dropdown-item/TagDropdownItem';
import { useTagHandlers } from './use-tag-handlers/UseTagHandlers';

export function TagsGroup() {
  const app = useApp();
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState<CustomTag[]>(loadCustomTags);

  const activeTagKeys = useActiveTagKeys(app);

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
        <div className="onr-tags-stack">
          <RibbonButton
            className="onr-tag-row"
            onClick={handleTodo}
            data-cmd="todo"
            title="Toggle to-do"
          >
            <TodoTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">To Do</span>
            {/* Visual-only checkbox: indicates whether cursor is on a task line */}
            <span
              className={
                activeTagKeys.has(ACTIVE_TAG_KEY_TASK)
                  ? 'onr-tag-cb onr-tag-cb--checked'
                  : 'onr-tag-cb'
              }
              aria-hidden="true"
            />
          </RibbonButton>

          <RibbonButton
            className="onr-tag-row"
            onClick={handleImportant}
            data-cmd="important"
            title="Mark as important"
          >
            <ImportantTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">Important</span>
            <span
              className={
                activeTagKeys.has('Important') ? 'onr-tag-cb onr-tag-cb--checked' : 'onr-tag-cb'
              }
              aria-hidden="true"
            />
          </RibbonButton>

          <RibbonButton
            className="onr-tag-row"
            onClick={handleQuestion}
            data-cmd="question"
            title="Mark as question"
          >
            <QuestionTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">Question</span>
            <span
              className={
                activeTagKeys.has('Question') ? 'onr-tag-cb onr-tag-cb--checked' : 'onr-tag-cb'
              }
              aria-hidden="true"
            />
          </RibbonButton>
        </div>

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
              {allDisplayedTags.map((tagOrSeparator, index) => {
                if (isTagSeparator(tagOrSeparator))
                  return <div key={index} className="onr-tags-dd-separator" />;
                if (isTagGroupHeader(tagOrSeparator))
                  return (
                    <div key={index} className="onr-tags-dd-group-header">
                      {tagOrSeparator.groupLabel}
                    </div>
                  );

                const tagDefinition = tagOrSeparator;
                // "Remove Tag" disabled state depends on whether cursor is in an active callout
                const isEffectivelyDisabled =
                  tagDefinition.isDisabled || (tagDefinition.isRemoveTag && !canRemoveTag);
                // Whether this tag is currently active at the cursor
                const isChecked =
                  tagDefinition.calloutKey !== null &&
                  tagDefinition.calloutKey !== undefined &&
                  activeTagKeys.has(tagDefinition.calloutKey);

                return (
                  <TagDropdownItem
                    key={index}
                    tagDefinition={tagDefinition}
                    isDisabled={isEffectivelyDisabled}
                    isChecked={isChecked}
                    onSelect={handleTagDropdownSelect}
                  />
                );
              })}
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
