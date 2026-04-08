import { App } from "obsidian";
import { toggleInline } from "../../../../shared/toggleInline";

export class StrikethroughButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "strikethrough");
    btn.style.cssText = "min-height:22px;width:22px";
    btn.innerHTML = `<s style="font-size:11px">ab</s>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleInline(editor, "~~");
    });
  }
}
