import { App } from "obsidian";
import { TagDef, tagNotation } from "../tags-data";
import { applyTag } from "../tag-apply/applyTag";

export class TagRow {
  constructor(private tag: TagDef) {}

  render(container: HTMLElement, app: App): HTMLElement {
    const row = container.createDiv("onr-btn-sm onr-tag-row");
    row.setAttribute("data-cmd", this.tag.cmd);
    row.style.cssText =
      "width:150px;min-height:20px;flex-direction:row;gap:4px;padding:1px 6px;justify-content:flex-start";

    const icon = row.createEl("span");
    icon.textContent = this.tag.icon;
    icon.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border-radius:2px;font-size:9px;flex-shrink:0;${this.tag.iconStyle}`;

    const label = row.createEl("span");
    label.className = "onr-tag-label";
    label.textContent = this.tag.label;
    label.style.cssText = "font-size:10px;color:#222";

    const check = row.createDiv("onr-tag-check");
    check.style.cssText =
      "width:14px;height:14px;border:1px solid #999;margin-left:auto;background:#fff;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center";

    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) applyTag(this.tag.cmd, editor);
    });

    return row;
  }

  updateCheck(row: HTMLElement, editor: any): void {
    const check = row.querySelector(".onr-tag-check") as HTMLElement;
    if (!check || !editor) return;
    const lineText = editor.getLine(editor.getCursor().line);
    const notation = tagNotation(this.tag.cmd);
    const isActive =
      notation && lineText.includes(notation.split("\n")[0].trim());
    check.style.background = isActive ? "#4472C4" : "#fff";
    check.innerHTML = isActive
      ? '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>'
      : "";
  }
}
