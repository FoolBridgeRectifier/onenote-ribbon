import './EmailGroup.css';
import { useApp } from '../../../shared/context/AppContext';

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
          <svg className="onr-icon" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="onr-btn-label">Email Page</span>
        </div>
        <div
          className="onr-btn"
          title="Insert meeting template"
          onClick={handleMeetingDetails}
          data-cmd="meeting-details"
        >
          <svg className="onr-icon" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
          </svg>
          <span className="onr-btn-label">Meeting Details</span>
        </div>
      </div>
      <div className="onr-group-name">Email &amp; Meetings</div>
    </div>
  );
}
