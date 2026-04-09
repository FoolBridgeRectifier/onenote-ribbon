import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";

export function TablesGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const insertTable = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange(
      "\n| col | col | col |\n|---|---|---|\n| | | |\n",
      cursor,
    );
  };

  return (
    <GroupShell name="Tables" dataGroup="Tables">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="insert-table"
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
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
          }
          label="Table"
          onClick={insertTable}
        />
      </div>
    </GroupShell>
  );
}
