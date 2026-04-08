import { App } from "obsidian";
import { toggleSubSup } from "../../../../shared/toggleSubSup";

export class SuperscriptButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "superscript");
    btn.style.cssText = "min-height:22px;width:22px;font-size:10px";
    btn.innerHTML = `x<sup style="font-size:7px">2</sup>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleSubSup(editor, "sup");
    });
  }
}
