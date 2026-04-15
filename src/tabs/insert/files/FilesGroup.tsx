import { useApp } from '../../../shared/context/AppContext';
import { AttachFileIcon, EmbedNoteIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function FilesGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleAttachFile = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('![[attachment]]', editor.getCursor());
  };

  const handleEmbedNote = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('![[note]]', editor.getCursor());
  };

  return (
    <GroupShell name="Files">
      <div className="onr-files-group">
        <RibbonButton
          size="large"
          icon={<AttachFileIcon className="onr-icon" />}
          label="Attach File"
          title="Insert file attachment link"
          onClick={handleAttachFile}
          data-cmd="attach-file"
        />
        <RibbonButton
          size="large"
          icon={<EmbedNoteIcon className="onr-icon" />}
          label="Embed Note"
          title="Embed another note"
          onClick={handleEmbedNote}
          data-cmd="embed-note"
        />
      </div>
    </GroupShell>
  );
}
