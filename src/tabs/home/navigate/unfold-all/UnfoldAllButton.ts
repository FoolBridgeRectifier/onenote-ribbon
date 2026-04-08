import { App } from "obsidian";
export class UnfoldAllButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "unfold-all");
    btn.innerHTML = `<svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 6 5 9 8"/><polyline points="3 16 6 19 9 16"/><line x1="21" y1="8" x2="6" y2="8"/><line x1="21" y1="16" x2="6" y2="16"/></svg><span class="onr-btn-label">Unfold All</span>`;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      app.commands.executeCommandById("editor:unfold-all");
    });
  }
}
