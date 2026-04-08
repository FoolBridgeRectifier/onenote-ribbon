import { App } from "obsidian";

/** Renders the Insert Table button and wires its click logic. */
export class InsertTableButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-table");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
      </svg>
      <span class="onr-btn-label">Table</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange(
        "\n| col | col | col |\n|---|---|---|\n| | | |\n",
        cursor,
      );
    });

    container.appendChild(btn);
  }
}
