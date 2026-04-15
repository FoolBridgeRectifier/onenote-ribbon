import { useApp } from '../../../shared/context/AppContext';
import { PluginSettingsIcon, SandboxIcon, FeedbackIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function SystemGroup() {
  const app = useApp();

  const handleSettings = () => {
    (app as any).commands.executeCommandById('app:open-settings');
  };

  const handleSandbox = () => {
    (app as any).commands.executeCommandById('app:show-sandbox-window');
  };

  const handleFeedback = () => {
    window.open('https://github.com/FoolBridgeRectifier/onenote-ribbon/issues/new');
  };

  return (
    <GroupShell name="System">
      <div className="onr-system-group">
        <RibbonButton
          size="large"
          icon={<PluginSettingsIcon className="onr-icon" />}
          label="Settings"
          title="Open Obsidian settings"
          onClick={handleSettings}
          data-cmd="settings"
        />
        <RibbonButton
          size="large"
          icon={<SandboxIcon className="onr-icon" />}
          label="Sandbox"
          title="Open sandbox window"
          onClick={handleSandbox}
          data-cmd="sandbox"
        />
        <RibbonButton
          size="large"
          icon={<FeedbackIcon className="onr-icon" />}
          label="Feedback"
          title="Submit feedback on GitHub"
          onClick={handleFeedback}
          data-cmd="feedback"
        />
      </div>
    </GroupShell>
  );
}
