import './tab-bar.css';
import { TABS, TabName } from '../tabs';

interface Props {
  activeTab: TabName;
  collapsed: boolean;
  isTemporarilyExpanded: boolean;
  onTabClick: (tabName: TabName) => void;
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
      {TABS.map((tabName) => (
        <div
          key={tabName}
          className={`onr-tab${isBodyVisible && tabName === activeTab ? ' active' : ''}`}
          data-tab={tabName}
          onClick={() => onTabClick(tabName)}
        >
          {tabName}
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
