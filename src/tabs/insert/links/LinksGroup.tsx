import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";

export function LinksGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const insertMarkdownLink = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    const cursor = editor.getCursor();
    if (selection) {
      editor.replaceSelection(`[${selection}]()`);
      const newCursor = editor.getCursor();
      editor.setCursor({ line: newCursor.line, ch: newCursor.ch - 1 });
    } else {
      editor.replaceRange("[]()", cursor);
      editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
    }
  };

  const insertWikilink = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange("[[]]", cursor);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
  };

  return (
    <GroupShell name="Links" dataGroup="Links">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="insert-link"
          className="onr-btn"
          icon={
            <svg
              className="onr-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
          label="Link"
          onClick={insertMarkdownLink}
        />
        <RibbonButton
          data-cmd="insert-wikilink"
          className="onr-btn"
          icon={
            <svg
              className="onr-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M2 15h10" />
              <path d="M9 12l3 3-3 3" />
            </svg>
          }
          label="[[Wikilink]]"
          onClick={insertWikilink}
        />
      </div>
    </GroupShell>
  );
}
