
import './number-library.css';
import { Dropdown } from '../../../../../shared/components/dropdown/Dropdown';
import { NUMBER_PRESETS } from '../constants';
import { NUMBER_LIBRARY_HEADING } from './constants';
import { formatLevelPreview } from './helpers';
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
                  {/* First level shown prominently */}
                  <span className="onr-number-library-level-primary">
                    {formatLevelPreview(preset.levels[0]!, 1)}
                  </span>

                  {/* Remaining levels shown smaller and grayed out */}
                  {preset.levels.length > 1 && (
                    <span className="onr-number-library-level-secondary">
                      {preset.levels
                        .slice(1)
                        .map((levelConfig) =>
                          formatLevelPreview(levelConfig, 1),
                        )
                        .join('  ')}
                    </span>
                  )}
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
