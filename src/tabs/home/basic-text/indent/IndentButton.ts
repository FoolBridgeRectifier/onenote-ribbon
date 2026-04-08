import { App } from "obsidian";

export class IndentButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "indent");
    btn.style.cssText = "min-height:22px;width:22px";
    btn.innerHTML = `<svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 8 21 12 17 16"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="13" y2="6"/><line x1="3" y1="18" x2="13" y2="18"/></svg>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      app.commands.executeCommandById("editor:indent-list");
    });
  }
}
