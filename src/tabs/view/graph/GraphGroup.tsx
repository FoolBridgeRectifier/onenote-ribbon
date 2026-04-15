import { useApp } from '../../../shared/context/AppContext';
import { GraphViewIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function GraphGroup() {
  const app = useApp();

  const handleGraphView = () => {
    (app as any).commands.executeCommandById('graph:open');
  };

  return (
    <GroupShell name="Graph">
      <div className="onr-graph-group">
        <RibbonButton
          size="large"
          icon={<GraphViewIcon className="onr-icon" />}
          label="Graph View"
          title="Open global graph view"
          onClick={handleGraphView}
          data-cmd="graph-view"
        />
      </div>
    </GroupShell>
  );
}
