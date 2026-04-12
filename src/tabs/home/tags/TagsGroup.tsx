import { useRef, useState } from "react";
import "./TagsGroup.css";
import { useApp } from "../../../shared/context/AppContext";
import { Dropdown } from "../../../shared/components/Dropdown";

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
            <svg viewBox="0 0 16 16" className="onr-tag-icon">
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#4472C4" />
              <polyline
                points="4,8 7,11 12,5"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
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
            <svg viewBox="0 0 16 16" className="onr-tag-icon">
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#F5A623" />
              <polygon
                points="8,3 9.5,6.5 13,7 10.5,9.5 11,13 8,11.5 5,13 5.5,9.5 3,7 6.5,6.5"
                fill="white"
              />
            </svg>
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
            <svg viewBox="0 0 16 16" className="onr-tag-icon">
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#7030A0" />
              <text
                x="8"
                y="12"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                ?
              </text>
            </svg>
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
            <svg className="onr-icon" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="12" y1="9" x2="12" y2="15" />
            </svg>
            <span className="onr-btn-label">To Do Tag</span>
          </div>
          <div
            className="onr-btn onr-tag-btn"
            title="Search for tags"
            onClick={handleFindTags}
            data-cmd="find-tags"
          >
            <svg className="onr-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span className="onr-btn-label">Find Tags</span>
          </div>
        </div>
      </div>
      <div className="onr-group-name">Tags</div>
    </div>
  );
}
