import { useRef, useEffect } from 'react';
import { useRibbonState } from '../../shared/hooks/useRibbonState';
import { TabBar } from '../tab-bar/TabBar';
import { HomeTabPanel } from '../../tabs/home/Home';
import { InsertTabPanel } from '../../tabs/insert/Insert';
import { useApp } from '../../shared/context/AppContext';
import { getActiveTags } from '../../shared/editor-v2/detection-engine';

import '../ribbon-app.css';

export function RibbonApp() {
  const app = useApp();
  const {
    activeTab,
    collapsed,
    isTemporarilyExpanded,
    setIsTemporarilyExpanded,
    handleTabClick,
    handleCollapseToggle,
  } = useRibbonState();

  const ribbonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleChange = () => {
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;

      const sourceText = editor.getValue();
      const selectionFrom = editor.getCursor('from');
      const selectionTo = editor.getCursor('to');

      getActiveTags(sourceText, { start: selectionFrom, end: selectionTo });
    };

    const editorChangeRef = app.workspace.on('editor-change', handleChange);
    document.addEventListener('selectionchange', handleChange);

    return () => {
      app.workspace.offref(editorChangeRef);
      document.removeEventListener('selectionchange', handleChange);
    };
  }, [app]);

  const isBodyVisible = !collapsed || isTemporarilyExpanded;

  useEffect(() => {
    if (!isTemporarilyExpanded) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (ribbonRef.current && !ribbonRef.current.contains(event.target as Node)) {
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
