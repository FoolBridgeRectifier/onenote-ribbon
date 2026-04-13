import { useApp } from '../../../shared/context/AppContext';
import { EmailPageIcon, MeetingDetailsIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

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
    <GroupShell name="Email &amp; Meetings">
      <div className="onr-email-group">
        <RibbonButton
          size="large"
          icon={<EmailPageIcon className="onr-icon" />}
          label="Email Page"
          title="Copy as formatted text"
          onClick={handleEmailPage}
          data-cmd="email-page"
        />
        <RibbonButton
          size="large"
          icon={<MeetingDetailsIcon className="onr-icon" />}
          label="Meeting Details"
          title="Insert meeting template"
          onClick={handleMeetingDetails}
          data-cmd="meeting-details"
        />
      </div>
    </GroupShell>
  );
}
