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
import { applyTag } from './tag-apply/applyTag';
import { removeActiveCallout } from './tag-apply/removeActiveCallout';
import { removeActiveCheckbox } from './tag-apply/removeActiveCheckbox';
import { toggleInlineTodoTag } from './tag-apply/toggleInlineTodoTag';
import { isTagSeparator, isTagGroupHeader } from './interfaces';
import type { TagDefinition, TagOrSeparator } from './interfaces';
import { ALL_TAGS } from './tags-data';
import {
  ACTIVE_TAG_KEY_HIGHLIGHT,
  ACTIVE_TAG_KEY_TASK,
  EDITOR_COMMAND_TOGGLE_CHECKLIST,
  STORAGE_KEY_CUSTOM_TAGS,
} from './constants';
import { useActiveTagKeys } from './use-active-tag-keys/useActiveTagKeys';
import type { CustomTag } from './customize-modal/interfaces';
import { CustomizeTagsModal } from './customize-modal/CustomizeTagsModal';

/** Obsidian App with commands API. */
interface AppWithCommands {
  commands: {
    executeCommandById(commandId: string): void;
  };
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadCustomTags(): CustomTag[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_TAGS);
    return stored ? (JSON.parse(stored) as CustomTag[]) : [];
  } catch {
    return [];
  }
}

function saveCustomTags(tags: CustomTag[]): void {
  localStorage.setItem(STORAGE_KEY_CUSTOM_TAGS, JSON.stringify(tags));
}

// ── Custom tag → TagDefinition conversion ─────────────────────────────────────

