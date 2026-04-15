import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { EmailPageIcon, MeetingDetailsIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { sendNoteByEmail } from './helpers';

export function EmailGroup() {
  const app = useApp();

  const getEditor = () => app.workspace.activeEditor?.editor;

  /**
   * Derives a plain note title from the editor's first line.
   * Strips leading heading markers (e.g. "# " or "## ") so the title is
   * suitable for use as a file name and email subject.
   */
  const getNoteTitleFromEditor = (): string => {
    const editor = getEditor();
    if (!editor) return 'Note';
    const firstLine = editor.getLine(0);
    return firstLine.replace(/^#{1,6}\s+/, '').trim() || 'Note';
  };

  /**
   * Converts the current note to a styled HTML email (with plain-text fallback),
   * writes it as an EML file to the OS temp directory, and opens it with the
   * default email client so the user can add recipients and send.
   */
  const handleEmailPage = async (): Promise<void> => {
    const editor = getEditor();
    if (!editor) return;

    const noteTitle = getNoteTitleFromEditor();
    const markdownContent = editor.getValue();

    try {
      await sendNoteByEmail(markdownContent, noteTitle);
    } catch {
      new Notice('Failed to open email. Please try again.');
    }
  };

  const handleMeetingDetails = () => {
    const editor = getEditor();
    if (!editor) return;

    const currentDate = new Date().toISOString().split('T')[0];
    const frontmatter = `---
Date: ${currentDate}
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
          title="Export as PDF and open email client"
          onClick={() => {
            void handleEmailPage();
          }}
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
