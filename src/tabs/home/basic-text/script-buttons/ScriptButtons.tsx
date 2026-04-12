import './ScriptButtons.css';
import { useApp } from '../../../../shared/context/AppContext';

export function ScriptButtons() {
  const app = useApp();

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleSubscript = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<sub>${selection}</sub>`);
  };

  const handleSuperscript = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<sup>${selection}</sup>`);
  };

  return (
    <>
      <div
        className="onr-btn-sm onr-format-btn onr-format-sub"
        title="Subscript"
        onClick={handleSubscript}
        data-cmd="subscript"
      >
        x<sub className="onr-sub-text">2</sub>
      </div>

      <div
        className="onr-btn-sm onr-format-btn onr-format-sup"
        title="Superscript"
        onClick={handleSuperscript}
        data-cmd="superscript"
      >
        x<sup className="onr-sup-text">2</sup>
      </div>
    </>
  );
}
