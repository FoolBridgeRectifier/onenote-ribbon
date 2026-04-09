import { Notice } from "obsidian";

import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";

export function EmailGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const emailPage = () => {
    const content = getEditor()?.getValue() ?? "";
    navigator.clipboard
      .writeText(content)
      .then(() => new Notice("Page content copied to clipboard"));
  };

  const insertMeetingDetails = () => {
    const editor = getEditor();
    if (!editor) return;
    const currentDate = new Date();
    const template = `---\nDate: ${currentDate.toLocaleDateString()}\nTime: ${currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\nAttendees: \nAgenda: \n---\n\n`;
    editor.replaceRange(template, editor.getCursor());
  };

  return (
    <GroupShell name="Email" dataGroup="Email">
      <RibbonButton
        label="📧 Email Page"
        data-cmd="email-page"
        onClick={emailPage}
      />
      <RibbonButton
        label="📋 Meeting Details"
        data-cmd="meeting-details"
        onClick={insertMeetingDetails}
      />
    </GroupShell>
  );
}
