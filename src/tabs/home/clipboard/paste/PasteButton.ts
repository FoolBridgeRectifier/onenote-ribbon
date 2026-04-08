import { App } from "obsidian";

export class PasteButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "paste");
    btn.style.cssText =
      "width:46px;min-height:46px;border-bottom:none;border-radius:3px 3px 0 0";
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" style="width:24px;height:24px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1"/>
        <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1"/>
        <polyline points="9 14 12 17 15 14"/>
        <line x1="12" y1="10" x2="12" y2="17"/>
      </svg>
      <span class="onr-btn-label">Paste</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        navigator.clipboard
          .readText()
          .then((text) => {
            editor.replaceSelection(text);
          })
          .catch(() => {
            const el =
              (editor as any).cm?.dom ?? document.querySelector(".cm-content");
            if (el) {
              el.focus();
              document.execCommand("paste");
            }
          });
      }
    });
  }
}
