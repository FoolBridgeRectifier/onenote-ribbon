import { App } from "obsidian";

function stripInlineMarks(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/__(.+?)__/gs, "$1")
    .replace(/_(.+?)_/gs, "$1")
    .replace(/~~(.+?)~~/gs, "$1")
    .replace(/==(.+?)==/gs, "$1")
    .replace(/<u>(.*?)<\/u>/gs, "$1")
    .replace(/<sub>(.*?)<\/sub>/gs, "$1")
    .replace(/<sup>(.*?)<\/sup>/gs, "$1")
    .replace(/<span[^>]*>(.*?)<\/span>/gs, "$1");
}

export class ClearInlineButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "clear-inline");
    btn.style.cssText = "min-height:22px;width:22px";
    btn.innerHTML = `<svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;

      const sel = editor.getSelection();
      if (sel) {
        editor.replaceSelection(stripInlineMarks(sel));
      } else {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        editor.setLine(cursor.line, stripInlineMarks(line));
      }
    });
  }
}
