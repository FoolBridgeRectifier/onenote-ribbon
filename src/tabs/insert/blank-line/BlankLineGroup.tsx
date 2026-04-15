import { useApp } from '../../../shared/context/AppContext';
import { BlankLineIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function BlankLineGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBlankLine = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange('\n', { line: cursor.line, ch: editor.getLine(cursor.line).length });
  };

  return (
    <GroupShell name="Insert">
      <div className="onr-blank-line-group">
        <RibbonButton
          size="large"
          icon={<BlankLineIcon className="onr-icon" />}
          label="Blank Line"
          title="Insert a blank line below cursor"
          onClick={handleBlankLine}
          data-cmd="insert-blank-line"
        />
      </div>
    </GroupShell>
  );
}
