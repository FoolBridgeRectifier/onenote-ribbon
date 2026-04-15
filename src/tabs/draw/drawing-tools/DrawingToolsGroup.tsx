import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { SelectToolIcon, PenToolIcon, ShapeToolIcon, EraserToolIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

function isPluginEnabled(app: any, pluginId: string): boolean {
  return !!(app as any).plugins?.enabledPlugins?.has(pluginId);
}

export function DrawingToolsGroup() {
  const app = useApp();

  const handleSelect = () => {
    (app as any).commands.executeCommandById('canvas:select-all');
  };

  const handlePen = () => {
    if (!isPluginEnabled(app, 'obsidian-excalidraw-plugin')) {
      new Notice('Install "Excalidraw" to use drawing tools');
      return;
    }
    (app as any).commands.executeCommandById('obsidian-excalidraw-plugin:excalidraw-toggle-pen-mode');
  };

  const handleShape = () => {
    if (!isPluginEnabled(app, 'obsidian-excalidraw-plugin')) {
      new Notice('Install "Excalidraw" to use drawing tools');
      return;
    }
    new Notice('Use Excalidraw for shape tools');
  };

  const handleEraser = () => {
    (app as any).commands.executeCommandById('canvas:undo');
  };

  return (
    <GroupShell name="Tools">
      <div className="onr-drawing-tools-group">
        <RibbonButton
          size="large"
          icon={<SelectToolIcon className="onr-icon" />}
          label="Select"
          title="Select all canvas nodes"
          onClick={handleSelect}
          data-cmd="tool-select"
        />
        <RibbonButton
          size="large"
          icon={<PenToolIcon className="onr-icon" />}
          label="Pen"
          title="Pen tool (Excalidraw)"
          onClick={handlePen}
          data-cmd="tool-pen"
        />
        <RibbonButton
          size="large"
          icon={<ShapeToolIcon className="onr-icon" />}
          label="Shape"
          title="Shape tool (Excalidraw)"
          onClick={handleShape}
          data-cmd="tool-shape"
        />
        <RibbonButton
          size="large"
          icon={<EraserToolIcon className="onr-icon" />}
          label="Eraser"
          title="Undo last action"
          onClick={handleEraser}
          data-cmd="tool-eraser"
        />
      </div>
    </GroupShell>
  );
}
