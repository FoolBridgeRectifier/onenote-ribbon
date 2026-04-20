import { Dropdown } from '../../../../shared/components/dropdown/Dropdown';
import './paste-options-dropdown.css';
import type { PasteOption, PasteOptionsDropdownProps } from './interfaces';

export type { PasteOption };

export function PasteOptionsDropdown({ anchor, options, onClose }: PasteOptionsDropdownProps) {
  const handleOptionClick = (option: PasteOption) => {
    option.onClick();
    onClose();
  };

  return (
    <Dropdown
      anchor={anchor}
      onClose={onClose}
      className="onr-paste-options-panel"
      offsetY={2}
      constrainLeftToViewport={false}
    >
      <div className="onr-paste-options-header">Paste Options:</div>
      <div className="onr-paste-options-row">
        {options.map((option, index) => (
          <button
            key={index}
            className="onr-paste-option-btn"
            title={option.title}
            onClick={() => handleOptionClick(option)}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </Dropdown>
  );
}
