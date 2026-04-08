import { App } from "obsidian";

/** Renders the Insert Wikilink button and wires its click logic. */
export class InsertWikilinkButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-wikilink");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M2 15h10"/><path d="M9 12l3 3-3 3"/>
      </svg>
      <span class="onr-btn-label">[[Wikilink]]</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange("[[]]", cursor);
      editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
    });

    container.appendChild(btn);
  }
}
