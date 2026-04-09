import { useApp } from '../../../shared/context/AppContext';
import { RibbonButton } from '../../../shared/components/RibbonButton';

export function BlankLineButton() {
  const app = useApp();

  const handleClick = () => {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange('\n', cursor);
  };

  return (
    <RibbonButton
      data-cmd="blank-line"
      className="onr-btn"
      icon={
        <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      }
      label="Blank Line"
      onClick={handleClick}
    />
  );
}
