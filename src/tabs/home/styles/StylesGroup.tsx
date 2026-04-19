import { useCallback, useEffect, useRef, useState } from 'react';
import './styles-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { useEditorState } from '../../../shared/hooks/useEditorState';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { Dropdown } from '../../../shared/components/dropdown/Dropdown';
import { STYLES_LIST, StyleEntry } from './styles-data';
import { ClearFormattingIcon } from '../../../assets/icons';

/** Obsidian App with commands API. */
interface AppWithCommands {
  commands: {
    executeCommandById(commandId: string): void;
  };
}

export function StylesGroup() {
  const app = useApp();
  const editorState = useEditorState(app);
  const expandAnchorRef = useRef<HTMLDivElement>(null);
  const [stylesOffset, setStylesOffset] = useState(0);
  const [expandOpen, setExpandOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  // Determine which style is currently active based on editor state
  const isStyleActive = useCallback((style: StyleEntry) => {
    if (style.level > 0) return editorState.headLevel === style.level;
    if (style.level === 0 && !style.type) return editorState.headLevel === 0;
    return false;
  }, [editorState.headLevel]);

  // Auto-scroll the visible style window to keep the active heading in view
  useEffect(() => {
    const activeIndex = STYLES_LIST.findIndex((style) => isStyleActive(style));

    if (activeIndex === -1) return;

    // If active style is above visible window, scroll up to show it
    if (activeIndex < stylesOffset) {
      setStylesOffset(activeIndex);
    }

    // If active style is below visible window, scroll down to show it
    if (activeIndex > stylesOffset + 1) {
      setStylesOffset(Math.min(activeIndex, STYLES_LIST.length - 2));
    }
  }, [editorState.headLevel, isStyleActive, stylesOffset]);

  const handleStyleClick = (style: StyleEntry) => {
    if (style.type === 'quote') {
      (app as unknown as AppWithCommands).commands.executeCommandById('editor:toggle-blockquote');
      return;
    }

    if (style.type === 'code') {
      (app as unknown as AppWithCommands).commands.executeCommandById('editor:toggle-code');
      return;
    }

    if (style.level === 0) {
      // Normal — strip heading prefix
      const editor = getEditor();
      if (!editor) return;
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      editor.setLine(cursor.line, line.replace(/^#+\s/, ''));
      return;
    }

    // Heading 1-6 — Obsidian uses "set-heading" not "toggle-heading"
    (app as unknown as AppWithCommands).commands.executeCommandById(
      `editor:set-heading-${style.level}`,
    );
  };

  const handleScrollUp = () => {
    setStylesOffset(Math.max(0, stylesOffset - 1));
  };

  const handleScrollDown = () => {
    setStylesOffset(Math.min(STYLES_LIST.length - 2, stylesOffset + 1));
  };

  const handleExpandStyles = () => {
    setExpandOpen(!expandOpen);
  };

  const handleClearFormatting = () => {
    const editor = getEditor();
    if (!editor) return;

    // Clear heading if present
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const clearedLine = line.replace(/^#+\s/, '');
    editor.setLine(cursor.line, clearedLine);

    // Close dropdown
    setExpandOpen(false);
  };

  const visibleStyles = STYLES_LIST.slice(stylesOffset, stylesOffset + 2);

  const levelClass = (style: StyleEntry) => {
    if (style.level === 0 && !style.type) return 'onr-style-normal';
    if (style.level === 1) return 'onr-style-h1';
    if (style.level === 2) return 'onr-style-h2';
    if (style.level === 3) return 'onr-style-h3';
    if (style.level === 4) return 'onr-style-h4';
    if (style.level === 5) return 'onr-style-h5';
    if (style.level === 6) return 'onr-style-h6';
    if (style.type === 'quote') return 'onr-style-quote';
    if (style.type === 'code') return 'onr-style-code';
    return '';
  };

  return (
    <GroupShell name="Styles">
      <div className="onr-styles-group">
        {/* Style previews stacked 2 visible + scroll */}
        <div className="onr-styles-previews">
          {visibleStyles.map((style) => (
            <RibbonButton
              key={style.name}
              className={`onr-style-preview ${levelClass(style)}`}
              active={isStyleActive(style)}
              onClick={() => handleStyleClick(style)}
              data-cmd={`style-${style.name.toLowerCase().replace(/\s+/g, '-')}`}
              title={`Apply ${style.name}`}
            >
              {style.name}
            </RibbonButton>
          ))}
        </div>

        {/* Scroll arrows */}
        <div className="onr-styles-scroll">
          <RibbonButton
            className="onr-scroll-arrow"
            title="Previous styles"
            onClick={handleScrollUp}
            data-cmd="styles-prev"
          >
            ▲
          </RibbonButton>
          <RibbonButton
            className="onr-scroll-arrow"
            title="Next styles"
            onClick={handleScrollDown}
            data-cmd="styles-next"
          >
            ▼
          </RibbonButton>
          <RibbonButton
            ref={expandAnchorRef}
            className="onr-scroll-expand"
            title="Expand"
            onClick={handleExpandStyles}
            data-cmd="styles-expand"
          >
            ▾
          </RibbonButton>

          {expandOpen && expandAnchorRef.current && (
            <Dropdown
              anchor={expandAnchorRef.current}
              onClose={() => setExpandOpen(false)}
              className="onr-styles-dropdown"
            >
              <div className="onr-styles-dropdown-header">Styles</div>
              {STYLES_LIST.map((style) => (
                <div
                  key={style.name}
                  className={`onr-dd-item${isStyleActive(style) ? ' onr-dd-item-active' : ''}`}
                  onClick={() => {
                    handleStyleClick(style);
                    setExpandOpen(false);
                  }}
                >
                  <span className={`onr-dd-label ${levelClass(style)}`}>
                    {style.name}
                  </span>
                </div>
              ))}
              <div
                className="onr-clear-formatting-btn"
                onClick={handleClearFormatting}
              >
                <ClearFormattingIcon className="onr-clear-formatting-icon" />
                <span>Clear Formatting</span>
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </GroupShell>
  );
}
