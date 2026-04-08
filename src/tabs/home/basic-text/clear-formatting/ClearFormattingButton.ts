import { App } from "obsidian";

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

export class ClearFormattingButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "clear-formatting");
    btn.style.cssText = "min-height:22px;width:22px";
    btn.innerHTML = `<svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>`;

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
        const stripped = stripInlineMarks(sel.replace(/^#{1,6} /m, ""));
        editor.replaceSelection(stripped);
      } else {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const stripped = stripInlineMarks(line.replace(/^#{1,6} /, ""));
        editor.setLine(cursor.line, stripped);
      }
    });
  }
}
