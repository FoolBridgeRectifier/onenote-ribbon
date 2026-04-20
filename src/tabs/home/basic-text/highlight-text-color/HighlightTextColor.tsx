import { useRef, useState } from 'react';
import './highlight-text-color.css';
import { HighlightIcon } from '../../../../assets/icons';
import { useApp } from '../../../../shared/context/AppContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { ColorPicker } from '../../../../shared/components/color-picker/ColorPicker';
import type { HighlightTextColorProps } from './interfaces';
import { DEFAULT_HIGHLIGHT_COLOR, DEFAULT_FONT_COLOR } from './constants';
import {
  applyHighlightClick,
  applyHighlightColorSelect,
  applyHighlightNoColor,
  applyFontColorClick,
  applyFontColorSelect,
  applyFontColorNoColor,
} from './helpers';

export function HighlightTextColor({ editorState }: HighlightTextColorProps) {
  const app = useApp();

  const highlightAnchorRef = useRef<HTMLDivElement>(null);
  const fontColorAnchorRef = useRef<HTMLDivElement>(null);
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [fontColorDropdownOpen, setFontColorDropdownOpen] = useState(false);
  const [lastHighlightColor, setLastHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR);
  const [lastFontColor, setLastFontColor] = useState(DEFAULT_FONT_COLOR);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleHighlightClick = () => {
    const editor = getEditor();
    if (!editor) return;
    applyHighlightClick(editor, editorState, lastHighlightColor);
  };

  const handleHighlightColorSelect = (color: string) => {
    const editor = getEditor();
    if (!editor) return;
    setLastHighlightColor(color);
    applyHighlightColorSelect(editor, color);
  };

  const handleHighlightNoColor = () => {
    const editor = getEditor();
    if (!editor) return;
    applyHighlightNoColor(editor, editorState.highlightColor);
    setLastHighlightColor(DEFAULT_HIGHLIGHT_COLOR);
  };

  const handleFontColorClick = () => {
    const editor = getEditor();
    if (!editor) return;
    applyFontColorClick(editor, lastFontColor);
  };

  const handleFontColorSelect = (color: string) => {
    const editor = getEditor();
    if (!editor) return;
    setLastFontColor(color);
    applyFontColorSelect(editor, color);
  };

  const handleFontColorNoColor = () => {
    const editor = getEditor();
    if (!editor) return;
    applyFontColorNoColor(editor, editorState.fontColor);
  };

  const highlightActive = editorState.highlight || editorState.highlightColor !== null;
  const fontColorActive = editorState.fontColor !== null;

  return (
    <>
      <div className="onr-highlight-wrapper">
        <RibbonButton
          ref={highlightAnchorRef}
          className="onr-highlight-btn"
          title="Highlight"
          active={highlightActive}
          onClick={handleHighlightClick}
          data-cmd="highlight"
        >
          <HighlightIcon className="onr-icon-sm" />
          {/* Inline style: dynamic swatch color from user selection */}
          <div className="onr-highlight-swatch" style={{ backgroundColor: lastHighlightColor }} />
        </RibbonButton>

        <RibbonButton size="small" className="onr-caret-btn" onClick={() => setHighlightDropdownOpen(!highlightDropdownOpen)}>▾</RibbonButton>
      </div>

      {highlightDropdownOpen && highlightAnchorRef.current && (
        <ColorPicker
          anchor={highlightAnchorRef.current}
          selectedColor={editorState.highlightColor}
          onColorSelect={handleHighlightColorSelect}
          onNoColor={handleHighlightNoColor}
          onClose={() => setHighlightDropdownOpen(false)}
          label="Highlight Color"
        />
      )}

      <div className="onr-divider" />

      <div className="onr-color-wrapper">
        <RibbonButton
          ref={fontColorAnchorRef}
          className="onr-color-btn"
          title="Font color"
          active={fontColorActive}
          onClick={handleFontColorClick}
          data-cmd="font-color"
        >
          <span className="onr-color-label">A</span>
          {/* Inline style: dynamic swatch color from user selection */}
          <div className="onr-color-swatch" style={{ backgroundColor: lastFontColor }} />
        </RibbonButton>

        <RibbonButton size="small" className="onr-caret-btn" onClick={() => setFontColorDropdownOpen(!fontColorDropdownOpen)}>▾</RibbonButton>
      </div>

      {fontColorDropdownOpen && fontColorAnchorRef.current && (
        <ColorPicker
          anchor={fontColorAnchorRef.current}
          selectedColor={editorState.fontColor}
          onColorSelect={handleFontColorSelect}
          onNoColor={handleFontColorNoColor}
          onClose={() => setFontColorDropdownOpen(false)}
          label="Font Color"
        />
      )}
    </>
  );
}
