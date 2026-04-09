import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";

export function FilesGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  // Both Attach File and Embed Note insert an embedded wikilink at the cursor
  const insertWikiEmbed = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange("![[]]", cursor);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
  };

  return (
    <GroupShell name="Files" dataGroup="Files">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="attach-file"
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
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          }
          label="Attach File"
          onClick={insertWikiEmbed}
        />
        <RibbonButton
          data-cmd="embed-note"
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
          label="Embed Note"
          onClick={insertWikiEmbed}
        />
      </div>
    </GroupShell>
  );
}
