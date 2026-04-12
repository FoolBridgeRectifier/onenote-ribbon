import { useState } from 'react';
import './StylesGroup.css';
import { useApp } from '../../../shared/context/AppContext';
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
      ((app as any).commands).executeCommandById(`editor:toggle-heading-${level}`);
    }
  };

  const handleScrollUp = () => {
    setStylesOffset(Math.max(0, stylesOffset - 1));
  };

  const handleScrollDown = () => {
    setStylesOffset(Math.min(STYLES_LIST.length - 2, stylesOffset + 1));
  };

  const visibleStyles = STYLES_LIST.slice(stylesOffset, stylesOffset + 2);

  const levelClass = (level: number) => {
    if (level === 1) return 'onr-style-h1';
    if (level === 2) return 'onr-style-h2';
    return '';
  };

  return (
    <div className="onr-group">
      <div className="onr-styles-group">
        {/* Style previews stacked 2 visible + scroll */}
        <div className="onr-styles-previews">
          {visibleStyles.map((style) => (
            <div
              key={style.name}
              className={`onr-btn-sm onr-style-preview ${levelClass(style.level)}`}
              onClick={() => handleStyleClick(style.level)}
              data-cmd={`style-${style.name.toLowerCase().replace(/\s+/g, '-')}`}
              title={`Apply ${style.name}`}
            >
              {style.name}
            </div>
          ))}
        </div>

        {/* Scroll arrows */}
        <div className="onr-styles-scroll">
          <div
            className="onr-btn-sm onr-scroll-arrow"
            title="Previous styles"
            onClick={handleScrollUp}
            data-cmd="styles-prev"
          >
            ▲
          </div>
          <div
            className="onr-btn-sm onr-scroll-arrow"
            title="Next styles"
            onClick={handleScrollDown}
            data-cmd="styles-next"
          >
            ▼
          </div>
          <div
            className="onr-btn-sm onr-scroll-expand"
            title="Expand"
            onClick={() => {}}
            data-cmd="styles-expand"
          >
            ▾
          </div>
        </div>
      </div>
      <div className="onr-group-name">Styles</div>
    </div>
  );
}
