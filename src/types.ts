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

/** A single ribbon button */
export interface ButtonDef {
  id: string;
  label: string;
  icon: string;           // key into ICONS map
  iconColor?: string;     // CSS color string, e.g. "#2563eb"
  size: "lg" | "md" | "sm" | "fmt";
  /** If set, button executes this Obsidian command ID */
  commandId?: string;
  /** If set, button fires document.execCommand (for clipboard ops not in Obsidian registry) */
  nativeClipboard?: "paste" | "cut" | "copy" | "undo" | "redo";
  /** If set, button inserts this string at cursor via editor transaction */
  insertText?: string;
  /** If commandId references a community plugin, name it here for the disabled tooltip */
  requiresPlugin?: string;
  /** For Draw tab — only enabled when a Canvas leaf is active */
  canvasOnly?: boolean;
  /** If true, this is a panel-split button (handled by PanelManager in plan 04) */
  isPanel?: boolean;
  /** View type for panel buttons */
  panelViewType?: string;
  /** Label shown on the "Close X" ribbon button when this panel is open */
  panelCloseLabel?: string;
}

/** A horizontal row of buttons inside a group (for stacked small buttons) */
export interface ButtonRow {
  buttons: ButtonDef[];
}

/** A group of buttons with a label at the bottom */
export interface GroupDef {
  id: string;
  label: string;
  items: Array<ButtonDef | ButtonRow>;
}

/** One tab's full content */
export interface TabDefinition {
  id: TabId;
  label: string;
  groups: GroupDef[];
}
