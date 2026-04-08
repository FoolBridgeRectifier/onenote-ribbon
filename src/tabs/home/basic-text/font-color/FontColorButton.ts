import { App } from "obsidian";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";

const COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Dark Red", value: "#C00000" },
  { label: "Red", value: "#FF0000" },
  { label: "Orange", value: "#FF8C00" },
  { label: "Yellow", value: "#FFFF00" },
  { label: "Light Green", value: "#92D050" },
  { label: "Green", value: "#00B050" },
  { label: "Light Blue", value: "#00B0F0" },
  { label: "Blue", value: "#0070C0" },
  { label: "Dark Blue", value: "#003399" },
  { label: "Purple", value: "#7030A0" },
  { label: "White", value: "#FFFFFF" },
];

export class FontColorButton {
  render(container: HTMLElement, app: App): void {
    const wrapper = container.createDiv();
    wrapper.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:0";

    const btn = wrapper.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "font-color");
    btn.style.cssText = "min-height:18px;width:22px;padding:1px 2px";
    btn.innerHTML = `<span style="font-size:12px;font-weight:700;color:#222;line-height:1">A</span><div id="onr-color-swatch" style="width:14px;height:3px;background:#FF0000;border:1px solid #ccc;margin-top:1px"></div>`;

    const chevron = wrapper.createDiv();
    chevron.style.cssText = "font-size:7px;color:#666;line-height:1";
    chevron.textContent = "▾";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      const swatch = document.getElementById("onr-color-swatch");

      showDropdown(
        btn,
        COLORS.map((c) => ({
          label: c.label,
          style: `color:${c.value};font-weight:600`,
          action: () => {
            if (swatch) swatch.style.background = c.value;
            if (editor) {
              const sel = editor.getSelection();
              if (sel) {
                editor.replaceSelection(
                  `<span style="color:${c.value}">${sel}</span>`,
                );
              }
            }
          },
        })),
      );
    });
  }
}
