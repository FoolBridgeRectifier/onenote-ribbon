import { useApp } from '../../../shared/context/AppContext';
import { EmailPageIcon, MeetingDetailsIcon } from '../../../assets/icons';

export function EmailGroup() {
  const app = useApp();

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleEmailPage = () => {
    const editor = getEditor();
    if (!editor) return;

    const content = editor.getValue();
    const plainText = content
      .replace(/#+\s/g, '')
      .replace(/[*_]/g, '')
      .replace(/~~([^~]+)~~/g, '$1');

    navigator.clipboard.writeText(plainText);
  };

  const handleMeetingDetails = () => {
    const editor = getEditor();
    if (!editor) return;

    const frontmatter = `---
Date: ${new Date().toISOString().split('T')[0]}
Time:
Attendees:
Agenda:
---

`;

    editor.setValue(frontmatter + editor.getValue());
  };

  return (
    <div className="onr-group">
      <div className="onr-email-group">
        <div
          className="onr-btn"
          title="Copy as formatted text"
          onClick={handleEmailPage}
          data-cmd="email-page"
        >
          <EmailPageIcon className="onr-icon" />
          <span className="onr-btn-label">Email Page</span>
        </div>
        <div
          className="onr-btn"
          title="Insert meeting template"
          onClick={handleMeetingDetails}
          data-cmd="meeting-details"
        >
          <MeetingDetailsIcon className="onr-icon" />
          <span className="onr-btn-label">Meeting Details</span>
        </div>
      </div>
      <div className="onr-group-name">Email &amp; Meetings</div>
    </div>
  );
}
