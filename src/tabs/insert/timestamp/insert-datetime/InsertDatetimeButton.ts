import { App } from "obsidian";

function fmtDate(): string {
  const m = (window as any).moment;
  return m
    ? m().format("YYYY-MM-DD")
    : (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })();
}

function fmtTime(): string {
  const m = (window as any).moment;
  return m
    ? m().format("HH:mm")
    : (() => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      })();
}

/** Renders the Insert Date & Time button and wires its click logic. */
export class InsertDatetimeButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-datetime");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/>
        <path d="M16 2v4M8 2v4M3 10h5"/>
        <circle cx="17.5" cy="17.5" r="4.5"/>
        <polyline points="17.5 15.5 17.5 17.5 19 18.5"/>
      </svg>
      <span class="onr-btn-label">Date &amp; Time</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;
      const cursor = editor.getCursor();
      editor.replaceRange(`${fmtDate()} ${fmtTime()}`, cursor);
    });

    container.appendChild(btn);
  }
}
