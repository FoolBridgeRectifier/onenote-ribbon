import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';

export function ImagesGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const insertImage = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange('![[]]', cursor);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
  };

  const insertVideo = () => {
    const editor = getEditor();
    if (!editor) return;
    const template = '\n<iframe src="" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n';
    editor.replaceRange(template, editor.getCursor());
  };

  return (
    <GroupShell name="Images" dataGroup="Images">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="insert-image"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          }
          label="Image"
          onClick={insertImage}
        />
        <RibbonButton
          data-cmd="insert-video"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          }
          label="Video"
          onClick={insertVideo}
        />
      </div>
    </GroupShell>
  );
}
