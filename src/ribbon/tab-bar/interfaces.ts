import type { TabName } from '../interfaces';

/** Props for the TabBar component. */
export interface TabBarProps {
  activeTab: TabName;
  collapsed: boolean;
  isTemporarilyExpanded: boolean;
  onTabClick: (tabName: TabName) => void;
  onToggleCollapse: () => void;
}
