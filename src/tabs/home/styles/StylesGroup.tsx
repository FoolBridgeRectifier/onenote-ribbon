import { useState } from 'react';
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

  return (
    <div className="onr-group">
      <div className="onr-styles-group" style={{ flex: 1 }}>
        {/* Style previews stacked 2 visible + scroll */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '130px' }}>
          {visibleStyles.map((style) => (
            <div
              key={style.name}
              className="onr-btn-sm"
              onClick={() => handleStyleClick(style.level)}
              data-cmd={`style-${style.name.toLowerCase().replace(/\s+/g, '-')}`}
              title={`Apply ${style.name}`}
              style={{
                width: '130px',
                minHeight: '28px',
                background: '#1a1a2e',
                border: '1px solid #555',
                borderRadius: '2px',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: '2px 8px',
                gap: '0',
                fontSize: style.level === 1 ? '15px' : style.level === 2 ? '13px' : '11px',
                fontWeight: '700',
                color: '#5B9BD5',
              }}
            >
              {style.name}
            </div>
          ))}
        </div>

        {/* Scroll arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 1px', gap: '2px' }}>
          <div
            className="onr-btn-sm"
            title="Previous styles"
            onClick={handleScrollUp}
            data-cmd="styles-prev"
            style={{
              width: '16px',
              minHeight: '28px',
              padding: '0',
              fontSize: '9px',
            }}
          >
            ▲
          </div>
          <div
            className="onr-btn-sm"
            title="Next styles"
            onClick={handleScrollDown}
            data-cmd="styles-next"
            style={{
              width: '16px',
              minHeight: '28px',
              padding: '0',
              fontSize: '9px',
            }}
          >
            ▼
          </div>
          <div
            className="onr-btn-sm"
            title="Expand"
            onClick={() => {}}
            data-cmd="styles-expand"
            style={{
              width: '16px',
              minHeight: '14px',
              padding: '0',
              fontSize: '9px',
            }}
          >
            ▾
          </div>
        </div>
      </div>
      <div className="onr-group-name">Styles</div>
    </div>
  );
}
