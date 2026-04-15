import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { EncryptIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

function isPluginEnabled(app: any, pluginId: string): boolean {
  return !!(app as any).plugins?.enabledPlugins?.has(pluginId);
}

export function SecurityGroup() {
  const app = useApp();
  const encryptAvailable = isPluginEnabled(app, 'meld-encrypt');

  const handleEncrypt = () => {
    if (!encryptAvailable) {
      new Notice('Install "Meld Encrypt" plugin to use this feature');
      (app as any).setting?.open?.();
      (app as any).setting?.openTabById?.('community-plugins');
      return;
    }
    (app as any).commands.executeCommandById('meld-encrypt:meld-encrypt-note-in-place');
  };

  return (
    <GroupShell name="Security">
      <div className="onr-security-group">
        <RibbonButton
          size="large"
          icon={<EncryptIcon className="onr-icon" />}
          label="Encrypt"
          title="Encrypt note in place (Meld Encrypt)"
          onClick={handleEncrypt}
          data-cmd="encrypt"
          className={encryptAvailable ? '' : 'onr-btn-plugin-unavailable'}
        >
          <EncryptIcon className="onr-icon" />
          <span className="onr-btn-label">Encrypt</span>
          {!encryptAvailable && <span className="onr-plugin-badge">plugin</span>}
        </RibbonButton>
      </div>
    </GroupShell>
  );
}
