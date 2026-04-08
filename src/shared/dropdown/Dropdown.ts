export interface DropdownItem {
  label: string;
  sublabel?: string;
  style?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownOpts {
  bg?: string;
  hoverBg?: string;
  color?: string;
}

export function showDropdown(
  anchor: HTMLElement,
  items: DropdownItem[],
  opts?: DropdownOpts,
): void {
  // Remove any existing dropdown
  document
    .querySelectorAll(".onr-overlay-dropdown")
    .forEach((el) => el.remove());

  const menu = document.createElement("div");
  menu.className = "onr-overlay-dropdown";

  const menuBg = opts?.bg ?? "#fff";
  const hoverBg = opts?.hoverBg ?? "#f0eeec";
  const textColor = opts?.color ?? "#201f1e";

  // Determine scrolling — large menus get max-height + scroll
  const needsScroll = items.length > 15;
  Object.assign(menu.style, {
    position: "fixed",
    background: menuBg,
    border: "1px solid #c8c6c4",
    borderRadius: "2px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    zIndex: "99999",
    minWidth: "160px",
    padding: "2px 0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    fontSize: "12px",
    ...(needsScroll ? { maxHeight: "340px", overflowY: "auto" } : {}),
  });

  for (const item of items) {
    if (item.divider) {
      const div = document.createElement("div");
      Object.assign(div.style, {
        borderTop: "1px solid #e1dfdd",
        margin: "2px 0",
      });
      menu.appendChild(div);
      continue;
    }
    const row = document.createElement("div");
    row.className = "onr-dd-item";
    Object.assign(row.style, {
      padding: "5px 12px",
      cursor: item.disabled ? "default" : "pointer",
      color: item.disabled ? "#a19f9d" : textColor,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      whiteSpace: "nowrap",
    });
    if (item.style)
      row.setAttribute("style", row.getAttribute("style") + ";" + item.style);
    row.textContent = item.label;
    if (item.sublabel) {
      const sub = document.createElement("span");
      sub.textContent = item.sublabel;
      sub.style.cssText =
        "font-size:10px;color:#605e5c;margin-left:auto;padding-left:16px";
      row.appendChild(sub);
    }
    if (!item.disabled) {
      row.addEventListener("mouseenter", () => {
        row.style.background = hoverBg;
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
        item.action();
      });
    }
    menu.appendChild(row);
  }

  document.body.appendChild(menu);

  // Position below anchor
  const rect = anchor.getBoundingClientRect();
  let top = rect.bottom + 2;
  let left = rect.left;

  // Clamp within viewport
  const mh = needsScroll ? 340 : menu.scrollHeight || 200;
  if (top + mh > window.innerHeight) top = rect.top - mh - 2;
  if (left + 200 > window.innerWidth) left = window.innerWidth - 204;

  menu.style.top = top + "px";
  menu.style.left = left + "px";

  // Close on outside click
  const close = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("click", close, true);
    }
  };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}
