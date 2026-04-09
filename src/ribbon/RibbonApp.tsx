import { useRibbonState } from "./useRibbonState";
import { TabBar } from "./TabBar";

import { HomeTabPanel } from "../tabs/home/HomeTabPanel";
import { InsertTabPanel } from "../tabs/insert/InsertTabPanel";
import { DrawTabPanel } from "../tabs/draw/DrawTabPanel";
import { HistoryTabPanel } from "../tabs/history/HistoryTabPanel";
import { ReviewTabPanel } from "../tabs/review/ReviewTabPanel";
import { ViewTabPanel } from "../tabs/view/ViewTabPanel";
import { HelpTabPanel } from "../tabs/help/HelpTabPanel";

export function RibbonApp() {
  const {
    activeTab,
    setActiveTab,
    collapsed,
    setCollapsed,
    pinned,
    setPinned,
  } = useRibbonState();

  return (
    <div className="onr-ribbon">
      <TabBar
        activeTab={activeTab}
        collapsed={collapsed}
        pinned={pinned}
        onTabClick={setActiveTab}
        onToggleCollapse={() => setCollapsed((isCollapsed) => !isCollapsed)}
      />
      {!collapsed && (
        <div className="onr-body">
          {activeTab === "Home"    && <HomeTabPanel />}
          {activeTab === "Insert"  && <InsertTabPanel />}
          {activeTab === "Draw"    && <DrawTabPanel />}
          {activeTab === "History" && <HistoryTabPanel />}
          {activeTab === "Review"  && <ReviewTabPanel />}
          {activeTab === "View"    && <ViewTabPanel />}
          {activeTab === "Help"    && <HelpTabPanel />}
        </div>
      )}
    </div>
  );
}
