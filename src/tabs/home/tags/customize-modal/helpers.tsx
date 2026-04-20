import * as React from 'react';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import type { ModalHeaderProps, TagListProps, AddTagFormProps } from './interfaces';
import { CUSTOM_TAG_PRESET_COLORS, OBSIDIAN_CALLOUT_TYPES } from './constants';

/** Title bar and close button for the customize-tags modal. */
export function ModalHeader({ onClose }: ModalHeaderProps) {
  return (
    <div className="onr-customize-modal-header">
      <span className="onr-customize-modal-title" id="onr-customize-modal-title">
        Customize Tags
      </span>
      <RibbonButton
        size="small"
        className="onr-customize-modal-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </RibbonButton>
    </div>
  );
}

/** Renders the list of existing custom tags with delete buttons. */
export function TagList({ customTags, calloutTypeLabelForValue, onDeleteTag }: TagListProps) {
  return (
    <div>
      <div className="onr-customize-modal-section-label">Your Tags</div>
      <div className="onr-customize-modal-tag-list">
        {customTags.length === 0 && (
          <div className="onr-customize-modal-empty">No custom tags yet.</div>
        )}
        {customTags.map((tag) => (
          <div key={tag.id} className="onr-customize-modal-tag-row">
            <span
              className="onr-customize-modal-tag-color"
              style={{ backgroundColor: tag.color }}
              aria-hidden="true"
            />
            <span className="onr-customize-modal-tag-name">{tag.name}</span>
            <span className="onr-customize-modal-tag-type">
              {calloutTypeLabelForValue(tag.calloutType)}
            </span>
            <RibbonButton
              size="small"
              className="onr-customize-modal-tag-delete"
              onClick={() => onDeleteTag(tag.id)}
              aria-label={`Delete tag "${tag.name}"`}
              title="Delete tag"
            >
              ×
            </RibbonButton>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Form section for creating a new custom tag (name, color, callout type). */
export function AddTagForm({
  nameInputRef,
  newTagName,
  newTagColor,
  newTagCalloutType,
  onNameChange,
  onColorChange,
  onCalloutTypeChange,
  onNameKeyDown,
  onAddTag,
}: AddTagFormProps) {
  return (
    <div className="onr-customize-modal-form">
      <div className="onr-customize-modal-section-label">Add New Tag</div>

      <div className="onr-customize-modal-field">
        <label className="onr-customize-modal-label" htmlFor="onr-new-tag-name">
          Name
        </label>
        <input
          ref={nameInputRef}
          id="onr-new-tag-name"
          className="onr-customize-modal-input"
          type="text"
          placeholder="Tag name…"
          value={newTagName}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={onNameKeyDown}
          maxLength={60}
        />
      </div>

      <div className="onr-customize-modal-field">
        <div className="onr-customize-modal-label">Color</div>
        <div className="onr-customize-modal-swatches">
          {CUSTOM_TAG_PRESET_COLORS.map((color) => (
            <RibbonButton
              key={color}
              size="small"
              className={
                newTagColor === color
                  ? 'onr-customize-modal-swatch onr-customize-modal-swatch--selected'
                  : 'onr-customize-modal-swatch'
              }
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              aria-label={`Select color ${color}`}
              aria-pressed={newTagColor === color}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="onr-customize-modal-field">
        <label className="onr-customize-modal-label" htmlFor="onr-new-tag-callout">
          Tag Type
        </label>
        <select
          id="onr-new-tag-callout"
          className="onr-customize-modal-select"
          value={newTagCalloutType}
          onChange={(event) => onCalloutTypeChange(event.target.value)}
        >
          {OBSIDIAN_CALLOUT_TYPES.map((calloutType) => (
            <option key={calloutType.value} value={calloutType.value}>
              {calloutType.label}
            </option>
          ))}
        </select>
      </div>

      <RibbonButton
        size="small"
        className="onr-customize-modal-add-btn"
        onClick={onAddTag}
        disabled={!newTagName.trim()}
      >
        Add Tag
      </RibbonButton>
    </div>
  );
}
