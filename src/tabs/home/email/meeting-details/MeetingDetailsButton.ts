import { App } from "obsidian";

export class MeetingDetailsButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn");
    btn.setAttribute("data-cmd", "meeting-details");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
      <span class="onr-btn-label">Meeting Details</span>`;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const m = (window as any).moment;
      const now = m ? m() : new Date();
      const date = m
        ? now.format("YYYY-MM-DD")
        : now.toISOString().split("T")[0];
      const time = m
        ? now.format("HH:mm")
        : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const template = `---\ndate: ${date}\ntime: ${time}\nattendees:\n  - \ntopics:\n  - \naction-items:\n  - \n---\n\n## Meeting Notes\n\n`;
      editor.replaceRange(template, editor.getCursor());
    });
  }
}
