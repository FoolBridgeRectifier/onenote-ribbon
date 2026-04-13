import { useState } from 'react';
import './styles-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { STYLES_LIST } from './styles-data';

export function StylesGroup() {
  const app = useApp();
  const [stylesOffset, setStylesOffset] = useState(0);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleStyleClick = (level: number) => {
    if (level === 0) {
      const editor = getEditor();
      if (!editor) return;
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      editor.setLine(cursor.line, line.replace(/^#+\s/, ''));
    } else {
      (app as any).commands.executeCommandById(
        `editor:toggle-heading-${level}`,
      );
    }
  };

  const handleScrollUp = () => {
    setStylesOffset(Math.max(0, stylesOffset - 1));
  };

  const handleScrollDown = () => {
    setStylesOffset(Math.min(STYLES_LIST.length - 2, stylesOffset + 1));
  };

  const handleExpandStyles = () => {
    // Expanded styles panel behavior is not implemented yet.
  };

  const visibleStyles = STYLES_LIST.slice(stylesOffset, stylesOffset + 2);

  const levelClass = (level: number) => {
    if (level === 1) return 'onr-style-h1';
    if (level === 2) return 'onr-style-h2';
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
              className={`onr-style-preview ${levelClass(style.level)}`}
              onClick={() => handleStyleClick(style.level)}
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
            className="onr-scroll-expand"
            title="Expand"
            onClick={handleExpandStyles}
            data-cmd="styles-expand"
          >
            ▾
          </RibbonButton>
        </div>
      </div>
    </GroupShell>
  );
}
