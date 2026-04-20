import { useApp } from '../../../../shared/context/AppContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { toggleTagInEditor } from '../../../../shared/editor/styling-engine/editor-integration/helpers';
import { SUBSCRIPT_TAG, SUPERSCRIPT_TAG } from '../../../../shared/editor/styling-engine/constants';
import type { ScriptButtonsProps } from './interfaces';

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
        x₂
      </RibbonButton>

      <RibbonButton
        className="onr-format-btn onr-format-sup"
        title="Superscript"
        active={superscript}
        onClick={handleSuperscript}
        data-cmd="superscript"
      >
        x²
      </RibbonButton>
    </>
  );
}
