import { App } from "obsidian";
import { toggleInline } from "../../../../shared/toggleInline";

export class BoldButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "bold");
    btn.style.cssText =
      "min-height:22px;width:22px;font-weight:700;font-size:13px";
    btn.textContent = "B";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleInline(editor, "**");
    });
  }
}
