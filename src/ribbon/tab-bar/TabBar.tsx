import './tab-bar.css';
import type { TabBarProps } from './interfaces';
import { TABS } from '../constants';

export function TabBar({
  activeTab,
  collapsed,
  isTemporarilyExpanded,
  onTabClick,
  onToggleCollapse,
}: TabBarProps) {
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
