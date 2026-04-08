import { App } from "obsidian";
import { ALL_TAGS, tagNotation } from "../tags-data";
import { applyTag } from "../tag-apply/applyTag";
import { showDropdown } from "../../../../shared/dropdown/Dropdown";

export class TagsDropdown {
  static show(anchor: HTMLElement, app: App): void {
    const editor = app.workspace.activeEditor?.editor;

    document
      .querySelectorAll(".onr-overlay-dropdown")
      .forEach((el) => el.remove());

    const menu = document.createElement("div");
    menu.className = "onr-overlay-dropdown";
    Object.assign(menu.style, {
      position: "fixed",
      background: "#1a1a1a",
      border: "1px solid #555",
      borderRadius: "2px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      zIndex: "99999",
      minWidth: "220px",
      padding: "2px 0",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontSize: "12px",
      maxHeight: "420px",
      overflowY: "auto",
    });

    for (const tag of ALL_TAGS) {
      const row = document.createElement("div");
      row.className = "onr-dd-item";
      Object.assign(row.style, {
        padding: "4px 8px",
        cursor: "pointer",
        color: "#e0e0e0",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      });

      const iconEl = document.createElement("span");
      iconEl.textContent = tag.icon;
      iconEl.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:2px;font-size:10px;flex-shrink:0;${tag.iconStyle}`;

      const labelEl = document.createElement("span");
      labelEl.textContent = tag.label;
      labelEl.style.cssText = "flex:1;font-size:11px";

      // Checkbox swatch (visual state)
      const check = document.createElement("div");
      check.style.cssText =
        "width:16px;height:16px;border:1px solid #666;background:#333;flex-shrink:0;border-radius:1px;display:flex;align-items:center;justify-content:center";

      // Check if current line has this tag active
      if (editor) {
        const lineText = editor.getLine(editor.getCursor().line);
        const notation = tagNotation(tag.cmd);
        if (notation && lineText.includes(notation.split("\n")[0].trim())) {
          check.style.background = "#4472C4";
          check.innerHTML =
            '<svg viewBox="0 0 12 12" style="width:10px;height:10px"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none"/></svg>';
        }
      }

      row.appendChild(iconEl);
      row.appendChild(labelEl);
      row.appendChild(check);

      row.addEventListener("mouseenter", () => {
        row.style.background = "#2a2a3e";
      });
      row.addEventListener("mouseleave", () => {
        row.style.background = "";
      });
      row.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.remove();
        if (editor) applyTag(tag.cmd, editor);
      });

      menu.appendChild(row);
    }

    // Divider + Customize Tags
    const div = document.createElement("div");
    div.style.cssText = "border-top:1px solid #555;margin:2px 0";
    menu.appendChild(div);

    const customRow = document.createElement("div");
    customRow.style.cssText =
      "padding:5px 8px;cursor:pointer;color:#888;font-size:11px;display:flex;align-items:center;gap:6px";
    customRow.innerHTML =
      '<span style="font-size:13px">🔧</span> Customize Tags...';
    customRow.addEventListener("click", () => {
      // Use shared showDropdown to surface a "not yet implemented" notice
      showDropdown(
        anchor,
        [
          {
            label: "Customize Tags: not yet implemented",
            disabled: true,
            action: () => {},
          },
        ],
        { bg: "#1a1a1a", hoverBg: "#1a1a1a", color: "#888" },
      );
    });
    menu.appendChild(customRow);

    document.body.appendChild(menu);

    const rect = anchor.getBoundingClientRect();
    let top = rect.bottom + 2;
    let left = rect.left;
    if (top + 420 > window.innerHeight)
      top = Math.max(4, window.innerHeight - 424);
    if (left + 224 > window.innerWidth) left = window.innerWidth - 228;
    menu.style.top = top + "px";
    menu.style.left = left + "px";

    const close = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener("click", close, true);
      }
    };
    setTimeout(() => document.addEventListener("click", close, true), 0);
  }
}
