import { useEffect, useRef } from "react";
import "./Dropdown.css";
import { createPortal } from "react-dom";
import type { DropdownItem } from "../dropdown/Dropdown";

interface Props {
  anchor: HTMLElement | null;
  items: DropdownItem[];
  onClose: () => void;
}

export function Dropdown({ anchor, items, onClose }: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchor) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !anchor.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () =>
      document.removeEventListener("click", handleDocumentClick, true);
  }, [anchor, onClose]);

  if (!anchor) return null;

  const rect = anchor.getBoundingClientRect();
  const top = rect.bottom + 4;
  const left = Math.max(0, rect.left);

  return createPortal(
    <div
      ref={dropdownRef}
      className="onr-overlay-dropdown"
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="onr-dd-item"
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon && <span className="onr-dd-icon">{item.icon}</span>}
          <div className="onr-dd-content">
            <div className="onr-dd-label">{item.label}</div>
            {item.sublabel && (
              <div className="onr-dd-sublabel">{item.sublabel}</div>
            )}
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}

export { parseCssString } from "../dropdown/Dropdown";
