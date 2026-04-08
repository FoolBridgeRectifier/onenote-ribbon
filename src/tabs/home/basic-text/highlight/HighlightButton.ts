import { App } from "obsidian";
import { toggleInline } from "../../../../shared/toggleInline";

export class HighlightButton {
  render(container: HTMLElement, app: App): void {
    const wrapper = container.createDiv();
    wrapper.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:0";

    const btn = wrapper.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "highlight");
    btn.style.cssText = "min-height:18px;width:26px;padding:1px 2px";
    btn.innerHTML = `<svg class="onr-icon-sm" viewBox="0 0 24 24" style="width:12px;height:12px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-6 6v3h3l6-6"/><path d="M22 5.54a2 2 0 0 0-2.83-2.83l-11.3 11.3 2.83 2.83L22 5.54z"/></svg><div id="onr-highlight-swatch" style="width:14px;height:3px;background:#FFFF00;border:1px solid #ccc;margin-top:1px"></div>`;

    const chevron = wrapper.createDiv();
    chevron.style.cssText = "font-size:7px;color:#666;line-height:1";
    chevron.textContent = "▾";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) toggleInline(editor, "==");
    });
  }
}
