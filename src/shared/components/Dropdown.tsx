import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

import { DropdownItem, DropdownOpts } from '../dropdown/Dropdown';

interface Props {
  anchor: HTMLElement | null;
  items: DropdownItem[];
  opts?: DropdownOpts;
  onClose: () => void;
}

export function Dropdown({ anchor, items, opts, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const estimatedMaxHeight = items.length > 15 ? 340 : 200;

    let top  = rect.bottom + 2;
    let left = rect.left;

    if (top + estimatedMaxHeight > window.innerHeight) top = rect.top - estimatedMaxHeight - 2;
    if (left + 200 > window.innerWidth) left = window.innerWidth - 204;

    setPos({ top, left });
  }, [anchor]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => document.addEventListener('click', handleOutsideClick, true), 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOutsideClick, true);
    };
  }, [onClose]);

  const bg      = opts?.bg      ?? '#fff';
  const hoverBg = opts?.hoverBg ?? '#f0eeec';
  const color   = opts?.color   ?? '#201f1e';
  const needsScroll = items.length > 15;

  return createPortal(
    <div
      ref={menuRef}
      className="onr-overlay-dropdown"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        background: bg,
        color,
        border: '1px solid #c8c6c4',
        borderRadius: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        zIndex: 99999,
        minWidth: 160,
        padding: '2px 0',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: 12,
        ...(needsScroll ? { maxHeight: 340, overflowY: 'auto' } : {}),
      }}
    >
      {items.map((item, index) =>
        item.divider ? (
          <div key={index} style={{ borderTop: '1px solid #e1dfdd', margin: '2px 0' }} />
        ) : (
          <DropdownRow key={index} item={item} hoverBg={hoverBg} color={color} onClose={onClose} />
        )
      )}
    </div>,
    document.body
  );
}

function DropdownRow({ item, hoverBg, color, onClose }: {
  item: DropdownItem; hoverBg: string; color: string; onClose: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="onr-dd-item"
      style={{
        padding: '5px 12px',
        cursor: item.disabled ? 'default' : 'pointer',
        color: item.disabled ? '#a19f9d' : color,
        background: hover && !item.disabled ? hoverBg : '',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        ...(item.style ? parseCssString(item.style) : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={event => event.preventDefault()}
      onClick={event => {
        if (item.disabled) return;
        event.stopPropagation();
        onClose();
        item.action();
      }}
    >
      {item.label}
      {item.sublabel && (
        <span style={{ fontSize: 10, color: '#605e5c', marginLeft: 'auto', paddingLeft: 16 }}>
          {item.sublabel}
        </span>
      )}
    </div>
  );
}

export function parseCssString(css: string): React.CSSProperties {
  const result: Record<string, string> = {};
  css.split(';').forEach(rule => {
    const [key, value] = rule.split(':');
    if (key && value) result[key.trim().replace(/-([a-z])/g, (_, lowerChar) => lowerChar.toUpperCase())] = value.trim();
  });
  return result as React.CSSProperties;
}
