import { useRef, useEffect } from 'react';
import { useRibbonState } from '../shared/hooks/useRibbonState';
import { TabBar } from './tab-bar/TabBar';
import { HomeTabPanel } from '../tabs/home/HomeTabPanel';
import { InsertTabPanel } from '../tabs/insert/InsertTabPanel';

import './ribbon-app.css';

export function RibbonApp() {
  const {
    activeTab,
    collapsed,
    isTemporarilyExpanded,
    setIsTemporarilyExpanded,
    handleTabClick,
    handleCollapseToggle,
  } = useRibbonState();

  const ribbonRef = useRef<HTMLDivElement>(null);

  const isBodyVisible = !collapsed || isTemporarilyExpanded;

  useEffect(() => {
    if (!isTemporarilyExpanded) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        ribbonRef.current &&
        !ribbonRef.current.contains(event.target as Node)
      ) {
        setIsTemporarilyExpanded(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [isTemporarilyExpanded, setIsTemporarilyExpanded]);

  return (
    <div className="onr-ribbon" ref={ribbonRef}>
      <TabBar
        activeTab={activeTab}
        collapsed={collapsed}
        isTemporarilyExpanded={isTemporarilyExpanded}
        onTabClick={handleTabClick}
        onToggleCollapse={handleCollapseToggle}
      />
      {isBodyVisible && (
        <div className="onr-body">
          {activeTab === 'Home' && <HomeTabPanel />}
          {activeTab === 'Insert' && <InsertTabPanel />}
        </div>
      )}
    </div>
  );
}
