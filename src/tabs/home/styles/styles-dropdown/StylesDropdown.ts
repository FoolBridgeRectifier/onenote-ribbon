import { App } from "obsidian";
import { showDropdown } from "../../../shared/dropdown/Dropdown";
import { STYLES_LIST } from "../styles-data";

export class StylesDropdown {
  static show(anchor: HTMLElement, app: App): void {
    showDropdown(
      anchor,
      STYLES_LIST.map((s) => ({
        label: s.label,
        style: s.style,
        action: () => {
          const editor = app.workspace.activeEditor?.editor;
          if (!editor) return;
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          const stripped = line.replace(/^#{1,6}\s+/, "");
          if (s.prefix) editor.setLine(cursor.line, s.prefix + stripped);
          else editor.setLine(cursor.line, stripped);
        },
      })),
      { bg: "#1a1a2e", hoverBg: "#2a2a3e", color: "#e0e0e0" },
    );
  }
}
