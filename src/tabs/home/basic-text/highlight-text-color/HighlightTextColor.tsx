import "./HighlightTextColor.css";
import { HighlightIcon } from "../../../../assets/icons";
import { useApp } from "../../../../shared/context/AppContext";

export function HighlightTextColor() {
  const app = useApp();

  const handleHighlight = () => {
    (app as any).commands.executeCommandById("editor:toggle-highlight");
  };

  return (
    <>
      {/* Highlight button with icon + swatch + dropdown */}
      <div className="onr-highlight-wrapper">
        <div
          className="onr-btn-sm onr-highlight-btn"
          title="Highlight"
          onClick={handleHighlight}
          data-cmd="highlight"
        >
          <HighlightIcon className="onr-icon-sm" />
          <div className="onr-highlight-swatch" />
        </div>
        <button
          className="onr-highlight-caret"
          title="Highlight colors"
          onClick={() => {}}
          data-cmd="highlight-colors"
        >
          ▾
        </button>
      </div>

      <div className="onr-divider" />

      {/* Font color A with swatch + dropdown */}
      <div className="onr-color-wrapper">
        <div
          className="onr-btn-sm onr-color-btn"
          title="Font color"
          onClick={() => {}}
          data-cmd="font-color"
        >
          <span className="onr-color-label">A</span>
          <div className="onr-color-swatch" />
        </div>
        <button
          className="onr-color-caret"
          title="Font colors"
          onClick={() => {}}
          data-cmd="font-colors"
        >
          ▾
        </button>
      </div>
    </>
  );
}
