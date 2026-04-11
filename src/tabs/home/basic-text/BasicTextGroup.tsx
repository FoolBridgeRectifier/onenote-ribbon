import { useRef, useState } from 'react';
import { useApp } from '../../../shared/context/AppContext';
import { Dropdown } from '../../../shared/components/Dropdown';
import { clearFormatting } from './clearFormatting';

const FONTS = ['System Default', 'Monospace', 'Arial', 'Times New Roman', 'Georgia'];
const SIZES = ['12', '14', '16', '18', '20', '24'];

export function BasicTextGroup() {
  const app = useApp();
  const fontAnchorRef = useRef<HTMLDivElement>(null);
  const sizeAnchorRef = useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBold = () => {
    ((app as any).commands).executeCommandById('editor:toggle-bold');
  };

  const handleItalic = () => {
    ((app as any).commands).executeCommandById('editor:toggle-italic');
  };

  const handleUnderline = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<u>${selection}</u>`);
  };

  const handleStrikethrough = () => {
    ((app as any).commands).executeCommandById('editor:toggle-strikethrough');
  };

  const handleSubscript = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<sub>${selection}</sub>`);
  };

  const handleSuperscript = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<sup>${selection}</sup>`);
  };

  const handleBulletList = () => {
    ((app as any).commands).executeCommandById('editor:toggle-bullet-list');
  };

  const handleNumberedList = () => {
    ((app as any).commands).executeCommandById('editor:toggle-numbered-list');
  };

  const handleOutdent = () => {
    ((app as any).commands).executeCommandById('editor:unindent-list');
  };

  const handleIndent = () => {
    ((app as any).commands).executeCommandById('editor:indent-list');
  };

  const handleHighlight = () => {
    ((app as any).commands).executeCommandById('editor:toggle-highlight');
  };

  const handleClearInline = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const cleaned = clearFormatting(selection, { preserveHeadings: true });
    editor.replaceSelection(cleaned);
  };

  const handleClearAllFormatting = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const cleaned = clearFormatting(selection, { preserveHeadings: false });
    editor.replaceSelection(cleaned);
  };

  return (
    <div className="onr-group">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {/* Row 1: Font, size, bullets, lists, indent, clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 0 0 0', position: 'relative' }}>
          {/* Font family dropdown */}
          <div
            ref={fontAnchorRef}
            className="onr-btn-sm"
            title="Font family"
            onClick={() => setFontMenuOpen(!fontMenuOpen)}
            data-cmd="font-family"
            style={{
              width: '96px',
              flexDirection: 'row',
              gap: '2px',
              minHeight: '22px',
              padding: '1px 4px',
              border: '1px solid #c8c6c4',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: fontMenuOpen ? 100 : 'auto',
            }}
          >
            <span style={{ fontSize: '10px', color: '#222' }}>Font</span>
            <span style={{ fontSize: '8px', color: '#666' }}>▾</span>
          </div>
          {fontMenuOpen && fontAnchorRef.current && (
            <Dropdown
              anchor={fontAnchorRef.current}
              items={FONTS.map(font => ({
                label: font,
                onClick: () => {
                  ((app.vault as any).setConfig)('fontText', font);
                  app.workspace.trigger('css-change');
                  setFontMenuOpen(false);
                },
              }))}
              onClose={() => setFontMenuOpen(false)}
            />
          )}

          {/* Font size */}
          <div
            ref={sizeAnchorRef}
            className="onr-btn-sm"
            title="Font size"
            onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
            data-cmd="font-size"
            style={{
              width: '34px',
              flexDirection: 'row',
              minHeight: '22px',
              padding: '1px 4px',
              border: '1px solid #c8c6c4',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: sizeMenuOpen ? 100 : 'auto',
            }}
          >
            <span style={{ fontSize: '10px', color: '#222' }}>11</span>
            <span style={{ fontSize: '8px', color: '#666' }}>▾</span>
          </div>
          {sizeMenuOpen && sizeAnchorRef.current && (
            <Dropdown
              anchor={sizeAnchorRef.current}
              items={SIZES.map(size => ({
                label: `${size}px`,
                onClick: () => {
                  ((app.vault as any).setConfig)('baseFontSize', parseInt(size));
                  app.workspace.trigger('css-change');
                  setSizeMenuOpen(false);
                },
              }))}
              onClose={() => setSizeMenuOpen(false)}
            />
          )}

          {/* Bullet list */}
          <div
            className="onr-btn-sm"
            title="Bullet list"
            onClick={handleBulletList}
            data-cmd="bullet-list"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span style={{ fontSize: '7px' }}>▾</span>
          </div>

          {/* Numbered list */}
          <div
            className="onr-btn-sm"
            title="Numbered list"
            onClick={handleNumberedList}
            data-cmd="numbered-list"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 10h2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 14H4l2 2-2 2h2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: '7px' }}>▾</span>
          </div>

          {/* Outdent */}
          <div
            className="onr-btn-sm"
            title="Decrease indent"
            onClick={handleOutdent}
            data-cmd="outdent"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <polyline points="7 8 3 12 7 16" />
              <line x1="21" y1="12" x2="3" y2="12" />
              <line x1="21" y1="6" x2="11" y2="6" />
              <line x1="21" y1="18" x2="11" y2="18" />
            </svg>
          </div>

          {/* Indent */}
          <div
            className="onr-btn-sm"
            title="Increase indent"
            onClick={handleIndent}
            data-cmd="indent"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <polyline points="17 8 21 12 17 16" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="13" y2="6" />
              <line x1="3" y1="18" x2="13" y2="18" />
            </svg>
          </div>

          {/* Clear formatting */}
          <div
            className="onr-btn-sm"
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </div>
        </div>

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Clear inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {/* Bold */}
          <div
            className="onr-btn-sm"
            title="Bold"
            onClick={handleBold}
            data-cmd="bold"
            style={{ minHeight: '22px', width: '22px', fontWeight: '700', fontSize: '13px' }}
          >
            B
          </div>

          {/* Italic */}
          <div
            className="onr-btn-sm"
            title="Italic"
            onClick={handleItalic}
            data-cmd="italic"
            style={{ minHeight: '22px', width: '22px', fontStyle: 'italic', fontSize: '13px' }}
          >
            I
          </div>

          {/* Underline */}
          <div
            className="onr-btn-sm"
            title="Underline"
            onClick={handleUnderline}
            data-cmd="underline"
            style={{ minHeight: '22px', width: '22px', textDecoration: 'underline', fontSize: '12px', fontWeight: '600' }}
          >
            U
          </div>

          {/* Strikethrough */}
          <div
            className="onr-btn-sm"
            title="Strikethrough"
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <s style={{ fontSize: '11px' }}>ab</s>
          </div>

          {/* Subscript */}
          <div
            className="onr-btn-sm"
            title="Subscript"
            onClick={handleSubscript}
            data-cmd="subscript"
            style={{ minHeight: '22px', width: '22px', fontSize: '10px' }}
          >
            x<sub style={{ fontSize: '7px' }}>2</sub>
          </div>

          {/* Superscript */}
          <div
            className="onr-btn-sm"
            title="Superscript"
            onClick={handleSuperscript}
            data-cmd="superscript"
            style={{ minHeight: '22px', width: '22px', fontSize: '10px' }}
          >
            x<sup style={{ fontSize: '7px' }}>2</sup>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', background: '#d0d0d0', margin: '0 1px' }} />

          {/* Highlight with color swatch */}
          <div
            className="onr-btn-sm"
            title="Highlight"
            onClick={handleHighlight}
            data-cmd="highlight"
            style={{ minHeight: '18px', width: '26px', padding: '1px 2px', flexDirection: 'column', gap: '1px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24" style={{ width: '12px', height: '12px' }}>
              <path d="M9 11l-6 6v3h3l6-6" />
              <path d="M22 5.54a2 2 0 0 0-2.83-2.83l-11.3 11.3 2.83 2.83L22 5.54z" />
            </svg>
            <div style={{ width: '14px', height: '3px', background: '#FFFF00', border: '1px solid #ccc' }} />
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', background: '#d0d0d0', margin: '0 1px' }} />

          {/* Font color A with swatch + dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <div
              className="onr-btn-sm"
              title="Font color"
              onClick={() => {}}
              data-cmd="font-color"
              style={{ minHeight: '18px', width: '22px', padding: '1px 2px' }}
            >
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#222', lineHeight: '1' }}>A</span>
              <div style={{ width: '14px', height: '3px', background: '#FF0000', border: '1px solid #ccc', marginTop: '1px' }} />
            </div>
            <div style={{ fontSize: '7px', color: '#666', lineHeight: '1' }}>▾</div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', background: '#d0d0d0', margin: '0 1px' }} />

          {/* Align */}
          <div
            className="onr-btn-sm"
            title="Align"
            onClick={() => {}}
            data-cmd="align"
            style={{ minHeight: '22px', width: '26px', flexDirection: 'row', gap: '1px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24" style={{ width: '10px', height: '10px' }}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="15" y2="18" />
            </svg>
            <span style={{ fontSize: '8px' }}>▾</span>
          </div>

          {/* Clear inline */}
          <div
            className="onr-btn-sm"
            title="Clear inline formatting"
            onClick={handleClearInline}
            data-cmd="clear-inline"
            style={{ minHeight: '22px', width: '22px' }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>
      </div>
      <div className="onr-group-name">Basic Text</div>
    </div>
  );
}
