import { App } from "obsidian";
import { toggleLinePrefix } from "../../../../shared/toggleLinePrefix";

export class NumberedListButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "numbered-list");
    btn.style.cssText = "min-height:22px;width:22px";
    btn.innerHTML = `<svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h2" stroke="currentColor" stroke-width="1.5"/><path d="M6 14H4l2 2-2 2h2" stroke="currentColor" stroke-width="1.5"/></svg><span style="font-size:7px">▾</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleLinePrefix(editor, "1. ");
    });
  }
}
