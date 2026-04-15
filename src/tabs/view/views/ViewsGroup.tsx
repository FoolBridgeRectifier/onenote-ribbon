import { useEffect, useState } from 'react';
import { MarkdownView } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { EditingModeIcon, ReadingModeIcon, FocusModeIcon, FullscreenIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function ViewsGroup() {
  const app = useApp();
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    const updateMode = () => {
      const view = app.workspace.getActiveViewOfType(MarkdownView);
      setIsReadingMode(view?.getMode() === 'preview');
    };
    updateMode();
    const ref = app.workspace.on('active-leaf-change', updateMode);
    return () => app.workspace.offref(ref);
  }, [app]);

  const handleEditingMode = () => {
    (app as any).commands.executeCommandById('markdown:toggle-preview');
  };

  const handleReadingMode = () => {
    (app as any).commands.executeCommandById('markdown:toggle-preview');
  };

  const handleFocusMode = () => {
    (app as any).commands.executeCommandById('editor:toggle-fold-all');
  };

  const handleFullscreen = () => {
    (app as any).commands.executeCommandById('app:toggle-fullscreen');
  };

  return (
    <GroupShell name="View Mode">
      <div className="onr-views-group">
        <RibbonButton
          size="large"
          icon={<EditingModeIcon className="onr-icon" />}
          label="Editing"
          title="Switch to editing mode"
          onClick={handleEditingMode}
          active={!isReadingMode}
          data-cmd="editing-mode"
        />
        <RibbonButton
          size="large"
          icon={<ReadingModeIcon className="onr-icon" />}
          label="Reading"
          title="Switch to reading mode"
          onClick={handleReadingMode}
          active={isReadingMode}
          data-cmd="reading-mode"
        />
        <RibbonButton
          size="large"
          icon={<FocusModeIcon className="onr-icon" />}
          label="Focus"
          title="Toggle focus mode"
          onClick={handleFocusMode}
          data-cmd="focus-mode"
        />
        <RibbonButton
          size="large"
          icon={<FullscreenIcon className="onr-icon" />}
          label="Fullscreen"
          title="Toggle fullscreen"
          onClick={handleFullscreen}
          data-cmd="fullscreen"
        />
      </div>
    </GroupShell>
  );
}
