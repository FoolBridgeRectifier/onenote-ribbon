import { App } from "obsidian";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";

const ALIGN_OPTIONS = [
  { label: "Left", value: "left", icon: "☰" },
  { label: "Center", value: "center", icon: "≡" },
  { label: "Right", value: "right", icon: "≡" },
  { label: "Justify", value: "justify", icon: "≡" },
];

export class AlignButton {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "align");
    btn.style.cssText = "min-height:22px;width:26px;flex-direction:row;gap:1px";
    btn.innerHTML = `<svg class="onr-icon-sm" viewBox="0 0 24 24" style="width:10px;height:10px" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg><span style="font-size:8px">▾</span>`;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;

      showDropdown(
        btn,
        ALIGN_OPTIONS.map((opt) => ({
          label: opt.label,
          action: () => {
            if (!editor) return;
            const sel = editor.getSelection();
            if (sel) {
              editor.replaceSelection(
                `<div style="text-align:${opt.value}">${sel}</div>`,
              );
            } else {
              const cursor = editor.getCursor();
              const line = editor.getLine(cursor.line);
              editor.setLine(
                cursor.line,
                `<div style="text-align:${opt.value}">${line}</div>`,
              );
            }
          },
        })),
      );
    });
  }
}
