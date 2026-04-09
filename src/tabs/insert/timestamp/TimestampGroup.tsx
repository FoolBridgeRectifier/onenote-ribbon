import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";

function formatCurrentDate(): string {
  const momentLib = (window as any).moment;
  if (momentLib) return momentLib().format("YYYY-MM-DD");
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatCurrentTime(): string {
  const momentLib = (window as any).moment;
  if (momentLib) return momentLib().format("HH:mm");
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function TimestampGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const insertDate = () => {
    const editor = getEditor();
    if (editor) editor.replaceRange(formatCurrentDate(), editor.getCursor());
  };

  const insertTime = () => {
    const editor = getEditor();
    if (editor) editor.replaceRange(formatCurrentTime(), editor.getCursor());
  };

  const insertDateTime = () => {
    const editor = getEditor();
    if (editor)
      editor.replaceRange(
        `${formatCurrentDate()} ${formatCurrentTime()}`,
        editor.getCursor(),
      );
  };

  return (
    <GroupShell name="Time Stamp" dataGroup="Time Stamp">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="insert-date"
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label="Date"
          onClick={insertDate}
        />
        <RibbonButton
          data-cmd="insert-time"
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Time"
          onClick={insertTime}
        />
        <RibbonButton
          data-cmd="insert-datetime"
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
              <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
              <path d="M16 2v4M8 2v4M3 10h5" />
              <circle cx="17.5" cy="17.5" r="4.5" />
              <polyline points="17.5 15.5 17.5 17.5 19 18.5" />
            </svg>
          }
          label="Date & Time"
          onClick={insertDateTime}
        />
      </div>
    </GroupShell>
  );
}
