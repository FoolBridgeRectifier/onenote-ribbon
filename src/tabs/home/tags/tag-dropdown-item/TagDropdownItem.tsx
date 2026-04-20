import type { TagDropdownItemProps } from './interfaces';

export function TagDropdownItem({
  tagDefinition,
  isDisabled,
  isChecked,
  onSelect,
}: TagDropdownItemProps) {
  const dataCommand = `tag-${tagDefinition.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  // Footer items ("Customize Tags…", "Remove Tag") don't get a checkbox
  const showCheckbox = !tagDefinition.isCustomizeTags && !tagDefinition.isRemoveTag;

  return (
    <div
      className={isDisabled ? 'onr-tags-dd-item onr-tags-dd-item--disabled' : 'onr-tags-dd-item'}
      onClick={() => onSelect(tagDefinition)}
      data-cmd={dataCommand}
      title={tagDefinition.label}
    >
      {/* Small colored tag icon */}
      <span className="onr-tags-dd-icon">{tagDefinition.icon}</span>

      {/* Tag label text */}
      <span className="onr-tags-dd-label">{tagDefinition.label}</span>

      {/* Right-side checkbox: checked when cursor is inside this tag type */}
      {showCheckbox && (
        <span
          className={isChecked ? 'onr-tags-dd-cb onr-tags-dd-cb--checked' : 'onr-tags-dd-cb'}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
