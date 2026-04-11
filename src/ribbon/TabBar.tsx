import { TABS, TabName } from './tabs';

interface Props {
  activeTab: TabName;
  collapsed: boolean;
  isTemporarilyExpanded: boolean;
  onTabClick: (t: TabName) => void;
  onToggleCollapse: () => void;
}

export function TabBar({
  activeTab,
  collapsed,
  isTemporarilyExpanded,
  onTabClick,
  onToggleCollapse,
}: Props) {
  const isBodyVisible = !collapsed || isTemporarilyExpanded;
  const isPermaOpen = !collapsed;

  return (
    <div className="onr-tab-bar">
      {TABS.map(t => (
        <div
          key={t}
          className={`onr-tab${isBodyVisible && t === activeTab ? ' active' : ''}`}
          data-tab={t}
          onClick={() => onTabClick(t)}
        >
          {t}
        </div>
      ))}
      <div className="onr-spacer" />
      {isBodyVisible && (
        <div className="onr-pin-btn" onClick={onToggleCollapse}>
          {isPermaOpen ? '▲ Close' : '📌 Pin'}
        </div>
      )}
    </div>
  );
}
