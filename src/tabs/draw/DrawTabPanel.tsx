import './draw-tab-panel.css';
import { LaunchGroup } from './launch/LaunchGroup';
import { CanvasGroup } from './canvas/CanvasGroup';
import { DrawingToolsGroup } from './drawing-tools/DrawingToolsGroup';
import { ModeGroup } from './mode/ModeGroup';

export function DrawTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Draw">
      <LaunchGroup />
      <CanvasGroup />
      <DrawingToolsGroup />
      <ModeGroup />
    </div>
  );
}
