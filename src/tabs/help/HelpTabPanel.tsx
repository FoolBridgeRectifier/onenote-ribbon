import './help-tab-panel.css';
import { HelpGroup } from './help/HelpGroup';
import { SystemGroup } from './system/SystemGroup';

export function HelpTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Help">
      <HelpGroup />
      <SystemGroup />
    </div>
  );
}
