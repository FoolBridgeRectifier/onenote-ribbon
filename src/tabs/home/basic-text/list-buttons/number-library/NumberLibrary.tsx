import React from 'react';
import './number-library.css';
import { Dropdown } from '../../../../../shared/components/dropdown/Dropdown';
import { NUMBER_PRESETS } from '../constants';
import {
  NUMBER_LIBRARY_HEADING,
  NUMBER_LIBRARY_INDENT_PER_LEVEL_PX,
} from './constants';
import { formatLevelPreview } from './formatLevelPreview';
import type { NumberLibraryProps } from './interfaces';

export function NumberLibrary({
  anchor,
  activePresetId,
  onSelectPreset,
  onClose,
}: NumberLibraryProps) {
  const handleCellClick = (presetId: string) => {
    onSelectPreset(presetId);
    onClose();
  };

  return (
    <Dropdown anchor={anchor} onClose={onClose} className="onr-number-library">
      <div className="onr-number-library-heading">{NUMBER_LIBRARY_HEADING}</div>
      <div className="onr-number-library-grid">
        {NUMBER_PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId;
          const cellClassName = `onr-number-library-cell${isActive ? ' onr-active' : ''}`;

          return (
            <div
              key={preset.id}
              className={cellClassName}
              data-cmd={`number-preset-${preset.id}`}
              onClick={() => handleCellClick(preset.id)}
              onMouseDown={(event) => {
                // Prevent editor blur when clicking ribbon dropdown items.
                event.preventDefault();
              }}
            >
              {preset.levels.length > 0 ? (
                <div className="onr-number-library-levels">
                  {preset.levels.map((levelConfig, levelIndex) => (
                    <span
                      key={levelIndex}
                      className="onr-number-library-level"
                      // Cascading indent: each deeper nesting level shifts right by 2px per depth.
                      style={{
                        marginLeft:
                          levelIndex * NUMBER_LIBRARY_INDENT_PER_LEVEL_PX,
                      }}
                    >
                      {formatLevelPreview(levelConfig, 1)}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="onr-number-library-levels">—</span>
              )}
              <span className="onr-number-library-label">{preset.label}</span>
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
}
