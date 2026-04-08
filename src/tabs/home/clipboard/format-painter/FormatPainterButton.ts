import { App } from "obsidian";

export class FormatPainterButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "format-painter");
    btn.style.cssText = "width:68px;flex-direction:row;gap:4px;padding:2px 4px";
    btn.innerHTML = `
      <svg class="onr-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
      <span class="onr-btn-label-sm">Format Painter</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      // Phase 1: capture format from current line
      const isActive = (window as any)._onrFPActive;
      if (isActive) {
        (window as any)._onrFPActive = false;
        (window as any)._onrFP = null;
        btn.classList.remove("onr-active");
        return;
      }
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      const headMatch = line.match(/^(#{1,6})\s/);
      (window as any)._onrFP = {
        headPrefix: headMatch ? headMatch[0] : "",
        isBold: /\*\*(.*?)\*\*/.test(line),
        isItalic: /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(line),
        isUnderline: /<u>/.test(line),
      };
      (window as any)._onrFPActive = true;
      btn.classList.add("onr-active");
    });
  }
}
