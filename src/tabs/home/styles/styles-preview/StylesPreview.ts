import { App } from "obsidian";
import { STYLES_LIST } from "../styles-data";
import { StylesDropdown } from "../styles-dropdown/StylesDropdown";

export class StylesPreview {
  constructor(
    private getOffset: () => number,
    private setOffset: (v: number) => void,
  ) {}

  render(container: HTMLElement, app: App, panel: HTMLElement): void {
    const col = container.createDiv();
    col.style.cssText =
      "display:flex;flex-direction:column;gap:2px;width:130px";

    for (const i of [0, 1]) {
      const s = STYLES_LIST[this.getOffset() + i] ?? STYLES_LIST[i];
      const card = col.createDiv("onr-btn-sm");
      card.setAttribute("data-cmd", `styles-preview-${i}`);
      card.style.cssText =
        "width:130px;min-height:28px;background:#1a1a2e;border:1px solid #555;border-radius:2px;flex-direction:row;justify-content:flex-start;padding:2px 8px";

      const span = card.createEl("span");
      span.setAttribute("data-styles-text", String(i));
      span.style.cssText = s.style;
      span.textContent = s.label;

      card.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const editor = app.workspace.activeEditor?.editor;
        if (!editor) return;
        const item = STYLES_LIST[this.getOffset() + i];
        if (!item) return;
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const stripped = line.replace(/^#{1,6}\s+/, "");
        if (item.prefix) editor.setLine(cursor.line, item.prefix + stripped);
        else editor.setLine(cursor.line, stripped);
      });
    }
  }

  refresh(panel: HTMLElement): void {
    [0, 1].forEach((i) => {
      const card = panel.querySelector(
        `[data-cmd="styles-preview-${i}"]`,
      ) as HTMLElement;
      if (!card) return;
      const item = STYLES_LIST[this.getOffset() + i];
      if (!item) {
        card.style.display = "none";
        return;
      }
      card.style.display = "";
      const span = card.querySelector("span") as HTMLElement;
      if (span) {
        span.textContent = item.label;
        span.style.cssText = item.style;
      }
    });
  }
}
