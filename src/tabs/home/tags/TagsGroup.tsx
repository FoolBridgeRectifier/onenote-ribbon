import { useRef, useState } from 'react';

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
import { isTagSeparator } from './interfaces';
import type { TagDefinition } from './interfaces';
import { ALL_TAGS } from './tags-data';
import { EDITOR_COMMAND_TOGGLE_CHECKLIST } from './constants';

export function TagsGroup() {
  const app = useApp();
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const executeCommand = (commandId: string) => {
    (app as any).commands.executeCommandById(commandId);
  };

  const handleTodo = () => {
    executeCommand(EDITOR_COMMAND_TOGGLE_CHECKLIST);
  };

  const handleImportant = () => {
    const editor = getEditor();
    if (!editor) return;
    applyTag(editor as any, { type: 'callout', calloutType: 'important' }, executeCommand);
  };

  const handleQuestion = () => {
    const editor = getEditor();
    if (!editor) return;
    applyTag(editor as any, { type: 'callout', calloutType: 'question' }, executeCommand);
  };

  const handleFindTags = () => {
    executeCommand('global-search:open');
    const searchInputElement = document.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement | null;
    if (searchInputElement) {
      searchInputElement.value = '#';
      searchInputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleToDoTag = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`#todo ${selection}`);
  };

  const handleTagDropdownSelect = (tagDefinition: TagDefinition) => {
    if (tagDefinition.isDisabled) return;

    const editor = getEditor();
    applyTag(editor as any, tagDefinition.action, executeCommand);
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
            {/*
             * Colored SVG icon — fill/stroke none on the element prevents
             * the global SVG stroke rule from overriding the internal fills.
             */}
            <TodoTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">To Do</span>
            <div className="onr-tag-swatch" />
          </RibbonButton>

          <RibbonButton
            className="onr-tag-row"
            onClick={handleImportant}
            data-cmd="important"
            title="Mark as important"
          >
            <ImportantTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">Important</span>
            <div className="onr-tag-swatch" />
          </RibbonButton>

          <RibbonButton
            className="onr-tag-row"
            onClick={handleQuestion}
            data-cmd="question"
            title="Mark as question"
          >
            <QuestionTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">Question</span>
            <div className="onr-tag-swatch" />
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
              {ALL_TAGS.map((tagOrSeparator, index) => {
                if (isTagSeparator(tagOrSeparator)) {
                  return <div key={index} className="onr-tags-dd-separator" />;
                }

                const tagDefinition = tagOrSeparator;
                const dataCommand = `tag-${tagDefinition.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                return (
                  <div
                    key={index}
                    className={
                      tagDefinition.isDisabled
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

                    {/* Right-side category color swatch */}
                    {tagDefinition.swatchColor !== 'transparent' && (
                      <span
                        className="onr-tags-dd-swatch"
                        style={{ backgroundColor: tagDefinition.swatchColor }}
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
            title="Insert To Do tag"
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
    </GroupShell>
  );
}
