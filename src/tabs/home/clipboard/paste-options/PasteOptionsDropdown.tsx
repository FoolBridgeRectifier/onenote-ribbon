import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./PasteOptionsDropdown.css";

export interface PasteOption {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

interface Props {
  anchor: HTMLElement | null;
  options: PasteOption[];
  onClose: () => void;
}

export function PasteOptionsDropdown({ anchor, options, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchor) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
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
  const top = rect.bottom + 2;
  const left = rect.left;

  return createPortal(
    <div
      ref={panelRef}
      className="onr-paste-options-panel"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <div className="onr-paste-options-header">Paste Options:</div>
      <div className="onr-paste-options-row">
        {options.map((option, index) => (
          <button
            key={index}
            className="onr-paste-option-btn"
            title={option.title}
            onClick={() => {
              option.onClick();
              onClose();
            }}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
