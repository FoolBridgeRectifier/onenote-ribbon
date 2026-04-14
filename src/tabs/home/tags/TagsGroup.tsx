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

export function TagsGroup() {
  const app = useApp();
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleTodo = () => {
    (app as any).commands.executeCommandById('editor:toggle-checklist-status');
  };

  const handleImportant = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.setLine(
      cursor.line,
      `> [!important]\n> ${editor.getLine(cursor.line)}`,
    );
  };

  const handleQuestion = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.setLine(
      cursor.line,
      `> [!question]\n> ${editor.getLine(cursor.line)}`,
    );
  };

  const handleFindTags = () => {
    (app as any).commands.executeCommandById('global-search:open');
    const searchBox = document.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;
    if (searchBox) {
      searchBox.value = '#';
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleToDoTag = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`#todo ${selection}`);
  };

  return (
    <GroupShell name="Tags">
      <div className="onr-tags-group">
        {/* Stacked tag rows */}
        <div className="onr-tags-stack">
          {/* To Do row */}
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

          {/* Important row */}
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

          {/* Question row */}
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

        {/* More arrow with dropdown */}
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
              items={[
                {
                  label: 'Quote',
                  onClick: () => {
                    (app as any).commands.executeCommandById('editor:toggle-blockquote');
                    setMoreMenuOpen(false);
                  },
                },
                {
                  label: 'Code',
                  onClick: () => {
                    (app as any).commands.executeCommandById('editor:toggle-code');
                    setMoreMenuOpen(false);
                  },
                },
              ]}
              onClose={() => setMoreMenuOpen(false)}
            />
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
