import { TabDefinition } from "../types";

export const INSERT_TAB: TabDefinition = {
  id: "insert",
  label: "Insert",
  groups: [
    {
      id: "tables", label: "Tables",
      items: [
        { id: "table", label: "Table", icon: "table", iconColor: "#2563eb", size: "lg", commandId: "editor:insert-table" },
      ],
    },
    {
      id: "files", label: "Files",
      items: [
        { id: "picture",  label: "Picture",      icon: "image",      iconColor: "#2563eb", size: "lg", insertText: "![[]]" },
        { id: "video",    label: "Embed Video",  icon: "video",      iconColor: "#7c3aed", size: "lg", insertText: "![]()" },
        { id: "attach",   label: "Attach File",  icon: "paperclip",  iconColor: "#6b7280", size: "lg", commandId: "editor:attach-file" },
      ],
    },
    {
      id: "links", label: "Links",
      items: [
        { id: "link",     label: "Link",      icon: "link",     iconColor: "#2563eb", size: "lg", commandId: "editor:insert-link" },
        { id: "wikilink", label: "Wiki Link", icon: "wikilink", iconColor: "#7218A5", size: "lg", insertText: "[[]]" },
        { id: "footnote", label: "Footnote",  icon: "footnote", iconColor: "#6b7280", size: "lg", commandId: "editor:insert-footnote" },
      ],
    },
    {
      id: "blocks", label: "Blocks",
      items: [
        { id: "codeBlock",  label: "Code Block",  icon: "codeBlock", iconColor: "#374151", size: "lg", commandId: "editor:insert-codeblock" },
        { id: "blockquote", label: "Blockquote",  icon: "quote",     iconColor: "#6b7280", size: "lg", commandId: "editor:toggle-blockquote" },
        { id: "callout",    label: "Callout",     icon: "callout",   iconColor: "#d97706", size: "lg", insertText: "> [!NOTE]\n> " },
        { id: "divider",    label: "Divider",     icon: "minus",     iconColor: "#374151", size: "lg", insertText: "\n---\n" },
        { id: "mathBlock",  label: "Math Block",  icon: "pi",        iconColor: "#7218A5", size: "lg", insertText: "$$\n\n$$" },
      ],
    },
    {
      id: "timestamp", label: "Time Stamp",
      items: [
        { id: "date", label: "Date", icon: "calendar", iconColor: "#2563eb", size: "lg", insertText: "__DATE__" },
        { id: "time", label: "Time", icon: "clock",    iconColor: "#2563eb", size: "lg", insertText: "__TIME__" },
      ],
    },
    {
      id: "pages", label: "Pages",
      items: [
        { id: "templates", label: "Templates", icon: "template", iconColor: "#2563eb", size: "lg", commandId: "templater-obsidian:open-insert-template-modal", requiresPlugin: "Templater" },
      ],
    },
    {
      id: "new", label: "New",
      items: [
        { id: "newNote",   label: "New Note",   icon: "filePlus",   iconColor: "#059669", size: "lg", commandId: "file-explorer:new-file" },
        { id: "newFolder", label: "New Folder", icon: "folderPlus", iconColor: "#f59e0b", size: "lg", commandId: "file-explorer:new-folder" },
      ],
    },
  ],
};
