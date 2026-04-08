import { App } from "obsidian";

/** Renders the Insert Footnote button and wires its click logic. */
export class InsertFootnoteButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-footnote");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 10 20 15 15 20"/>
        <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
      </svg>
      <span class="onr-btn-label">Footnote</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange("[^1]", cursor);
      const lastLine = editor.lastLine();
      const endPos = { line: lastLine, ch: editor.getLine(lastLine).length };
      editor.replaceRange("\n[^1]: ", endPos);
    });

    container.appendChild(btn);
  }
}
