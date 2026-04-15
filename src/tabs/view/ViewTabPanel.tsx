import './view-tab-panel.css';
import { ViewsGroup } from './views/ViewsGroup';
import { GraphGroup } from './graph/GraphGroup';
import { SidebarsGroup } from './sidebars/SidebarsGroup';
import { ZoomLayoutGroup } from './zoom-layout/ZoomLayoutGroup';
import { WindowGroup } from './window/WindowGroup';

export function ViewTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="View">
      <ViewsGroup />
      <GraphGroup />
      <SidebarsGroup />
      <ZoomLayoutGroup />
      <WindowGroup />
    </div>
  );
}
