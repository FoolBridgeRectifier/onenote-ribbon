import { TabDefinition } from "../types";

export const VIEW_TAB: TabDefinition = {
  id: "view",
  label: "View",
  groups: [
    {
      id: "views", label: "Views",
      items: [
        { id: "readingView", label: "Reading View",  icon: "eye",     iconColor: "#2563eb", size: "lg", commandId: "markdown:toggle-preview" },
        { id: "editingView", label: "Editing View",  icon: "pencil",  iconColor: "#374151", size: "lg", commandId: "markdown:toggle-preview" },
        { id: "livePreview", label: "Live Preview",  icon: "monitor", iconColor: "#7218A5", size: "lg", commandId: "editor:toggle-source" },
      ],
    },
    {
      id: "layout", label: "Layout",
      items: [
        { id: "splitRight", label: "Split Right", icon: "splitV",  iconColor: "#374151", size: "lg", commandId: "workspace:split-vertical" },
        { id: "splitDown",  label: "Split Down",  icon: "splitH",  iconColor: "#374151", size: "lg", commandId: "workspace:split-horizontal" },
        { id: "newTab",     label: "New Tab",     icon: "plusSq",  iconColor: "#059669", size: "lg", commandId: "workspace:new-tab" },
        { id: "newWindow",  label: "New Window",  icon: "window",  iconColor: "#374151", size: "lg", commandId: "workspace:open-in-new-window" },
      ],
    },
    {
      id: "panels", label: "Panels",
      items: [
        { id: "fileExplorer", label: "File Explorer", icon: "folder",   iconColor: "#f59e0b", size: "lg", isPanel: true, panelViewType: "file-explorer", panelCloseLabel: "File Explorer" },
        { id: "bookmarks",    label: "Bookmarks",     icon: "bookmark", iconColor: "#7218A5", size: "lg", isPanel: true, panelViewType: "bookmarks",     panelCloseLabel: "Bookmarks" },
        { id: "graphView",    label: "Graph View",    icon: "graph",    iconColor: "#2563eb", size: "lg", isPanel: true, panelViewType: "graph",          panelCloseLabel: "Graph View" },
        { id: "localGraph",   label: "Local Graph",   icon: "network",  iconColor: "#059669", size: "lg", isPanel: true, panelViewType: "localgraph",     panelCloseLabel: "Local Graph" },
      ],
    },
    {
      id: "zoom", label: "Zoom",
      items: [
        { id: "zoomOut",      label: "Zoom Out",      icon: "zoomOut",   iconColor: "#374151", size: "lg", commandId: "window:zoom-out" },
        { id: "zoomIn",       label: "Zoom In",       icon: "zoomIn",    iconColor: "#374151", size: "lg", commandId: "window:zoom-in" },
        { id: "readingWidth", label: "Reading Width", icon: "pageWidth", iconColor: "#374151", size: "lg", commandId: "editor:toggle-readable-line-length" },
      ],
    },
    {
      id: "appearance", label: "Appearance",
      items: [
        { id: "focusMode",   label: "Focus Mode",   icon: "focus",   iconColor: "#374151", size: "lg", commandId: "app:toggle-left-sidebar" },
        { id: "toggleTheme", label: "Toggle Theme", icon: "sunmoon", iconColor: "#7218A5", size: "lg", commandId: "theme:switch" },
      ],
    },
  ],
};
