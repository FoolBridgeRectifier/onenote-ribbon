import { TabDefinition } from "../types";

export const REVIEW_TAB: TabDefinition = {
  id: "review",
  label: "Review",
  groups: [
    {
      id: "spelling", label: "Spelling",
      items: [
        { id: "spellcheckR", label: "Spellcheck", icon: "spell", iconColor: "#16a34a", size: "lg", commandId: "editor:toggle-spellcheck" },
      ],
    },
    {
      id: "findSearch", label: "Find & Search",
      items: [
        { id: "find",        label: "Find",         icon: "search",  iconColor: "#2563eb", size: "lg", commandId: "editor:open-search" },
        { id: "replace",     label: "Replace",      icon: "replace", iconColor: "#7218A5", size: "lg", commandId: "editor:open-search-replace" },
        { id: "vaultSearch", label: "Vault Search", icon: "search",  iconColor: "#0369a1", size: "lg", commandId: "global-search:open" },
      ],
    },
    {
      id: "linksTags", label: "Links & Tags",
      items: [
        { id: "backlinks",    label: "Backlinks",      icon: "backlink", iconColor: "#2563eb", size: "lg", isPanel: true, panelViewType: "backlink",     panelCloseLabel: "Backlinks" },
        { id: "outgoingLinks",label: "Outgoing Links", icon: "outlink",  iconColor: "#059669", size: "lg", isPanel: true, panelViewType: "outgoing-link", panelCloseLabel: "Outgoing Links" },
        { id: "allTags",      label: "All Tags",       icon: "tag",      iconColor: "#f59e0b", size: "lg", isPanel: true, panelViewType: "tag",           panelCloseLabel: "All Tags" },
      ],
    },
    {
      id: "noteInfo", label: "Note Info",
      items: [
        { id: "properties", label: "Properties", icon: "fileText", iconColor: "#374151", size: "lg", isPanel: true, panelViewType: "file-properties", panelCloseLabel: "Properties" },
        { id: "outline",    label: "Outline",    icon: "outline",  iconColor: "#374151", size: "lg", isPanel: true, panelViewType: "outline",          panelCloseLabel: "Outline" },
      ],
    },
  ],
};
