export type TabId = "file" | "home" | "insert" | "draw" | "history" | "review" | "view" | "help";

export interface RibbonState {
  activeTab: TabId;
  pinned: boolean;
  openPanelId: string | null;
}

export const DEFAULT_STATE: RibbonState = {
  activeTab: "home",
  pinned: false,
  openPanelId: null,
};
