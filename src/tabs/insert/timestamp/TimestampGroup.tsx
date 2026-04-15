import { useApp } from '../../../shared/context/AppContext';
import { DateIcon, TimeIcon, DateTimeIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function TimestampGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleDate = () => {
    const editor = getEditor();
    if (!editor) return;
    const now = new Date();
    editor.replaceRange(now.toISOString().slice(0, 10), editor.getCursor());
  };

  const handleTime = () => {
    const editor = getEditor();
    if (!editor) return;
    const now = new Date();
    editor.replaceRange(now.toTimeString().slice(0, 5), editor.getCursor());
  };

  const handleDateTime = () => {
    const editor = getEditor();
    if (!editor) return;
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);
    editor.replaceRange(`${date} ${time}`, editor.getCursor());
  };

  return (
    <GroupShell name="Timestamp">
      <div className="onr-timestamp-group">
        <RibbonButton
          size="large"
          icon={<DateIcon className="onr-icon" />}
          label="Date"
          title="Insert today's date (YYYY-MM-DD)"
          onClick={handleDate}
          data-cmd="insert-date"
        />
        <RibbonButton
          size="large"
          icon={<TimeIcon className="onr-icon" />}
          label="Time"
          title="Insert current time (HH:MM)"
          onClick={handleTime}
          data-cmd="insert-time"
        />
        <RibbonButton
          size="large"
          icon={<DateTimeIcon className="onr-icon" />}
          label="Date &amp; Time"
          title="Insert current date and time"
          onClick={handleDateTime}
          data-cmd="insert-datetime"
        />
      </div>
    </GroupShell>
  );
}
