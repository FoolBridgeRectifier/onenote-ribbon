import { App } from "obsidian";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";

export class PasteDropdown {
  render(container: HTMLElement, app: App): void {
    const btn = container.createDiv("onr-btn-sm");
    btn.setAttribute("data-cmd", "paste-dropdown");
    btn.style.cssText =
      "width:46px;border-top:1px solid #d0d0d0;border-radius:0 0 3px 3px;min-height:14px;font-size:9px;justify-content:center";
    btn.textContent = "▾";

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = app.workspace.activeEditor?.editor;
      showDropdown(btn, [
        {
          label: "Paste",
          sublabel: "Ctrl+V",
          action: () => {
            if (editor)
              navigator.clipboard
                .readText()
                .then((t) => editor.replaceSelection(t));
          },
        },
        {
          label: "Paste as Plain Text",
          sublabel: "Ctrl+Shift+V",
          action: () => {
            if (editor)
              navigator.clipboard.readText().then((t) => {
                editor.replaceSelection(
                  t.replace(/<[^>]+>/g, "").replace(/\r\n/g, "\n"),
                );
              });
          },
        },
        { label: "Paste Special...", disabled: true, action: () => {} },
      ]);
    });
  }
}
