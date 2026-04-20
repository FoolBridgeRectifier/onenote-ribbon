import { useRef, useState } from 'react';
import './font-picker.css';
import { useApp } from '../../../../shared/context/AppContext';
import { Dropdown } from '../../../../shared/components/dropdown/Dropdown';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { applyFontFamily, applyFontSize } from './helpers';
import type { FontPickerProps } from './interfaces';
import { FONTS, SIZES } from './constants';

export function FontPicker({ editorState }: FontPickerProps) {
  const app = useApp();
  const fontAnchorRef = useRef<HTMLDivElement>(null);
  const sizeAnchorRef = useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleFontSelect = (font: string) => {
    const editor = getEditor();
    if (!editor) return;

    applyFontFamily(editor, font);
    setFontMenuOpen(false);
  };

  const handleSizeSelect = (size: string) => {
    const editor = getEditor();
    if (!editor) return;

    applyFontSize(editor, parseInt(size, 10));
    setSizeMenuOpen(false);
  };

  // Display font/size from cursor position via editorState
  const displayedFont = editorState.fontFamily === 'default'
    ? 'Font'
    : editorState.fontFamily;
  const displayedSize = editorState.fontSize;

  return (
    <>
      <RibbonButton
        ref={fontAnchorRef}
        className="onr-font-picker"
        title="Font family"
        onClick={() => setFontMenuOpen(!fontMenuOpen)}
        data-cmd="font-family"
      >
        <span className="onr-picker-label">
          {displayedFont}
        </span>
        <span className="onr-picker-caret">▾</span>
      </RibbonButton>
      {fontMenuOpen && fontAnchorRef.current && (
        <Dropdown
          anchor={fontAnchorRef.current}
          items={FONTS.map((font) => ({
            label: font,
            onClick: () => handleFontSelect(font),
          }))}
          onClose={() => setFontMenuOpen(false)}
        />
      )}

      <RibbonButton
        ref={sizeAnchorRef}
        className="onr-size-picker"
        title="Font size"
        onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
        data-cmd="font-size"
      >
        <span className="onr-picker-label">
          {displayedSize}
        </span>
        <span className="onr-picker-caret">▾</span>
      </RibbonButton>
      {sizeMenuOpen && sizeAnchorRef.current && (
        <Dropdown
          anchor={sizeAnchorRef.current}
          items={SIZES.map((size) => ({
            label: size,
            onClick: () => handleSizeSelect(size),
          }))}
          onClose={() => setSizeMenuOpen(false)}
        />
      )}
    </>
  );
}
