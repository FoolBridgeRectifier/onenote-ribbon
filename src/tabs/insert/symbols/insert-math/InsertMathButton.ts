import { App } from "obsidian";

/** Renders the Insert Math button and wires its click logic. */
export class InsertMathButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-math");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 7H5l7 5-7 5h13"/>
      </svg>
      <span class="onr-btn-label">Math $$</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange("$$\n\n$$", cursor);
      editor.setCursor({ line: cursor.line + 1, ch: 0 });
    });

    container.appendChild(btn);
  }
}