function buildCustomTagDefinition(customTag: CustomTag): TagDefinition {
  // Checkbox-type custom tags create a task line instead of a callout block
  const isCheckbox = customTag.calloutType === 'checkbox';

  return {
    label: customTag.name,
    // Dynamic background on a tiny icon — inline style is appropriate here since
    // the color is a runtime value chosen by the user, not a static class.
    icon: (
      <span
        className="onr-tag-custom-icon"
        style={{ backgroundColor: customTag.color }}
        aria-hidden="true"
      />
    ),
    swatchColor: customTag.color,
    action: isCheckbox
      ? { type: 'task', taskPrefix: `${customTag.name}:` }
      : {
          type: 'callout',
          calloutType: customTag.calloutType,
          calloutTitle: customTag.name,
        },
    calloutKey: isCheckbox ? `task-prefix:${customTag.name}:` : customTag.name,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TagsGroup() {
  const app = useApp();
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState<CustomTag[]>(loadCustomTags);

  const activeTagKeys = useActiveTagKeys(app);

  // "Remove Tag" is only enabled when cursor is inside a real callout block
  // (i.e. an active key that is not a sentinel or task-prefix value)
  const canRemoveTag = [...activeTagKeys].some(
    (key) =>
      key !== ACTIVE_TAG_KEY_TASK &&
      key !== ACTIVE_TAG_KEY_HIGHLIGHT &&
      !key.startsWith('task-prefix:')
  );

  // Build the displayed tag list by merging custom tags before the footer items
  const allDisplayedTags = useMemo((): TagOrSeparator[] => {
    if (customTags.length === 0) return ALL_TAGS;

    // The last 3 entries of ALL_TAGS are: separator | Customize Tags | Remove Tag
    const footerItems = ALL_TAGS.slice(-3);
    const mainItems = ALL_TAGS.slice(0, -3);

    return [
      ...mainItems,
      { isSeparator: true as const },
      ...customTags.map(buildCustomTagDefinition),
      ...footerItems,
    ];
  }, [customTags]);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const executeCommand = (commandId: string) => {
    (app as unknown as AppWithCommands).commands.executeCommandById(commandId);
  };

  const handleTodo = () => {
    const editor = getEditor();

    if (editor && activeTagKeys.has(ACTIVE_TAG_KEY_TASK)) {
      removeActiveCheckbox(editor);
      return;
    }

    executeCommand(EDITOR_COMMAND_TOGGLE_CHECKLIST);
  };

  const handleImportant = () => {
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
  };

  const handleQuestion = () => {
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
  };

  const handleFindTags = () => {
    executeCommand('global-search:open');
    const searchInputElement = document.querySelector(
      'input[placeholder*="Search"]'
    ) as HTMLInputElement | null;
    if (searchInputElement) {
      searchInputElement.value = '#';
      searchInputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Insert the literal #todo text — no selection wrapping
  const handleToDoTag = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleInlineTodoTag(editor);
  };

  const handleCustomTagsChange = (updatedTags: CustomTag[]) => {
    saveCustomTags(updatedTags);
    setCustomTags(updatedTags);
  };

  const handleTagDropdownSelect = (tagDefinition: TagDefinition) => {
    // Open the customize modal — don't close the dropdown yet (modal replaces it)
    if (tagDefinition.isCustomizeTags) {
      setCustomizeModalOpen(true);
      setMoreMenuOpen(false);
      return;
    }

    // Remove the active callout/tag from the current line
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
        (tagDefinition.action.type === 'command' &&
          tagDefinition.calloutKey === ACTIVE_TAG_KEY_TASK))
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
  };

  return (
    <GroupShell name="Tags">
      <div className="onr-tags-group">
        {/* Three visible tag rows pinned to the ribbon surface */}
        <div className="onr-tags-stack">
          <RibbonButton
            className="onr-tag-row"
            onClick={handleTodo}
            data-cmd="todo"
            title="Toggle to-do"
          >
            <TodoTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">To Do</span>
            {/* Visual-only checkbox — indicates whether cursor is on a task line */}
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

        {/* Narrow accordion trigger — opens the full OneNote tag list */}
        <div className="onr-tags-more">
          <RibbonButton
            ref={moreButtonRef}
            className="onr-more-arrow"
            title="More tags"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            data-cmd="more-tags"
          >
            ▾
          </RibbonButton>

          {moreMenuOpen && moreButtonRef.current && (
            <Dropdown
              anchor={moreButtonRef.current}
              className="onr-tags-dropdown"
              onClose={() => setMoreMenuOpen(false)}
            >
              {allDisplayedTags.map((tagOrSeparator, index) => {
                if (isTagSeparator(tagOrSeparator)) {
                  return <div key={index} className="onr-tags-dd-separator" />;
                }

                if (isTagGroupHeader(tagOrSeparator)) {
                  return (
                    <div key={index} className="onr-tags-dd-group-header">
                      {tagOrSeparator.groupLabel}
                    </div>
                  );
                }

                const tagDefinition = tagOrSeparator;
                const dataCommand = `tag-${tagDefinition.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                // "Remove Tag" disabled state is dynamic — depends on active callout
                const isEffectivelyDisabled =
                  tagDefinition.isDisabled || (tagDefinition.isRemoveTag && !canRemoveTag);

                // Whether this tag is currently active at the cursor
                const isChecked =
                  tagDefinition.calloutKey !== null &&
                  tagDefinition.calloutKey !== undefined &&
                  activeTagKeys.has(tagDefinition.calloutKey);

                // Footer items ("Customize Tags…", "Remove Tag") don't get a checkbox
                const showCheckbox = !tagDefinition.isCustomizeTags && !tagDefinition.isRemoveTag;

                return (
                  <div
                    key={index}
                    className={
                      isEffectivelyDisabled
                        ? 'onr-tags-dd-item onr-tags-dd-item--disabled'
                        : 'onr-tags-dd-item'
                    }
                    onClick={() => handleTagDropdownSelect(tagDefinition)}
                    data-cmd={dataCommand}
                    title={tagDefinition.label}
                  >
                    {/* Small colored tag icon */}
                    <span className="onr-tags-dd-icon">{tagDefinition.icon}</span>

                    {/* Tag label text */}
                    <span className="onr-tags-dd-label">{tagDefinition.label}</span>

                    {/* Right-side checkbox: checked when cursor is inside this tag type */}
                    {showCheckbox && (
                      <span
                        className={
                          isChecked ? 'onr-tags-dd-cb onr-tags-dd-cb--checked' : 'onr-tags-dd-cb'
                        }
                        aria-hidden="true"
                      />
                    )}
                  </div>
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

      {/* Customize Tags modal — rendered as a portal over the full page */}
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
