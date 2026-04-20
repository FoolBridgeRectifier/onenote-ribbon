import { useState } from 'react';
import { Dropdown } from '../dropdown/Dropdown';
import './color-picker.css';
import type { ColorPickerProps } from './interfaces';
import { COLOR_PALETTE } from './constants';

export function ColorPicker({
  anchor,
  selectedColor,
  onColorSelect,
  onNoColor,
  onClose,
  label = 'Color',
}: ColorPickerProps) {
  const [customHex, setCustomHex] = useState('');

  const handleSwatchClick = (color: string) => {
    onColorSelect(color);
    onClose();
  };

  const handleNoColor = () => {
    onNoColor();
    onClose();
  };

  const handleCustomSubmit = () => {
    const trimmed = customHex.trim();
    if (!trimmed) return;

    // Accept with or without # prefix
    const color = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    // Valid CSS hex colors: 3 digits (#rgb), 4 (#rgba), 6 (#rrggbb), or 8 (#rrggbbaa)
    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
      onColorSelect(color);
      onClose();
    }
  };

  const normalizedSelected = selectedColor?.toLowerCase() ?? null;

  return (
    <Dropdown anchor={anchor} onClose={onClose} className="onr-color-picker">
      <div className="onr-cp-header">{label}</div>

      <div
        className="onr-cp-no-color"
        onClick={handleNoColor}
        role="button"
        tabIndex={0}
      >
        Automatic / No Color
      </div>

      <div className="onr-cp-grid">
        {COLOR_PALETTE.map((color) => {
          const isActive = normalizedSelected === color.toLowerCase();

          return (
            <div
              key={color}
              className={`onr-cp-swatch${isActive ? ' onr-cp-swatch-active' : ''}`}
              onClick={() => handleSwatchClick(color)}
              title={color}
              role="button"
              tabIndex={0}
            >
              {/* Inline style required: each swatch has a unique dynamic background color */}
              <div className="onr-cp-swatch-inner" style={{ backgroundColor: color }} />
            </div>
          );
        })}
      </div>

      <div className="onr-cp-custom">
        <input
          className="onr-cp-hex-input"
          type="text"
          placeholder="#hex"
          value={customHex}
          onChange={(event) => setCustomHex(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleCustomSubmit();
            }
          }}
        />
        <div
          className="onr-cp-apply-btn"
          onClick={handleCustomSubmit}
          role="button"
          tabIndex={0}
        >
          Apply
        </div>
      </div>
    </Dropdown>
  );
}
