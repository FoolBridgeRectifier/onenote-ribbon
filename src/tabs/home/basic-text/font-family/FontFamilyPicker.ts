import { App } from "obsidian";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";

const FONT_FAMILIES = [
  "Segoe UI",
  "Arial",
  "Calibri",
  "Cambria",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

export class FontFamilyPicker {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm onr-font-picker");
    btn.setAttribute("data-cmd", "font-family");
    btn.style.cssText =
      "width:96px;flex-direction:row;gap:2px;min-height:22px;padding:1px 4px;border:1px solid #c8c6c4;cursor:pointer";

    const label = btn.createEl("span");
    label.id = "onr-font-label";
    label.style.cssText = "font-size:10px;color:#222";
    label.textContent = "Segoe UI";

    const chevron = btn.createEl("span");
    chevron.style.cssText = "margin-left:auto;font-size:8px;color:#666";
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
        FONT_FAMILIES.map((font) => ({
          label: font,
          style: `font-family:${font}`,
          action: () => {
            label.textContent = font;
            if (editor) {
              const sel = editor.getSelection();
              if (sel) {
                editor.replaceSelection(
                  `<span style="font-family:${font}">${sel}</span>`,
                );
              } else {
                (app.vault as any).setConfig?.("fontText", font);
              }
            }
          },
        })),
      );
    });
  }
}
