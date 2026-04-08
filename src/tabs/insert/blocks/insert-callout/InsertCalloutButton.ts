import { App } from "obsidian";
import { CalloutPicker } from "./callout-picker/CalloutPicker";

/** Renders the Insert Callout button and wires its click logic. */
export class InsertCalloutButton {
  render(container: HTMLElement, app: App): void {
    const btn = document.createElement("div");
    btn.className = "onr-btn";
    btn.setAttribute("data-cmd", "insert-callout");
    btn.innerHTML = `
      <svg class="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11l19-9v18L3 13"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
      </svg>
      <span class="onr-btn-label">Callout</span>`;

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      CalloutPicker.show(btn, editor);
    });

    container.appendChild(btn);
  }
}
