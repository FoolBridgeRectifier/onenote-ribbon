import { App } from "obsidian";
import { toggleInline } from "../../../../shared/toggleInline";

export class UnderlineButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "underline");
    btn.style.cssText =
      "min-height:22px;width:22px;text-decoration:underline;font-size:12px;font-weight:600";
    btn.textContent = "U";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleInline(editor, "<u>", "</u>");
    });
  }
}
