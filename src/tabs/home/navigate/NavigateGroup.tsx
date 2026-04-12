import { useApp } from "../../../shared/context/AppContext";
import { FoldAllIcon, OutlineIcon, UnfoldAllIcon } from "../../../assets/icons";

export function NavigateGroup() {
  const app = useApp();

  const handleOutline = () => {
    (app as any).commands.executeCommandById("outline:open");
  };

  const handleFoldAll = () => {
    (app as any).commands.executeCommandById("editor:fold-all");
  };

  const handleUnfoldAll = () => {
    (app as any).commands.executeCommandById("editor:unfold-all");
  };

  return (
    <div className="onr-group">
      <div className="onr-navigate-group">
        <div
          className="onr-btn"
          title="Open outline panel"
          onClick={handleOutline}
          data-cmd="outline"
        >
          <OutlineIcon className="onr-icon" />
          <span className="onr-btn-label">Outline</span>
        </div>
        <div
          className="onr-btn"
          title="Collapse all headings"
          onClick={handleFoldAll}
          data-cmd="fold-all"
        >
          <FoldAllIcon className="onr-icon" />
          <span className="onr-btn-label">Fold All</span>
        </div>
        <div
          className="onr-btn"
          title="Expand all headings"
          onClick={handleUnfoldAll}
          data-cmd="unfold-all"
        >
          <UnfoldAllIcon className="onr-icon" />
          <span className="onr-btn-label">Unfold All</span>
        </div>
      </div>
      <div className="onr-group-name">Navigate</div>
    </div>
  );
}
