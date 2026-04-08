import { App } from "obsidian";
import { toggleInline } from "../../../../shared/toggleInline";

export class ItalicButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "italic");
    btn.style.cssText =
      "min-height:22px;width:22px;font-style:italic;font-size:13px";
    btn.textContent = "I";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleInline(editor, "*");
    });
  }
}
