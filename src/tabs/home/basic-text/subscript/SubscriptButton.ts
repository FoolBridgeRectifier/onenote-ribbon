import { App } from "obsidian";
import { toggleSubSup } from "../../../../shared/toggleSubSup";

export class SubscriptButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "subscript");
    btn.style.cssText = "min-height:22px;width:22px;font-size:10px";
    btn.innerHTML = `x<sub style="font-size:7px">2</sub>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleSubSup(editor, "sub");
    });
  }
}
