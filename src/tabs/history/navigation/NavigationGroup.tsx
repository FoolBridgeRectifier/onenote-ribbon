import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { RecentFilesIcon, NavBackIcon, NavForwardIcon, OpenTrashIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function NavigationGroup() {
  const app = useApp();

  const handleRecentFiles = () => {
    (app as any).commands.executeCommandById('recent-files-obsidian:open');
  };

  const handleNavBack = () => {
    (app as any).commands.executeCommandById('app:go-back');
  };

  const handleNavForward = () => {
    (app as any).commands.executeCommandById('app:go-forward');
  };

  const handleOpenTrash = () => {
    const adapter = (app as any).vault.adapter;
    const basePath = adapter.basePath ?? adapter.getBasePath?.() ?? '';
    const trashPath = basePath + '/.trash';
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const electron = require('electron');
      electron.shell.openPath(trashPath);
    } catch {
      new Notice('Vault trash: ' + trashPath);
    }
  };

  return (
    <GroupShell name="Navigation">
      <div className="onr-navigation-group">
        <RibbonButton
          size="large"
          icon={<RecentFilesIcon className="onr-icon" />}
          label="Recent Files"
          title="Open recent files panel"
          onClick={handleRecentFiles}
          data-cmd="recent-files"
        />
        <RibbonButton
          size="large"
          icon={<NavBackIcon className="onr-icon" />}
          label="Nav Back"
          title="Navigate back"
          onClick={handleNavBack}
          data-cmd="nav-back"
        />
        <RibbonButton
          size="large"
          icon={<NavForwardIcon className="onr-icon" />}
          label="Nav Forward"
          title="Navigate forward"
          onClick={handleNavForward}
          data-cmd="nav-forward"
        />
        <RibbonButton
          size="large"
          icon={<OpenTrashIcon className="onr-icon" />}
          label="Open Trash"
          title="Open vault trash folder"
          onClick={handleOpenTrash}
          data-cmd="open-trash"
        />
      </div>
    </GroupShell>
  );
}
