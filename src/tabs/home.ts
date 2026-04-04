import { TabDefinition } from "../types";

export const HOME_TAB: TabDefinition = {
  id: "home",
  label: "Home",
  groups: [
    {
      id: "clipboard", label: "Clipboard",
      items: [
        { id: "paste", label: "Paste", icon: "paste", iconColor: "#2563eb", size: "lg", nativeClipboard: "paste" },
        { id: "cut-copy-row", buttons: [
          { id: "cut",  label: "Cut",  icon: "scissors", iconColor: "#7c3aed", size: "sm", nativeClipboard: "cut" },
          { id: "copy", label: "Copy", icon: "copy",     iconColor: "#2563eb", size: "sm", nativeClipboard: "copy" },
        ]},
      ],
    },
    {
      id: "basicText", label: "Basic Text",
      items: [
        { id: "bold",      label: "Bold",        icon: "bold",      iconColor: "#1e3a8a", size: "fmt", commandId: "editor:toggle-bold" },
        { id: "italic",    label: "Italic",      icon: "italic",    iconColor: "#1d4ed8", size: "fmt", commandId: "editor:toggle-italics" },
        { id: "underline", label: "Underline",   icon: "underline", iconColor: "#1d4ed8", size: "fmt", insertText: "<u></u>" },
        { id: "strike",    label: "Strikethrough", icon: "strike",  iconColor: "#6b7280", size: "fmt", commandId: "editor:toggle-strikethrough" },
        { id: "highlight", label: "Highlight",   icon: "highlight", iconColor: "#d97706", size: "sm",  commandId: "editor:toggle-highlight" },
        { id: "inlineCode",label: "Code",        icon: "code",      iconColor: "#374151", size: "sm",  commandId: "editor:toggle-code" },
        { id: "bullet",    label: "Bullet List", icon: "list",      iconColor: "#059669", size: "sm",  commandId: "editor:toggle-bullet-list" },
        { id: "numbered",  label: "Numbered List",icon: "listNum",  iconColor: "#059669", size: "sm",  commandId: "editor:toggle-numbered-list" },
        { id: "checklist", label: "Checklist",   icon: "listCheck", iconColor: "#7218A5", size: "sm",  commandId: "editor:toggle-checklist-status" },
        { id: "h1",        label: "H1",          icon: "h1",        iconColor: "#7218A5", size: "sm",  commandId: "editor:set-heading" },
        { id: "h2",        label: "H2",          icon: "h2",        iconColor: "#4338ca", size: "sm",  commandId: "editor:set-heading" },
        { id: "h3",        label: "H3",          icon: "h3",        iconColor: "#2563eb", size: "sm",  commandId: "editor:set-heading" },
      ],
    },
    {
      id: "tags", label: "Tags",
      items: [
        { id: "todo",      label: "To Do (Ctrl+1)",  icon: "check",    iconColor: "#7218A5", size: "lg", commandId: "editor:toggle-checklist-status" },
        { id: "important", label: "Important (Ctrl+2)", icon: "star", iconColor: "#ea7c00", size: "lg", insertText: " #important " },
        { id: "question",  label: "Question (Ctrl+3)",  icon: "question", iconColor: "#2563eb", size: "lg", insertText: " #question " },
      ],
    },
    {
      id: "tools", label: "Tools",
      items: [
        { id: "findTags",  label: "Find Tags",        icon: "tag",      iconColor: "#7218A5", size: "md", commandId: "tag-pane:open" },
        { id: "template",  label: "Meeting Template", icon: "template", iconColor: "#0369a1", size: "md", commandId: "templater-obsidian:insert-templater-file", requiresPlugin: "Templater" },
        { id: "spellcheck",label: "Spellcheck",       icon: "spell",    iconColor: "#374151", size: "md", commandId: "editor:toggle-spellcheck" },
      ],
    },
  ],
};
