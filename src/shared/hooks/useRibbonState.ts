import { useState } from 'react';
import { TabName } from '../../ribbon/tabs';

export function useRibbonState() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [isTemporarilyExpanded, setIsTemporarilyExpanded] = useState(false);

  const handleTabClick = (tab: TabName) => {
    setActiveTab(tab);
    if (collapsed && !isTemporarilyExpanded) {
      setIsTemporarilyExpanded(true);
    }
  };

  const handleCollapseToggle = () => {
    setCollapsed((isCurrentlyCollapsed) => !isCurrentlyCollapsed);
    setIsTemporarilyExpanded(false);
  };

  return {
    activeTab,
    setActiveTab,
    collapsed,
    setCollapsed,
    pinned,
    setPinned,
    isTemporarilyExpanded,
    setIsTemporarilyExpanded,
    handleTabClick,
    handleCollapseToggle,
  };
}
