import { App } from "obsidian";

export class FindTagsButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "find-tags");
    btn.style.cssText = "width:46px;min-height:58px";
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
      <span class="onr-btn-label">Find Tags</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      app.commands.executeCommandById("global-search:open");
      setTimeout(() => {
        const leaf = app.workspace.getMostRecentLeaf();
        if (leaf) app.workspace.setActiveLeaf(leaf, { focus: true });
      }, 100);
    });
  }
}
