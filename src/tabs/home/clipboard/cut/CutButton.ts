import { App } from "obsidian";

export class CutButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "cut");
    btn.style.cssText = "width:68px;flex-direction:row;gap:4px;padding:2px 4px";
    btn.innerHTML = `
      <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
      <span class="onr-btn-label-sm">Cut</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (editor) {
        const sel = editor.getSelection();
        if (sel)
          navigator.clipboard
            .writeText(sel)
            .then(() => editor.replaceSelection(""));
      }
    });
  }
}
