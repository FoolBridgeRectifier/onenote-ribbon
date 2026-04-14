import { useRef, useState } from 'react';
import './highlight-text-color.css';
import { HighlightIcon } from '../../../../assets/icons';
import { useApp } from '../../../../shared/context/AppContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { ColorPicker } from '../../../../shared/components/color-picker/ColorPicker';
import {
  addTagInEditor,
  removeTagInEditor,
  toggleTagInEditor,
} from '../../../../shared/editor/styling-engine/editorIntegration';
import { HIGHLIGHT_MD_TAG } from '../../../../shared/editor/styling-engine/constants';
import { buildSpanTagDefinition } from '../../../../shared/editor/styling-engine/tagManipulation';
import type { EditorState } from '../../../../shared/hooks/useEditorState';

const DEFAULT_HIGHLIGHT_COLOR = '#ffff00';
const DEFAULT_FONT_COLOR = '#ff0000';

interface HighlightTextColorProps {
  editorState: EditorState;
}

export function HighlightTextColor({ editorState }: HighlightTextColorProps) {
  const app = useApp();

  const highlightAnchorRef = useRef<HTMLDivElement>(null);
  const fontColorAnchorRef = useRef<HTMLDivElement>(null);
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [fontColorDropdownOpen, setFontColorDropdownOpen] = useState(false);
  const [lastHighlightColor, setLastHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR);
  const [lastFontColor, setLastFontColor] = useState(DEFAULT_FONT_COLOR);

  const getEditor = () => app.workspace.activeEditor?.editor;

  // Highlight icon click: apply last-used color or toggle markdown highlight
  const handleHighlightClick = () => {
    const editor = getEditor();
    if (!editor) return;

    if (lastHighlightColor === DEFAULT_HIGHLIGHT_COLOR) {
      // Default yellow — use markdown == highlight (toggles on/off)
      removeBackgroundSpanIfPresent(editor);
      toggleTagInEditor(editor, HIGHLIGHT_MD_TAG);
    } else {
      // Custom color — toggle: remove if same color present, else apply
      if (editorState.highlightColor === lastHighlightColor) {
        removeTagInEditor(editor, buildSpanTagDefinition('background', lastHighlightColor));
      } else {
        removeTagInEditor(editor, HIGHLIGHT_MD_TAG);
        if (editorState.highlightColor) {
          removeTagInEditor(editor, buildSpanTagDefinition('background', editorState.highlightColor));
        }
        addTagInEditor(editor, buildSpanTagDefinition('background', lastHighlightColor));
      }
    }
  };

  const handleHighlightColorSelect = (color: string) => {
    const editor = getEditor();
    if (!editor) return;

    setLastHighlightColor(color);

    // Remove markdown highlight before applying colored span
    removeTagInEditor(editor, HIGHLIGHT_MD_TAG);
    addTagInEditor(editor, buildSpanTagDefinition('background', color));
  };

  const handleHighlightNoColor = () => {
    const editor = getEditor();
    if (!editor) return;

    // Remove both representations
    removeTagInEditor(editor, HIGHLIGHT_MD_TAG);

    if (editorState.highlightColor) {
      removeTagInEditor(
        editor,
        buildSpanTagDefinition('background', editorState.highlightColor),
      );
    }

    // Reset to default so next click uses == markdown highlight
    setLastHighlightColor(DEFAULT_HIGHLIGHT_COLOR);
  };

  // Font color icon click: apply last-used color
  const handleFontColorClick = () => {
    const editor = getEditor();
    if (!editor) return;

    addTagInEditor(editor, buildSpanTagDefinition('color', lastFontColor));
  };

  const handleFontColorSelect = (color: string) => {
    const editor = getEditor();
    if (!editor) return;

    setLastFontColor(color);
    addTagInEditor(editor, buildSpanTagDefinition('color', color));
  };

  const handleFontColorNoColor = () => {
    const editor = getEditor();
    if (!editor) return;

    if (editorState.fontColor) {
      removeTagInEditor(
        editor,
        buildSpanTagDefinition('color', editorState.fontColor),
      );
    }
  };

  // Remove background span using the color detected at cursor
  function removeBackgroundSpanIfPresent(editor: ReturnType<typeof getEditor>) {
    if (!editor) return;

    if (editorState.highlightColor) {
      removeTagInEditor(
        editor,
        buildSpanTagDefinition('background', editorState.highlightColor),
      );
    }
  }

  const highlightActive = editorState.highlight || editorState.highlightColor !== null;
  const fontColorActive = editorState.fontColor !== null;

  return (
    <>
      {/* Highlight: icon area + dropdown caret */}
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

        <RibbonButton
          size="small"
          className="onr-caret-btn"
          onClick={() => setHighlightDropdownOpen(!highlightDropdownOpen)}
        >
          ▾
        </RibbonButton>
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

      {/* Font color: icon area + dropdown caret */}
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

        <RibbonButton
          size="small"
          className="onr-caret-btn"
          onClick={() => setFontColorDropdownOpen(!fontColorDropdownOpen)}
        >
          ▾
        </RibbonButton>
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
