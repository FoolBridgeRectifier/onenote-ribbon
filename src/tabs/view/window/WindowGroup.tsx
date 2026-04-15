import { useApp } from '../../../shared/context/AppContext';
import { SplitVerticalIcon, SplitHorizontalIcon, NewWindowIcon, QuickNoteIcon, StackedTabsIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function WindowGroup() {
  const app = useApp();

  const handleSplitVertical = () => {
    (app as any).commands.executeCommandById('workspace:split-vertical');
  };

  const handleSplitHorizontal = () => {
    (app as any).commands.executeCommandById('workspace:split-horizontal');
  };

  const handleNewWindow = () => {
    (app as any).commands.executeCommandById('workspace:open-in-new-window');
  };

  const handleQuickNote = () => {
    (app as any).commands.executeCommandById('workspace:new-tab');
  };

  const handleStackedTabs = () => {
    (app as any).commands.executeCommandById('workspace:toggle-stacked-tabs');
  };

  return (
    <GroupShell name="Window">
      <div className="onr-window-group">
        <RibbonButton
          size="large"
          icon={<SplitVerticalIcon className="onr-icon" />}
          label="Split Vertical"
          title="Split editor vertically"
          onClick={handleSplitVertical}
          data-cmd="split-vertical"
        />
        <RibbonButton
          size="large"
          icon={<SplitHorizontalIcon className="onr-icon" />}
          label="Split Horizontal"
          title="Split editor horizontally"
          onClick={handleSplitHorizontal}
          data-cmd="split-horizontal"
        />
        <RibbonButton
          size="large"
          icon={<NewWindowIcon className="onr-icon" />}
          label="New Window"
          title="Open in new window"
          onClick={handleNewWindow}
          data-cmd="new-window"
        />
        <RibbonButton
          size="large"
          icon={<QuickNoteIcon className="onr-icon" />}
          label="Quick Note"
          title="Open a new tab"
          onClick={handleQuickNote}
          data-cmd="quick-note"
        />
        <RibbonButton
          size="large"
          icon={<StackedTabsIcon className="onr-icon" />}
          label="Stacked Tabs"
          title="Toggle stacked tabs"
          onClick={handleStackedTabs}
          data-cmd="stacked-tabs"
        />
      </div>
    </GroupShell>
  );
}
