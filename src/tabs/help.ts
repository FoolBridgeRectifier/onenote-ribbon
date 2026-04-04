import { TabDefinition } from "../types";

export const HELP_TAB: TabDefinition = {
  id: "help",
  label: "Help",
  groups: [
    {
      id: "help", label: "Help",
      items: [
        { id: "helpDocs",  label: "Help Docs",  icon: "helpBook", iconColor: "#2563eb", size: "lg", commandId: "app:open-help" },
        { id: "shortcuts", label: "Shortcuts",  icon: "keyboard", iconColor: "#374151", size: "lg", commandId: "app:open-help" },
      ],
    },
    {
      id: "settingsGroup", label: "Settings",
      items: [
        { id: "settings", label: "Settings", icon: "settings", iconColor: "#374151", size: "lg", commandId: "app:open-settings" },
        { id: "plugins",  label: "Plugins",  icon: "puzzle",   iconColor: "#7218A5", size: "lg", commandId: "app:open-settings" },
        { id: "themes",   label: "Themes",   icon: "palette",  iconColor: "#ea7c00", size: "lg", commandId: "app:open-settings" },
      ],
    },
    {
      id: "debug", label: "Debug",
      items: [
        { id: "devtools", label: "DevTools", icon: "terminal", iconColor: "#374151", size: "lg", commandId: "app:open-help" },
        { id: "about",    label: "About",    icon: "info",     iconColor: "#6b7280", size: "lg", commandId: "app:open-help" },
      ],
    },
  ],
};
