const CALLOUT_TYPES = [
  "note",
  "abstract",
  "info",
  "tip",
  "success",
  "question",
  "warning",
  "failure",
  "danger",
  "bug",
  "example",
  "quote",
];

/** Dropdown picker for selecting a callout type and inserting it at the cursor. */
export class CalloutPicker {
  static show(anchor: HTMLElement, editor: any): void {
    // Remove any existing picker
    document.querySelector(".onr-callout-picker")?.remove();

    const picker = document.createElement("div");
    picker.className = "onr-callout-picker";
    Object.assign(picker.style, {
      position: "fixed",
      background: "#fff",
      border: "1px solid #c8c6c4",
      borderRadius: "4px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      padding: "4px",
      display: "flex",
      flexWrap: "wrap",
      gap: "2px",
      maxWidth: "260px",
      zIndex: "10000",
    });

    CALLOUT_TYPES.forEach((type) => {
      const btn = document.createElement("div");
      btn.textContent = type;
      Object.assign(btn.style, {
        padding: "3px 8px",
        fontSize: "11px",
        cursor: "pointer",
        borderRadius: "3px",
        border: "1px solid #e1dfdd",
        whiteSpace: "nowrap",
      });
      btn.addEventListener(
        "mouseenter",
        () => (btn.style.background = "#f0eeec"),
      );
      btn.addEventListener("mouseleave", () => (btn.style.background = ""));
      btn.addEventListener("click", () => {
        picker.remove();
        if (editor) {
          const cursor = editor.getCursor();
          editor.replaceRange(`> [!${type}]\n> `, cursor);
        }
      });
      picker.appendChild(btn);
    });

    // Position below the anchor button
    const rect = anchor.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 4}px`;
    picker.style.left = `${rect.left}px`;

    document.body.appendChild(picker);

    // Close on outside click
    const close = (e: MouseEvent) => {
      if (!picker.contains(e.target as Node)) {
        picker.remove();
        document.removeEventListener("click", close, true);
      }
    };
    setTimeout(() => document.addEventListener("click", close, true), 0);
  }
}
