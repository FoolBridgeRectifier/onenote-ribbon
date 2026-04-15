import { useApp } from '../../../shared/context/AppContext';
import { ZoomOutIcon, ZoomResetIcon, ZoomInIcon, ReadableWidthIcon, HideTitleIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function ZoomLayoutGroup() {
  const app = useApp();

  const handleZoomOut = () => {
    (app as any).commands.executeCommandById('editor:decrease-font-size');
  };

  const handleZoomReset = () => {
    (app as any).commands.executeCommandById('editor:reset-font-size');
  };

  const handleZoomIn = () => {
    (app as any).commands.executeCommandById('editor:increase-font-size');
  };

  const handleReadableWidth = () => {
    (app as any).commands.executeCommandById('app:toggle-readable-line-width');
  };

  const handleHideTitle = () => {
    (app as any).commands.executeCommandById('app:toggle-inline-title');
  };

  return (
    <GroupShell name="Zoom &amp; Layout">
      <div className="onr-zoom-layout-group">
        <RibbonButton
          size="large"
          icon={<ZoomOutIcon className="onr-icon" />}
          label="Zoom Out"
          title="Decrease editor font size"
          onClick={handleZoomOut}
          data-cmd="zoom-out"
        />
        <RibbonButton
          size="large"
          icon={<ZoomResetIcon className="onr-icon" />}
          label="100%"
          title="Reset editor font size"
          onClick={handleZoomReset}
          data-cmd="zoom-reset"
        />
        <RibbonButton
          size="large"
          icon={<ZoomInIcon className="onr-icon" />}
          label="Zoom In"
          title="Increase editor font size"
          onClick={handleZoomIn}
          data-cmd="zoom-in"
        />
        <RibbonButton
          size="large"
          icon={<ReadableWidthIcon className="onr-icon" />}
          label="Readable Width"
          title="Toggle readable line width"
          onClick={handleReadableWidth}
          data-cmd="readable-width"
        />
        <RibbonButton
          size="large"
          icon={<HideTitleIcon className="onr-icon" />}
          label="Hide Title"
          title="Toggle inline title"
          onClick={handleHideTitle}
          data-cmd="hide-title"
        />
      </div>
    </GroupShell>
  );
}
