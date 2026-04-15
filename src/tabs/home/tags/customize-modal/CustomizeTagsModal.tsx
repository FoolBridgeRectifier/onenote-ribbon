import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePortalContainer } from '../../../../shared/context/PortalContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';

import './customize-modal.css';
import type { CustomTag, CustomizeTagsModalProps } from './interfaces';
import {
  CUSTOM_TAG_PRESET_COLORS,
  DEFAULT_CALLOUT_TYPE,
  OBSIDIAN_CALLOUT_TYPES,
} from './constants';

/** Generates a simple unique ID for new custom tags (not crypto-quality, sufficient for local storage). */
function generateTagId(): string {
  return `ctag-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Modal for managing user-created custom tags.
 *
 * Rendered as a React portal into the dedicated portal container so it floats
 * above the ribbon panel regardless of `overflow` on parent elements.
 */
export function CustomizeTagsModal({
  customTags,
  onChange,
  onClose,
}: CustomizeTagsModalProps) {
  const portalContainer = usePortalContainer();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(CUSTOM_TAG_PRESET_COLORS[0]);
  const [newTagCalloutType, setNewTagCalloutType] =
    useState(DEFAULT_CALLOUT_TYPE);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the name input when the modal first opens.
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Close on Escape key.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDeleteTag = (tagId: string) => {
    onChange(customTags.filter((tag) => tag.id !== tagId));
  };

  const handleAddTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    const newTag: CustomTag = {
      id: generateTagId(),
      name: trimmedName,
      color: newTagColor,
      calloutType: newTagCalloutType,
    };

    onChange([...customTags, newTag]);
    setNewTagName('');
    setNewTagColor(CUSTOM_TAG_PRESET_COLORS[0]);
    setNewTagCalloutType(DEFAULT_CALLOUT_TYPE);
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleAddTag();
  };

  // Close on overlay click but not on modal box click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const calloutTypeLabelForValue = (value: string): string => {
    return (
      OBSIDIAN_CALLOUT_TYPES.find((type) => type.value === value)?.label ??
      value
    );
  };

  const modalContent = (
    <div className="onr-customize-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="onr-customize-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onr-customize-modal-title"
      >
        {/* Header */}
        <div className="onr-customize-modal-header">
          <span
            className="onr-customize-modal-title"
            id="onr-customize-modal-title"
          >
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

        {/* Body */}
        <div className="onr-customize-modal-body">
          {/* Existing custom tags */}
          <div>
            <div className="onr-customize-modal-section-label">Your Tags</div>
            <div className="onr-customize-modal-tag-list">
              {customTags.length === 0 && (
                <div className="onr-customize-modal-empty">
                  No custom tags yet.
                </div>
              )}

              {customTags.map((tag) => (
                <div key={tag.id} className="onr-customize-modal-tag-row">
                  <span
                    className="onr-customize-modal-tag-color"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden="true"
                  />
                  <span className="onr-customize-modal-tag-name">
                    {tag.name}
                  </span>
                  <span className="onr-customize-modal-tag-type">
                    {calloutTypeLabelForValue(tag.calloutType)}
                  </span>
                  <RibbonButton
                    size="small"
                    className="onr-customize-modal-tag-delete"
                    onClick={() => handleDeleteTag(tag.id)}
                    aria-label={`Delete tag "${tag.name}"`}
                    title="Delete tag"
                  >
                    ×
                  </RibbonButton>
                </div>
              ))}
            </div>
          </div>

          <hr className="onr-customize-modal-divider" aria-hidden="true" />

          {/* Add new tag form */}
          <div className="onr-customize-modal-form">
            <div className="onr-customize-modal-section-label">Add New Tag</div>

            <div className="onr-customize-modal-field">
              <label
                className="onr-customize-modal-label"
                htmlFor="onr-new-tag-name"
              >
                Name
              </label>
              <input
                ref={nameInputRef}
                id="onr-new-tag-name"
                className="onr-customize-modal-input"
                type="text"
                placeholder="Tag name…"
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                onKeyDown={handleNameKeyDown}
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
                    onClick={() => setNewTagColor(color)}
                    aria-label={`Select color ${color}`}
                    aria-pressed={newTagColor === color}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="onr-customize-modal-field">
              <label
                className="onr-customize-modal-label"
                htmlFor="onr-new-tag-callout"
              >
                Tag Type
              </label>
              <select
                id="onr-new-tag-callout"
                className="onr-customize-modal-select"
                value={newTagCalloutType}
                onChange={(event) => setNewTagCalloutType(event.target.value)}
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
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
            >
              Add Tag
            </RibbonButton>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, portalContainer);
}
