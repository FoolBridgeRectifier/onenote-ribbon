import { TABS, TabName } from "./tabs";

interface Props {
  activeTab: TabName;
  collapsed: boolean;
  pinned: boolean;
  onTabClick: (tab: TabName) => void;
  onToggleCollapse: () => void;
}

export function TabBar({
  activeTab,
  collapsed,
  pinned,
  onTabClick,
  onToggleCollapse,
}: Props) {
  return (
    <div className="onr-tab-bar">
      {TABS.map((tab) => (
        <div
          key={tab}
          className={`onr-tab${tab === activeTab ? " active" : ""}`}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </div>
      ))}

      <div className="onr-spacer" />

      <div className="onr-pin-btn" onClick={onToggleCollapse}>
        {pinned ? "📌" : ""} {collapsed ? "▼ Expand" : "▲ Collapse"}
      </div>
    </div>
  );
}
