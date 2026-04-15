import { useState } from 'react';
import { Notice } from 'obsidian';

import '../history-tab-panel.css';
import { useApp } from '../../../shared/context/AppContext';
import {
  FileHistoryIcon,
  VaultHistoryIcon,
  CommitIcon,
  PushIcon,
  PullIcon,
  DiffViewIcon,
} from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

function isPluginEnabled(app: any, pluginId: string): boolean {
  return !!(app as any).plugins?.enabledPlugins?.has(pluginId);
}

export function GitVersionsGroup() {
  const app = useApp();
  const [gitAvailable] = useState(() => isPluginEnabled(app, 'obsidian-git'));

  const execGit = (commandId: string) => {
    if (!gitAvailable) {
      new Notice('Install "Obsidian Git" plugin to use this feature');
      (app as any).setting?.open?.();
      (app as any).setting?.openTabById?.('community-plugins');
      return;
    }
    (app as any).commands.executeCommandById(commandId);
  };

  const buttons = [
    { icon: <FileHistoryIcon className="onr-icon" />, label: 'File History', title: 'View file history (Git)', cmd: 'obsidian-git:open-file-history-view' },
    { icon: <VaultHistoryIcon className="onr-icon" />, label: 'Vault History', title: 'View vault history (Git)', cmd: 'obsidian-git:open-history-view' },
    { icon: <CommitIcon className="onr-icon" />, label: 'Commit', title: 'Commit changes (Git)', cmd: 'obsidian-git:commit-all-with-specific-message' },
    { icon: <PushIcon className="onr-icon" />, label: 'Push', title: 'Push to remote (Git)', cmd: 'obsidian-git:push' },
    { icon: <PullIcon className="onr-icon" />, label: 'Pull', title: 'Pull from remote (Git)', cmd: 'obsidian-git:pull' },
    { icon: <DiffViewIcon className="onr-icon" />, label: 'Diff View', title: 'Open diff view (Git)', cmd: 'obsidian-git:open-diff-view' },
  ];

  return (
    <GroupShell name="Git">
      <div className="onr-git-versions-group">
        {buttons.map((btn) => (
          <RibbonButton
            key={btn.cmd}
            size="large"
            icon={btn.icon}
            title={btn.title}
            onClick={() => execGit(btn.cmd)}
            data-cmd={btn.cmd}
            data-requires-plugin="obsidian-git"
            className={gitAvailable ? '' : 'onr-btn-plugin-unavailable'}
          >
            {btn.icon}
            <span className="onr-btn-label">{btn.label}</span>
            {!gitAvailable && <span className="onr-git-badge">Git</span>}
          </RibbonButton>
        ))}
      </div>
    </GroupShell>
  );
}
