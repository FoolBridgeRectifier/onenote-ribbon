import { App } from "obsidian";
import { STYLES_LIST } from "../styles-data";
import { StylesDropdown } from "../styles-dropdown/StylesDropdown";

export class StylesScroll {
  constructor(
    private getOffset: () => number,
    private setOffset: (v: number) => void,
    private onUpdate: () => void,
  ) {}

  render(container: HTMLElement, app: App): void {
    const col = container.createDiv();
    col.style.cssText =
      "display:flex;flex-direction:column;justify-content:space-between;padding:2px 1px;gap:2px";

    const up = col.createDiv("onr-btn-sm");
    up.setAttribute("data-cmd", "styles-scroll-up");
    up.style.cssText =
      "width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center";
    up.textContent = "▲";

    const down = col.createDiv("onr-btn-sm");
    down.setAttribute("data-cmd", "styles-scroll-down");
    down.style.cssText =
      "width:16px;min-height:28px;padding:0;font-size:9px;justify-content:center";
    down.textContent = "▼";

    const dropBtn = col.createDiv("onr-btn-sm");
    dropBtn.setAttribute("data-cmd", "styles-dropdown");
    dropBtn.style.cssText =
      "width:16px;min-height:14px;padding:0;font-size:9px;justify-content:center";
    dropBtn.textContent = "▾";

    up.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    up.addEventListener("click", () => {
      const newOffset = Math.max(0, this.getOffset() - 1);
      this.setOffset(newOffset);
      this.onUpdate();
    });

    down.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    down.addEventListener("click", () => {
      const newOffset = Math.min(STYLES_LIST.length - 2, this.getOffset() + 1);
      this.setOffset(newOffset);
      this.onUpdate();
    });

    dropBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    dropBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      StylesDropdown.show(dropBtn, app);
    });
  }
}
