import './script-buttons.css';
import { useApp } from '../../../../shared/context/AppContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { toggleTagInEditor } from '../../../../shared/editor/styling-engine/editorIntegration';
import { SUBSCRIPT_TAG, SUPERSCRIPT_TAG } from '../../../../shared/editor/styling-engine/constants';

interface ScriptButtonsProps {
  subscript: boolean;
  superscript: boolean;
}

export function ScriptButtons({ subscript, superscript }: ScriptButtonsProps) {
  const app = useApp();

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleSubscript = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, SUBSCRIPT_TAG);
  };

  const handleSuperscript = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, SUPERSCRIPT_TAG);
  };

  return (
    <>
      <RibbonButton
        className="onr-format-btn onr-format-sub"
        title="Subscript"
        active={subscript}
        onClick={handleSubscript}
        data-cmd="subscript"
      >
        <span className="onr-script-symbol">
          x<sub className="onr-sub-text">2</sub>
        </span>
      </RibbonButton>

      <RibbonButton
        className="onr-format-btn onr-format-sup"
        title="Superscript"
        active={superscript}
        onClick={handleSuperscript}
        data-cmd="superscript"
      >
        <span className="onr-script-symbol">
          x<sup className="onr-sup-text">2</sup>
        </span>
      </RibbonButton>
    </>
  );
}
