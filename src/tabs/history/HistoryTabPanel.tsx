import './history-tab-panel.css';
import { NavigationGroup } from './navigation/NavigationGroup';
import { GitVersionsGroup } from './git-versions/GitVersionsGroup';
import { RecoveryGroup } from './recovery/RecoveryGroup';

export function HistoryTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="History">
      <NavigationGroup />
      <GitVersionsGroup />
      <RecoveryGroup />
    </div>
  );
}
