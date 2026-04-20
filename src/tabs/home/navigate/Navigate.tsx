import { useApp } from '../../../shared/context/AppContext';
import type { AppWithCommands } from '../../../shared/context/interfaces';
import { FoldAllIcon, OutlineIcon, UnfoldAllIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function NavigateGroup() {
  const app = useApp();

  const handleOutline = () => {
    (app as unknown as AppWithCommands).commands.executeCommandById('outline:open');
  };

  const handleFoldAll = () => {
    (app as unknown as AppWithCommands).commands.executeCommandById('editor:fold-all');
  };

  const handleUnfoldAll = () => {
    (app as unknown as AppWithCommands).commands.executeCommandById('editor:unfold-all');
  };

  return (
    <GroupShell name="Navigate">
      <div className="onr-navigate-group">
        <RibbonButton
          size="large"
          icon={<OutlineIcon className="onr-icon" />}
          label="Outline"
          title="Open outline panel"
          onClick={handleOutline}
          data-cmd="outline"
        />
        <RibbonButton
          size="large"
          icon={<FoldAllIcon className="onr-icon" />}
          label="Fold All"
          title="Collapse all headings"
          onClick={handleFoldAll}
          data-cmd="fold-all"
        />
        <RibbonButton
          size="large"
          icon={<UnfoldAllIcon className="onr-icon" />}
          label="Unfold All"
          title="Expand all headings"
          onClick={handleUnfoldAll}
          data-cmd="unfold-all"
        />
      </div>
    </GroupShell>
  );
}
