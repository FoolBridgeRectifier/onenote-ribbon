import { useApp } from '../../../shared/context/AppContext';
import { FileRecoveryIcon, SnapBackupIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function RecoveryGroup() {
  const app = useApp();

  const handleFileRecovery = () => {
    (app as any).commands.executeCommandById('file-recovery:open');
  };

  const handleSnapBackup = () => {
    (app as any).commands.executeCommandById('file-recovery:save');
  };

  return (
    <GroupShell name="Recovery">
      <div className="onr-recovery-group">
        <RibbonButton
          size="large"
          icon={<FileRecoveryIcon className="onr-icon" />}
          label="File Recovery"
          title="Open file recovery panel"
          onClick={handleFileRecovery}
          data-cmd="file-recovery"
        />
        <RibbonButton
          size="large"
          icon={<SnapBackupIcon className="onr-icon" />}
          label="Snap Backup"
          title="Save a file recovery snapshot"
          onClick={handleSnapBackup}
          data-cmd="snap-backup"
        />
      </div>
    </GroupShell>
  );
}
