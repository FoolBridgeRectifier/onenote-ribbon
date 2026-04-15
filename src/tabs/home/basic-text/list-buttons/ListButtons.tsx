import React, { useRef, useState } from 'react';
import './list-buttons.css';
import { useApp } from '../../../../shared/context/AppContext';
import { BulletListIcon, NumberedListIcon, OutdentIcon, IndentIcon } from '../../../../assets/icons';
import { BulletLibrary } from './bullet-library/BulletLibrary';
import { NumberLibrary } from './number-library/NumberLibrary';
import { useListStyleInjection } from '../../../../shared/hooks/useListStyleInjection';
import type { EditorState } from '../../../../shared/hooks/useEditorState';
import {
  LIST_BTN_CMD_BULLET_TOGGLE,
  LIST_BTN_CMD_BULLET_CARET,
  LIST_BTN_CMD_NUMBER_TOGGLE,
  LIST_BTN_CMD_NUMBER_CARET,
  LIST_BTN_CMD_OUTDENT,
  LIST_BTN_CMD_INDENT,
  OBSIDIAN_CMD_TOGGLE_BULLET_LIST,
  OBSIDIAN_CMD_TOGGLE_NUMBER_LIST,
  OBSIDIAN_CMD_UNINDENT_LIST,
  OBSIDIAN_CMD_INDENT_LIST,
} from './constants';

interface ListButtonsProps {
  editorState: Pick<EditorState, 'bulletList' | 'numberedList'>;
}

export function ListButtons({ editorState }: ListButtonsProps) {
  const app = useApp();

  const bulletAnchorRef = useRef<HTMLDivElement>(null);
  const numberAnchorRef = useRef<HTMLDivElement>(null);

  const [bulletLibraryOpen, setBulletLibraryOpen] = useState(false);
  const [numberLibraryOpen, setNumberLibraryOpen] = useState(false);

  const { bulletPresetId, numberPresetId, setBulletPreset, setNumberPreset } =
    useListStyleInjection();

  // Prevents editor from losing focus when clicking ribbon buttons.
  const preventEditorBlur = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleBulletToggle = () => {
    app.commands.executeCommandById(OBSIDIAN_CMD_TOGGLE_BULLET_LIST);
  };

  const handleBulletCaretClick = () => {
    // Close the other library before opening this one.
    setNumberLibraryOpen(false);
    setBulletLibraryOpen((isOpen) => !isOpen);
  };

  const handleNumberToggle = () => {
    app.commands.executeCommandById(OBSIDIAN_CMD_TOGGLE_NUMBER_LIST);
  };

  const handleNumberCaretClick = () => {
    // Close the other library before opening this one.
    setBulletLibraryOpen(false);
    setNumberLibraryOpen((isOpen) => !isOpen);
  };

  const handleOutdent = () => {
    app.commands.executeCommandById(OBSIDIAN_CMD_UNINDENT_LIST);
  };

  const handleIndent = () => {
    app.commands.executeCommandById(OBSIDIAN_CMD_INDENT_LIST);
  };

  return (
    <>
      {/* Bullet list split button */}
      <div className="onr-list-split-btn" ref={bulletAnchorRef}>
        <div
          className={`onr-list-split-main${editorState.bulletList ? ' onr-active' : ''}`}
          data-cmd={LIST_BTN_CMD_BULLET_TOGGLE}
          title="Bullet list"
          onClick={handleBulletToggle}
          onMouseDown={preventEditorBlur}
        >
          <BulletListIcon className="onr-icon-sm" />
        </div>
        <div className="onr-list-split-divider" />
        <div
          className="onr-list-split-caret"
          data-cmd={LIST_BTN_CMD_BULLET_CARET}
          title="Bullet list styles"
          onClick={handleBulletCaretClick}
          onMouseDown={preventEditorBlur}
        >
          ▾
        </div>
      </div>

      {/* Number list split button */}
      <div className="onr-list-split-btn" ref={numberAnchorRef}>
        <div
          className={`onr-list-split-main${editorState.numberedList ? ' onr-active' : ''}`}
          data-cmd={LIST_BTN_CMD_NUMBER_TOGGLE}
          title="Numbered list"
          onClick={handleNumberToggle}
          onMouseDown={preventEditorBlur}
        >
          <NumberedListIcon className="onr-icon-sm" />
        </div>
        <div className="onr-list-split-divider" />
        <div
          className="onr-list-split-caret"
          data-cmd={LIST_BTN_CMD_NUMBER_CARET}
          title="Numbering styles"
          onClick={handleNumberCaretClick}
          onMouseDown={preventEditorBlur}
        >
          ▾
        </div>
      </div>

      {/* Outdent button */}
      <div
        className="onr-btn-sm"
        data-cmd={LIST_BTN_CMD_OUTDENT}
        title="Decrease indent"
        onClick={handleOutdent}
        onMouseDown={preventEditorBlur}
      >
        <OutdentIcon className="onr-icon-sm" />
      </div>

      {/* Indent button */}
      <div
        className="onr-btn-sm"
        data-cmd={LIST_BTN_CMD_INDENT}
        title="Increase indent"
        onClick={handleIndent}
        onMouseDown={preventEditorBlur}
      >
        <IndentIcon className="onr-icon-sm" />
      </div>

      {/* Bullet Library dropdown (portal) */}
      {bulletLibraryOpen && (
        <BulletLibrary
          anchor={bulletAnchorRef.current}
          activePresetId={bulletPresetId}
          onSelectPreset={setBulletPreset}
          onClose={() => setBulletLibraryOpen(false)}
        />
      )}

      {/* Number Library dropdown (portal) */}
      {numberLibraryOpen && (
        <NumberLibrary
          anchor={numberAnchorRef.current}
          activePresetId={numberPresetId}
          onSelectPreset={setNumberPreset}
          onClose={() => setNumberLibraryOpen(false)}
        />
      )}
    </>
  );
}
