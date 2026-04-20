import { useCallback, useEffect, useRef, useState } from 'react';
import './styles-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { useEditorState } from '../../../shared/hooks/useEditorState';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { Dropdown } from '../../../shared/components/dropdown/Dropdown';
import type { StyleEntry } from './interfaces';
import { STYLES_LIST } from './constants';
import { ClearFormattingIcon } from '../../../assets/icons';
import {
  resolveStyleLevelClass,
  applyStyle,
  clearStyleFormatting,
  computeScrollOffset,
} from './helpers';

export function StylesGroup() {
  const app = useApp();
  const editorState = useEditorState(app);
  const expandAnchorRef = useRef<HTMLDivElement>(null);
  const [stylesOffset, setStylesOffset] = useState(0);
  const [expandOpen, setExpandOpen] = useState(false);

  const isStyleActive = useCallback(
    (style: StyleEntry) => {
      if (style.level > 0) return editorState.headLevel === style.level;
      if (style.level === 0 && !style.type) return editorState.headLevel === 0;
      return false;
    },
    [editorState.headLevel]
  );

  // Auto-scroll visible window to keep the active heading in view
  useEffect(() => {
    const newOffset = computeScrollOffset(editorState.headLevel, stylesOffset);
    if (newOffset !== stylesOffset) setStylesOffset(newOffset);
  }, [editorState.headLevel, stylesOffset]);

  const handleStyleClick = (style: StyleEntry) => {
    applyStyle(app, style);
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
    clearStyleFormatting(app, () => setExpandOpen(false));
  };

  const visibleStyles = STYLES_LIST.slice(stylesOffset, stylesOffset + 2);

  return (
    <GroupShell name="Styles">
      <div className="onr-styles-group">
        <div className="onr-styles-previews">
          {visibleStyles.map((style) => (
            <RibbonButton
              key={style.name}
              className={`onr-style-preview ${resolveStyleLevelClass(style)}`}
              active={isStyleActive(style)}
              onClick={() => handleStyleClick(style)}
              data-cmd={`style-${style.name.toLowerCase().replace(/\s+/g, '-')}`}
              title={`Apply ${style.name}`}
            >
              {style.name}
            </RibbonButton>
          ))}
        </div>

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
                  <span className={`onr-dd-label ${resolveStyleLevelClass(style)}`}>
                    {style.name}
                  </span>
                </div>
              ))}
              <div className="onr-clear-formatting-btn" onClick={handleClearFormatting}>
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
