import { useApp } from '../../../shared/context/AppContext';
import { InsertImageIcon, VideoIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function ImagesGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleImage = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('![alt text](image.png)', editor.getCursor());
  };

  const handleVideo = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('![video](video.mp4)', editor.getCursor());
  };

  return (
    <GroupShell name="Media">
      <div className="onr-images-group">
        <RibbonButton
          size="large"
          icon={<InsertImageIcon className="onr-icon" />}
          label="Image"
          title="Insert image"
          onClick={handleImage}
          data-cmd="insert-image"
        />
        <RibbonButton
          size="large"
          icon={<VideoIcon className="onr-icon" />}
          label="Video"
          title="Insert video embed"
          onClick={handleVideo}
          data-cmd="insert-video"
        />
      </div>
    </GroupShell>
  );
}
