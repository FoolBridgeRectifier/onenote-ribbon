import { useApp } from '../../../shared/context/AppContext';
import { ToggleLeftPanelIcon, ToggleRightPanelIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function SidebarsGroup() {
  const app = useApp();

  const handleToggleLeft = () => {
    (app as any).commands.executeCommandById('app:toggle-left-sidebar');
  };

  const handleToggleRight = () => {
    (app as any).commands.executeCommandById('app:toggle-right-sidebar');
  };

  return (
    <GroupShell name="Sidebars">
      <div className="onr-sidebars-group">
        <RibbonButton
          size="large"
          icon={<ToggleLeftPanelIcon className="onr-icon" />}
          label="Toggle Left"
          title="Toggle left sidebar"
          onClick={handleToggleLeft}
          data-cmd="toggle-left-sidebar"
        />
        <RibbonButton
          size="large"
          icon={<ToggleRightPanelIcon className="onr-icon" />}
          label="Toggle Right"
          title="Toggle right sidebar"
          onClick={handleToggleRight}
          data-cmd="toggle-right-sidebar"
        />
      </div>
    </GroupShell>
  );
}
