import { App, Notice } from "obsidian";

/** Renders the Insert Template button and wires its click logic. */
export class InsertTemplateButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-template");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="5" rx="1"/>
        <rect x="3" y="12" width="4" height="9" rx="1"/>
        <rect x="11" y="12" width="10" height="9" rx="1"/>
      </svg>
      <span class="onr-btn-label">Template</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const result = app.commands.executeCommandById("insert-template");
      if (!result) {
        new Notice(
          "Enable the Templates or Templater plugin to use this feature",
        );
      }
    });

    container.appendChild(btn);
  }
}
