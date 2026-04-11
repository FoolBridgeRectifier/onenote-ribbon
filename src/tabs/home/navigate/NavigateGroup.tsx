import { useApp } from '../../../shared/context/AppContext';

export function NavigateGroup() {
  const app = useApp();

  const handleOutline = () => {
    ((app as any).commands).executeCommandById('outline:open');
  };

  const handleFoldAll = () => {
    ((app as any).commands).executeCommandById('editor:fold-all');
  };

  const handleUnfoldAll = () => {
    ((app as any).commands).executeCommandById('editor:unfold-all');
  };

  return (
    <div className="onr-group">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <div
          className="onr-btn"
          title="Open outline panel"
          onClick={handleOutline}
          data-cmd="outline"
        >
          <svg className="onr-icon" viewBox="0 0 24 24">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span className="onr-btn-label">📋 Outline</span>
        </div>
        <div
          className="onr-btn"
          title="Collapse all headings"
          onClick={handleFoldAll}
          data-cmd="fold-all"
        >
          <svg className="onr-icon" viewBox="0 0 24 24">
            <polyline points="3 8 6 8 6 3" />
            <polyline points="3 16 6 16 6 21" />
            <line x1="21" y1="8" x2="6" y2="8" />
            <line x1="21" y1="16" x2="6" y2="16" />
          </svg>
          <span className="onr-btn-label">⊟ Fold All</span>
        </div>
        <div
          className="onr-btn"
          title="Expand all headings"
          onClick={handleUnfoldAll}
          data-cmd="unfold-all"
        >
          <svg className="onr-icon" viewBox="0 0 24 24">
            <polyline points="21 8 18 8 18 3" />
            <polyline points="21 16 18 16 18 21" />
            <line x1="3" y1="8" x2="18" y2="8" />
            <line x1="3" y1="16" x2="18" y2="16" />
          </svg>
          <span className="onr-btn-label">⊞ Unfold All</span>
        </div>
      </div>
      <div className="onr-group-name">Navigate</div>
    </div>
  );
}
