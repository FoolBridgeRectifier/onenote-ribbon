import { App } from "obsidian";

/** Renders the Insert Link button and wires its click logic. */
export class InsertLinkButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-link");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <span class="onr-btn-label">Link</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const sel = editor.getSelection();
      const cursor = editor.getCursor();
      if (sel) {
        editor.replaceSelection(`[${sel}]()`);
        const newCursor = editor.getCursor();
        editor.setCursor({ line: newCursor.line, ch: newCursor.ch - 1 });
      } else {
        editor.replaceRange("[]()", cursor);
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
      }
    });

    container.appendChild(btn);
  }
}
