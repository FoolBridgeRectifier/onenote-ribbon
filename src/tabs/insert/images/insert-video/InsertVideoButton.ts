import { App } from "obsidian";

/** Renders the Insert Video button and wires its click logic. */
export class InsertVideoButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-video");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
      <span class="onr-btn-label">Video</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const tpl =
        '\n<iframe src="" width="560" height="315" frameborder="0" allowfullscreen></iframe>\n';
      const cursor = editor.getCursor();
      editor.replaceRange(tpl, cursor);
    });

    container.appendChild(btn);
  }
}
