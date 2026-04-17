import React, { useRef, useState } from 'react';
import './list-buttons.css';
import { useApp } from '../../../../shared/context/AppContext';
import {
  BulletListIcon,
  NumberedListIcon,
  OutdentIcon,
  IndentIcon,
} from '../../../../assets/icons';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { BulletLibrary } from './bullet-library/BulletLibrary';
import { NumberLibrary } from './number-library/NumberLibrary';
import { useListStyleInjection } from '../../../../shared/hooks/useListStyleInjection';
import type { EditorState } from '../../../../shared/hooks/useEditorState';
import { canSafelyIndent } from './canSafelyIndent';
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
  BULLET_PRESET_NONE_ID,
  NUMBER_PRESET_NONE_ID,
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

  // Tracks the last preset explicitly chosen from the library so the main button re-applies it.
  const [lastBulletPresetId, setLastBulletPresetId] = useState(bulletPresetId);
  const [lastNumberPresetId, setLastNumberPresetId] = useState(numberPresetId);

  const handleBulletToggle = () => {
    // Re-apply the last chosen bullet preset so the new list uses it immediately.
    if (lastBulletPresetId !== BULLET_PRESET_NONE_ID) {
      setBulletPreset(lastBulletPresetId);
    }

    app.commands.executeCommandById(OBSIDIAN_CMD_TOGGLE_BULLET_LIST);
  };

  const handleBulletCaretClick = () => {
    // Close the other library before opening this one.
    setNumberLibraryOpen(false);
    setBulletLibraryOpen((isOpen) => !isOpen);
  };

  const handleBulletPresetSelect = (presetId: string) => {
    setLastBulletPresetId(presetId);
    setBulletPreset(presetId);
  };

  const handleNumberToggle = () => {
    // Re-apply the last chosen number preset so the new list uses it immediately.
    if (lastNumberPresetId !== NUMBER_PRESET_NONE_ID) {
      setNumberPreset(lastNumberPresetId);
    }

    app.commands.executeCommandById(OBSIDIAN_CMD_TOGGLE_NUMBER_LIST);
  };

  const handleNumberCaretClick = () => {
    // Close the other library before opening this one.
    setBulletLibraryOpen(false);
    setNumberLibraryOpen((isOpen) => !isOpen);
  };

  const handleNumberPresetSelect = (presetId: string) => {
    setLastNumberPresetId(presetId);
    setNumberPreset(presetId);
  };

  const handleOutdent = () => {
    app.commands.executeCommandById(OBSIDIAN_CMD_UNINDENT_LIST);
  };

  const handleIndent = () => {
    const editor = app.workspace.activeEditor?.editor;

    // Block indent when it would create an invalid depth gap in list structure
    if (editor && !canSafelyIndent(editor)) return;

    app.commands.executeCommandById(OBSIDIAN_CMD_INDENT_LIST);
  };

  return (
    <>
      {/* Bullet list button: icon above, caret below — same layout as highlight/color buttons */}
      <div className="onr-list-btn-wrapper" ref={bulletAnchorRef}>
        <RibbonButton
          className="onr-list-main-btn"
          active={editorState.bulletList}
          title="Bullet list"
          data-cmd={LIST_BTN_CMD_BULLET_TOGGLE}
          onClick={handleBulletToggle}
        >
          <BulletListIcon className="onr-icon-sm" />
        </RibbonButton>

        <RibbonButton
          size="small"
          className="onr-list-caret-btn"
          data-cmd={LIST_BTN_CMD_BULLET_CARET}
          title="Bullet list styles"
          onClick={handleBulletCaretClick}
        >
          ▾
        </RibbonButton>
      </div>

      {/* Number list button: icon above, caret below */}
      <div className="onr-list-btn-wrapper" ref={numberAnchorRef}>
        <RibbonButton
          className="onr-list-main-btn"
          active={editorState.numberedList}
          title="Numbered list"
          data-cmd={LIST_BTN_CMD_NUMBER_TOGGLE}
          onClick={handleNumberToggle}
        >
          <NumberedListIcon className="onr-icon-sm" />
        </RibbonButton>

        <RibbonButton
          size="small"
          className="onr-list-caret-btn"
          data-cmd={LIST_BTN_CMD_NUMBER_CARET}
          title="Numbering styles"
          onClick={handleNumberCaretClick}
        >
          ▾
        </RibbonButton>
      </div>

      {/* Outdent button */}
      <RibbonButton
        data-cmd={LIST_BTN_CMD_OUTDENT}
        title="Decrease indent"
        onClick={handleOutdent}
      >
        <OutdentIcon className="onr-icon-sm" />
      </RibbonButton>

      {/* Indent button */}
      <RibbonButton
        data-cmd={LIST_BTN_CMD_INDENT}
        title="Increase indent"
        onClick={handleIndent}
      >
        <IndentIcon className="onr-icon-sm" />
      </RibbonButton>

      {/* Bullet Library dropdown (portal) */}
      {bulletLibraryOpen && (
        <BulletLibrary
          anchor={bulletAnchorRef.current}
          activePresetId={bulletPresetId}
          onSelectPreset={handleBulletPresetSelect}
          onClose={() => setBulletLibraryOpen(false)}
        />
      )}

      {/* Number Library dropdown (portal) */}
      {numberLibraryOpen && (
        <NumberLibrary
          anchor={numberAnchorRef.current}
          activePresetId={numberPresetId}
          onSelectPreset={handleNumberPresetSelect}
          onClose={() => setNumberLibraryOpen(false)}
        />
      )}
    </>
  );
}
