import { App } from "obsidian";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";
import { STYLES_LIST } from "../styles-data";

function stripInlineMarks(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/__(.+?)__/gs, "$1")
    .replace(/_(.+?)_/gs, "$1")
    .replace(/~~(.+?)~~/gs, "$1")
    .replace(/==(.+?)==/gs, "$1")
    .replace(/`(.+?)`/gs, "$1")
    .replace(/<u>(.*?)<\/u>/gs, "$1")
    .replace(/<sub>(.*?)<\/sub>/gs, "$1")
    .replace(/<sup>(.*?)<\/sup>/gs, "$1")
    .replace(/<span[^>]*>(.*?)<\/span>/gs, "$1");
}

export class StylesDropdown {
  static show(anchor: HTMLElement, app: App): void {
    const items = STYLES_LIST.map((s) => ({
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
    }));

    items.push({ label: "", style: "", action: () => {}, divider: true } as any);
    items.push({
      label: "Clear Formatting",
      action: () => {
        const editor = app.workspace.activeEditor?.editor;
        if (!editor) return;
        const sel = editor.getSelection();
        if (sel) {
          editor.replaceSelection(stripInlineMarks(sel.replace(/^#{1,6} /m, "")));
        } else {
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          editor.setLine(cursor.line, stripInlineMarks(line.replace(/^#{1,6} /, "")));
        }
      },
    });

    showDropdown(anchor, items, { bg: "#1a1a2e", hoverBg: "#2a2a3e", color: "#e0e0e0" });
  }
}
