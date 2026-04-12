import { useRef, useState } from "react";
import "./TagsGroup.css";
import { useApp } from "../../../shared/context/AppContext";
import { Dropdown } from "../../../shared/components/dropdown/Dropdown";
import {
  FindTagsIcon,
  ImportantTagIcon,
  QuestionTagIcon,
  TodoTagButtonIcon,
  TodoTagIcon,
} from "../../../assets/icons";

export function TagsGroup() {
  const app = useApp();
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleTodo = () => {
    (app as any).commands.executeCommandById("editor:toggle-todo");
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
    (app as any).commands.executeCommandById("global-search:open");
    const searchBox = document.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;
    if (searchBox) {
      searchBox.value = "#";
      searchBox.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const handleToDoTag = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`#todo ${selection}`);
  };

  return (
    <div className="onr-group">
      <div className="onr-tags-group">
        {/* Stacked tag rows */}
        <div className="onr-tags-stack">
          {/* To Do row */}
          <div
            className="onr-btn-sm onr-tag-row"
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
          </div>

          {/* Important row */}
          <div
            className="onr-btn-sm onr-tag-row"
            onClick={handleImportant}
            data-cmd="important"
            title="Mark as important"
          >
            <ImportantTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">Important</span>
            <div className="onr-tag-swatch" />
          </div>

          {/* Question row */}
          <div
            className="onr-btn-sm onr-tag-row"
            onClick={handleQuestion}
            data-cmd="question"
            title="Mark as question"
          >
            <QuestionTagIcon className="onr-tag-icon" />
            <span className="onr-tag-label">Question</span>
            <div className="onr-tag-swatch" />
          </div>
        </div>

        {/* More arrow with dropdown */}
        <div className="onr-tags-more">
          <div
            ref={moreButtonRef}
            className="onr-btn-sm onr-more-arrow"
            title="More tags"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            data-cmd="more-tags"
          >
            ▾
          </div>
          {moreMenuOpen && moreButtonRef.current && (
            <Dropdown
              anchor={moreButtonRef.current}
              items={[
                {
                  label: "Quote",
                  onClick: () => {
                    setMoreMenuOpen(false);
                  },
                },
                {
                  label: "Code",
                  onClick: () => {
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
          <div
            className="onr-btn onr-tag-btn"
            title="Insert To Do tag"
            onClick={handleToDoTag}
            data-cmd="todo-tag"
          >
            <TodoTagButtonIcon className="onr-icon" />
            <span className="onr-btn-label">To Do Tag</span>
          </div>
          <div
            className="onr-btn onr-tag-btn"
            title="Search for tags"
            onClick={handleFindTags}
            data-cmd="find-tags"
          >
            <FindTagsIcon className="onr-icon" />
            <span className="onr-btn-label">Find Tags</span>
          </div>
        </div>
      </div>
      <div className="onr-group-name">Tags</div>
    </div>
  );
}
