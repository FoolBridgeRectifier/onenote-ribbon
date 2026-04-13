import './highlight-text-color.css';
import { HighlightIcon } from '../../../../assets/icons';
import { useApp } from '../../../../shared/context/AppContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';

export function HighlightTextColor() {
  const app = useApp();

  const handleHighlight = () => {
    (app as any).commands.executeCommandById('editor:toggle-highlight');
  };

  const handleFontColorClick = () => {};

  return (
    <>
      {/* Highlight button with icon + swatch */}
      <RibbonButton
        className="onr-highlight-btn"
        title="Highlight"
        onClick={handleHighlight}
        data-cmd="highlight"
      >
        <HighlightIcon className="onr-icon-sm" />
        <div className="onr-highlight-swatch" />
      </RibbonButton>

      <div className="onr-divider" />

      {/* Font color A with swatch + dropdown */}
      <div className="onr-color-wrapper">
        <RibbonButton
          className="onr-color-btn"
          title="Font color"
          onClick={handleFontColorClick}
          data-cmd="font-color"
        >
          <span className="onr-color-label">A</span>
          <div className="onr-color-swatch" />
        </RibbonButton>
        <div className="onr-color-caret">▾</div>
      </div>
    </>
  );
}
