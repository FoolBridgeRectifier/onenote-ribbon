import React from 'react';
import './bullet-library.css';
import { Dropdown } from '../../../../../shared/components/dropdown/Dropdown';
import { BULLET_PRESETS } from '../constants';
import { BULLET_LIBRARY_HEADING } from './constants';
import type { BulletLibraryProps } from './interfaces';

export function BulletLibrary({
  anchor,
  activePresetId,
  onSelectPreset,
  onClose,
}: BulletLibraryProps) {
  const handleCellClick = (presetId: string) => {
    onSelectPreset(presetId);
    onClose();
  };

  return (
    <Dropdown anchor={anchor} onClose={onClose} className="onr-bullet-library">
      <div className="onr-bullet-library-heading">{BULLET_LIBRARY_HEADING}</div>
      <div className="onr-bullet-library-grid">
        {BULLET_PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId;
          const cellClassName = `onr-bullet-library-cell${isActive ? ' onr-active' : ''}`;

          return (
            <div
              key={preset.id}
              className={cellClassName}
              data-cmd={`bullet-preset-${preset.id}`}
              onClick={() => handleCellClick(preset.id)}
              onMouseDown={(event) => {
                // Prevent editor blur when clicking ribbon dropdown items.
                event.preventDefault();
              }}
            >
              {preset.levels.length > 0 ? (
                <div className="onr-bullet-library-levels">
                  {preset.levels.map((symbol, levelIndex) => (
                    <span
                      key={levelIndex}
                      className="onr-bullet-library-level"
                      // Cascading indent: each deeper nesting level shifts right by 2px per depth.
                      style={{ marginLeft: levelIndex * 2 }}
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="onr-bullet-library-levels">—</span>
              )}
              <span className="onr-bullet-library-label">{preset.label}</span>
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
}
