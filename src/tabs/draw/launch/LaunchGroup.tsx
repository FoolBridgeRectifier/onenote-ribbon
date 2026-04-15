import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { NewCanvasIcon, ExcalidrawIcon, InkDrawIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

function isPluginEnabled(app: any, pluginId: string): boolean {
  return !!(app as any).plugins?.enabledPlugins?.has(pluginId);
}

export function LaunchGroup() {
  const app = useApp();

  const handleNewCanvas = () => {
    (app as any).commands.executeCommandById('canvas:new-file');
  };

  const handleExcalidraw = () => {
    if (!isPluginEnabled(app, 'obsidian-excalidraw-plugin')) {
      new Notice('Install "Excalidraw" to use this feature');
      (app as any).setting?.open?.();
      (app as any).setting?.openTabById?.('community-plugins');
      return;
    }
    (app as any).commands.executeCommandById('obsidian-excalidraw-plugin:excalidraw-create-new');
  };

  const handleInkDraw = () => {
    if (!isPluginEnabled(app, 'obsidian-ink')) {
      new Notice('Install "Ink" to use this feature');
      (app as any).setting?.open?.();
      (app as any).setting?.openTabById?.('community-plugins');
      return;
    }
    (app as any).commands.executeCommandById('obsidian-ink:new-drawing');
  };

  const excalidrawAvailable = isPluginEnabled(app, 'obsidian-excalidraw-plugin');
  const inkAvailable = isPluginEnabled(app, 'obsidian-ink');

  return (
    <GroupShell name="Launch">
      <div className="onr-launch-group">
        <RibbonButton
          size="large"
          icon={<NewCanvasIcon className="onr-icon" />}
          label="New Canvas"
          title="Create a new Obsidian Canvas"
          onClick={handleNewCanvas}
          data-cmd="new-canvas"
        />
        <RibbonButton
          size="large"
          icon={<ExcalidrawIcon className="onr-icon" />}
          label="Excalidraw"
          title="Open new Excalidraw drawing"
          onClick={handleExcalidraw}
          data-cmd="excalidraw"
          className={excalidrawAvailable ? '' : 'onr-btn-plugin-unavailable'}
        >
          <ExcalidrawIcon className="onr-icon" />
          <span className="onr-btn-label">Excalidraw</span>
          {!excalidrawAvailable && <span className="onr-plugin-badge">plugin</span>}
        </RibbonButton>
        <RibbonButton
          size="large"
          icon={<InkDrawIcon className="onr-icon" />}
          label="Ink Draw"
          title="Open new Ink drawing"
          onClick={handleInkDraw}
          data-cmd="ink-draw"
          className={inkAvailable ? '' : 'onr-btn-plugin-unavailable'}
        >
          <InkDrawIcon className="onr-icon" />
          <span className="onr-btn-label">Ink Draw</span>
          {!inkAvailable && <span className="onr-plugin-badge">plugin</span>}
        </RibbonButton>
      </div>
    </GroupShell>
  );
}
