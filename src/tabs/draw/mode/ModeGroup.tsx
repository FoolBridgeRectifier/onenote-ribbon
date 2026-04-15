import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { PanToolIcon, RulerToolIcon, FullPageModeIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

function isPluginEnabled(app: any, pluginId: string): boolean {
  return !!(app as any).plugins?.enabledPlugins?.has(pluginId);
}

export function ModeGroup() {
  const app = useApp();

  const handlePan = () => {
    if (!isPluginEnabled(app, 'obsidian-excalidraw-plugin')) {
      new Notice('Install "Excalidraw" to use pan mode');
      return;
    }
    (app as any).commands.executeCommandById('obsidian-excalidraw-plugin:excalidraw-pan-mode');
  };

  const handleRuler = () => {
    const current = (app as any).vault.getConfig('canvasShowGrid');
    (app as any).vault.setConfig('canvasShowGrid', !current);
  };

  const handleFullPage = () => {
    (app as any).commands.executeCommandById('app:toggle-fullscreen');
  };

  return (
    <GroupShell name="Mode">
      <div className="onr-mode-group">
        <RibbonButton
          size="large"
          icon={<PanToolIcon className="onr-icon" />}
          label="Pan"
          title="Pan mode (Excalidraw)"
          onClick={handlePan}
          data-cmd="mode-pan"
        />
        <RibbonButton
          size="large"
          icon={<RulerToolIcon className="onr-icon" />}
          label="Ruler"
          title="Toggle canvas grid"
          onClick={handleRuler}
          data-cmd="mode-ruler"
        />
        <RibbonButton
          size="large"
          icon={<FullPageModeIcon className="onr-icon" />}
          label="Full Page"
          title="Toggle fullscreen"
          onClick={handleFullPage}
          data-cmd="mode-fullpage"
        />
      </div>
    </GroupShell>
  );
}
