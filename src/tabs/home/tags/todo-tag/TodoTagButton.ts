import { App } from "obsidian";
import { toggleLinePrefix } from "../../../../shared/toggleLinePrefix";

export class TodoTagButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "todo-tag");
    btn.style.cssText = "width:46px;min-height:58px";
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="12" y1="9" x2="12" y2="15"/>
      </svg>
      <span class="onr-btn-label">To Do Tag</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleLinePrefix(editor, "- [ ] ");
    });
  }
}
