import { useRef, useState } from "react";
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
      <div className="onr-tags-group" style={{ flex: 1 }}>
        {/* Stacked tag rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            width: "150px",
          }}
        >
          {/* To Do row */}
          <div
            className="onr-btn-sm"
            onClick={handleTodo}
            data-cmd="todo"
            title="Toggle to-do"
            style={{
              width: "150px",
              minHeight: "20px",
              flexDirection: "row",
              gap: "4px",
              padding: "1px 6px",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              style={{
                width: "13px",
                height: "13px",
                flexShrink: "0",
                fill: "none",
                stroke: "none",
              }}
            >
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#4472C4" />
              <polyline
                points="4,8 7,11 12,5"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span style={{ fontSize: "10px", color: "#222" }}>To Do</span>
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "1px solid #999",
                marginLeft: "auto",
                background: "#fff",
              }}
            />
          </div>

          {/* Important row */}
          <div
            className="onr-btn-sm"
            onClick={handleImportant}
            data-cmd="important"
            title="Mark as important"
            style={{
              width: "150px",
              minHeight: "20px",
              flexDirection: "row",
              gap: "4px",
              padding: "1px 6px",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              style={{
                width: "13px",
                height: "13px",
                flexShrink: "0",
                fill: "none",
                stroke: "none",
              }}
            >
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#F5A623" />
              <polygon
                points="8,3 9.5,6.5 13,7 10.5,9.5 11,13 8,11.5 5,13 5.5,9.5 3,7 6.5,6.5"
                fill="white"
              />
            </svg>
            <span style={{ fontSize: "10px", color: "#222" }}>Important</span>
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "1px solid #999",
                marginLeft: "auto",
                background: "#fff",
              }}
            />
          </div>

          {/* Question row */}
          <div
            className="onr-btn-sm"
            onClick={handleQuestion}
            data-cmd="question"
            title="Mark as question"
            style={{
              width: "150px",
              minHeight: "20px",
              flexDirection: "row",
              gap: "4px",
              padding: "1px 6px",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              style={{
                width: "13px",
                height: "13px",
                flexShrink: "0",
                fill: "none",
                stroke: "none",
              }}
            >
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
            <span style={{ fontSize: "10px", color: "#222" }}>Question</span>
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "1px solid #999",
                marginLeft: "auto",
                background: "#fff",
              }}
            />
          </div>
        </div>

        {/* More arrow with dropdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "64px",
            position: "relative",
          }}
        >
          <div
            ref={moreButtonRef}
            className="onr-btn-sm"
            title="More tags"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            data-cmd="more-tags"
            style={{
              width: "14px",
              minHeight: "64px",
              padding: "0",
              fontSize: "9px",
              zIndex: moreMenuOpen ? 100 : "auto",
            }}
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
        <div
          className="onr-tag-big-buttons"
          style={{ justifyContent: "flex-start" }}
        >
          <div
            className="onr-btn"
            title="Insert To Do tag"
            onClick={handleToDoTag}
            data-cmd="todo-tag"
            style={{ width: "46px", minHeight: "58px" }}
          >
            <svg className="onr-icon" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="12" y1="9" x2="12" y2="15" />
            </svg>
            <span className="onr-btn-label">To Do Tag</span>
          </div>
          <div
            className="onr-btn"
            title="Search for tags"
            onClick={handleFindTags}
            data-cmd="find-tags"
            style={{ width: "46px", minHeight: "58px" }}
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
