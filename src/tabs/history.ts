import { TabDefinition } from "../types";

export const HISTORY_TAB: TabDefinition = {
  id: "history",
  label: "History",
  groups: [
    {
      id: "editHistory", label: "Edit History",
      items: [
        { id: "undoH", label: "Undo", icon: "undo", iconColor: "#374151", size: "lg", nativeClipboard: "undo" },
        { id: "redoH", label: "Redo", icon: "redo", iconColor: "#374151", size: "lg", nativeClipboard: "redo" },
      ],
    },
    {
      id: "navigation", label: "Navigation",
      items: [
        { id: "navBack",    label: "Navigate Back",    icon: "arrowL", iconColor: "#2563eb", size: "lg", commandId: "app:go-back" },
        { id: "navForward", label: "Navigate Forward", icon: "arrowR", iconColor: "#2563eb", size: "lg", commandId: "app:go-forward" },
      ],
    },
    {
      id: "vaultHistory", label: "Vault History",
      items: [
        { id: "recentFiles",  label: "Recent Files",  icon: "history",   iconColor: "#7218A5", size: "lg", commandId: "recent-files-obsidian:open", requiresPlugin: "Recent Files" },
        { id: "fileRecovery", label: "File Recovery", icon: "fileClock", iconColor: "#f59e0b", size: "lg", commandId: "file-recovery:open" },
        { id: "syncLog",      label: "Sync Log",      icon: "rotate",    iconColor: "#059669", size: "lg", commandId: "obsidian-sync:open-sync-log", requiresPlugin: "Obsidian Sync" },
      ],
    },
  ],
};
