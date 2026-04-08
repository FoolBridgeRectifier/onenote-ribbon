import { App } from "obsidian";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";

const FONT_SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
  "32",
  "36",
  "48",
  "72",
];

export class FontSizePicker {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm onr-font-picker");
    btn.setAttribute("data-cmd", "font-size");
    btn.style.cssText =
      "width:34px;flex-direction:row;min-height:22px;padding:1px 4px;border:1px solid #c8c6c4;cursor:pointer";

    const label = btn.createEl("span");
    label.id = "onr-size-label";
    label.style.cssText = "font-size:10px;color:#222";
    label.textContent = "16";

    const chevron = btn.createEl("span");
    chevron.style.cssText = "font-size:8px;color:#666";
    chevron.textContent = "▾";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;

      showDropdown(
        btn,
        FONT_SIZES.map((size) => ({
          label: size,
          action: () => {
            label.textContent = size;
            if (editor) {
              const sel = editor.getSelection();
              if (sel) {
                editor.replaceSelection(
                  `<span style="font-size:${size}px">${sel}</span>`,
                );
              } else {
                (app.vault as any).setConfig?.("fontSize", parseInt(size));
              }
            }
          },
        })),
      );
    });
  }
}
