import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { HTMLAttributes, ReactNode } from 'react';
import type { DropdownItem } from './interfaces.ts';

import './Dropdown.css';

type DropdownProps = {
  anchor: HTMLElement | null;
  items?: DropdownItem[];
  onClose: () => void;
  children?: ReactNode;
  offsetY?: number;
  offsetX?: number;
  constrainLeftToViewport?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'style'>;

export function Dropdown({
  anchor,
  items = [],
  onClose,
  children,
  offsetY = 4,
  offsetX = 0,
  constrainLeftToViewport = true,
  className,
  ...restProps
}: DropdownProps) {
  const dropdownElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchor) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        dropdownElementRef.current &&
        !dropdownElementRef.current.contains(event.target as Node) &&
        !anchor.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () =>
      document.removeEventListener('click', handleDocumentClick, true);
  }, [anchor, onClose]);

  if (!anchor) return null;

  const anchorRect = anchor.getBoundingClientRect();
  const top = anchorRect.bottom + offsetY;
  const initialLeft = anchorRect.left + offsetX;
  const left = constrainLeftToViewport ? Math.max(0, initialLeft) : initialLeft;

  const baseClassName = 'onr-overlay-dropdown';
  const extraClassName = className ? ` ${className}` : '';
  const combinedClassName = baseClassName + extraClassName;

  const handleItemClick = (dropdownItem: DropdownItem) => {
    dropdownItem.onClick();
    onClose();
  };

  // Prevent mousedown from stealing focus from the editor.
  // Without this, clicking any dropdown element blurs the editor
  // and collapses the selection before the click handler runs.
  const preventEditorBlur = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return createPortal(
    <div
      ref={dropdownElementRef}
      className={combinedClassName}
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
      onMouseDown={preventEditorBlur}
      {...restProps}
    >
      {children ??
        items.map((dropdownItem, index) => (
          <div
            key={index}
            className="onr-dd-item"
            onClick={() => handleItemClick(dropdownItem)}
          >
            {dropdownItem.icon && (
              <span className="onr-dd-icon">{dropdownItem.icon}</span>
            )}
            <div className="onr-dd-content">
              <div className="onr-dd-label">{dropdownItem.label}</div>
              {dropdownItem.sublabel && (
                <div className="onr-dd-sublabel">{dropdownItem.sublabel}</div>
              )}
            </div>
          </div>
        ))}
    </div>,
    document.body,
  );
}
