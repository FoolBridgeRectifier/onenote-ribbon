import { useApp } from '../../../shared/context/AppContext';
import { AddCardIcon, AddNoteIcon, GroupNodesIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function CanvasGroup() {
  const app = useApp();

  const handleAddCard = () => {
    (app as any).commands.executeCommandById('canvas:create-node');
  };

  const handleAddNote = () => {
    (app as any).commands.executeCommandById('canvas:create-node-from-selection');
  };

  const handleGroup = () => {
    (app as any).commands.executeCommandById('canvas:group-selection');
  };

  return (
    <GroupShell name="Canvas">
      <div className="onr-canvas-group">
        <RibbonButton
          size="large"
          icon={<AddCardIcon className="onr-icon" />}
          label="Add Card"
          title="Add a card node to canvas"
          onClick={handleAddCard}
          data-cmd="canvas-add-card"
        />
        <RibbonButton
          size="large"
          icon={<AddNoteIcon className="onr-icon" />}
          label="Add Note"
          title="Add a note node to canvas"
          onClick={handleAddNote}
          data-cmd="canvas-add-note"
        />
        <RibbonButton
          size="large"
          icon={<GroupNodesIcon className="onr-icon" />}
          label="Group"
          title="Group selected canvas nodes"
          onClick={handleGroup}
          data-cmd="canvas-group"
        />
      </div>
    </GroupShell>
  );
}
