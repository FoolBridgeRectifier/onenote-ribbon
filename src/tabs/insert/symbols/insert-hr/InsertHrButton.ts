import { App } from "obsidian";

/** Renders the Insert Horizontal Rule button and wires its click logic. */
export class InsertHrButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-hr");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span class="onr-btn-label">Horizontal Rule</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange("\n---\n", cursor);
    });

    container.appendChild(btn);
  }
}
