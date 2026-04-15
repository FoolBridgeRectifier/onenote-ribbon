import { useApp } from '../../../shared/context/AppContext';
import { TableIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

const TABLE_3X3 = `
| Col 1 | Col 2 | Col 3 |
| ----- | ----- | ----- |
|       |       |       |
|       |       |       |
`;

export function TablesGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleTable = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange(TABLE_3X3, editor.getCursor());
  };

  return (
    <GroupShell name="Tables">
      <div className="onr-tables-group">
        <RibbonButton
          size="large"
          icon={<TableIcon className="onr-icon" />}
          label="Table"
          title="Insert a 3×3 markdown table"
          onClick={handleTable}
          data-cmd="insert-table"
        />
      </div>
    </GroupShell>
  );
}
