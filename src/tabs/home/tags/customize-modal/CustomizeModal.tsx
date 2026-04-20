import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortalContainer } from '../../../../shared/context/PortalContext';
import './customize-modal.css';
import type { CustomTag, CustomizeTagsModalProps } from './interfaces';
import {
  CUSTOM_TAG_PRESET_COLORS,
  DEFAULT_CALLOUT_TYPE,
  OBSIDIAN_CALLOUT_TYPES,
} from './constants';
import { ModalHeader, TagList, AddTagForm } from './helpers';

/** Generates a simple unique ID for new custom tags (not crypto-quality, sufficient for local storage). */
function generateTagId(): string {
  return `ctag-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CustomizeTagsModal({ customTags, onChange, onClose }: CustomizeTagsModalProps) {
  const portalContainer = usePortalContainer();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(CUSTOM_TAG_PRESET_COLORS[0]);
  const [newTagCalloutType, setNewTagCalloutType] = useState(DEFAULT_CALLOUT_TYPE);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const calloutTypeLabelForValue = (value: string): string => {
    return OBSIDIAN_CALLOUT_TYPES.find((type) => type.value === value)?.label ?? value;
  };

  const modalContent = (
    <div className="onr-customize-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="onr-customize-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onr-customize-modal-title"
      >
        <ModalHeader onClose={onClose} />
        <div className="onr-customize-modal-body">
          <TagList
            customTags={customTags}
            calloutTypeLabelForValue={calloutTypeLabelForValue}
            onDeleteTag={handleDeleteTag}
          />
          <hr className="onr-customize-modal-divider" aria-hidden="true" />
          <AddTagForm
            nameInputRef={nameInputRef}
            newTagName={newTagName}
            newTagColor={newTagColor}
            newTagCalloutType={newTagCalloutType}
            onNameChange={setNewTagName}
            onColorChange={setNewTagColor}
            onCalloutTypeChange={setNewTagCalloutType}
            onNameKeyDown={handleNameKeyDown}
            onAddTag={handleAddTag}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
}
