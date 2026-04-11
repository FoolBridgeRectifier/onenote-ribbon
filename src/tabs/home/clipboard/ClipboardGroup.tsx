import { useRef, useState } from 'react';
import { useApp } from '../../../shared/context/AppContext';
import { useFormatPainterContext } from '../../../shared/context/FormatPainterContext';
import { Dropdown } from '../../../shared/components/Dropdown';

export function ClipboardGroup() {
  const app = useApp();
  const formatPainter = useFormatPainterContext();
  const pasteAnchorRef = useRef<HTMLDivElement>(null);
  const [pasteMenuOpen, setPasteMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handlePaste = () => {
    const editor = getEditor();
    if (!editor) return;

    navigator.clipboard.readText().then(text => {
      editor.replaceSelection(text);
    });
  };

  const handlePasteSpecial = () => {
    setPasteMenuOpen(!pasteMenuOpen);
  };

  const handleCut = () => {
    const editor = getEditor();
    if (!editor) return;

    document.execCommand('cut');
  };

  const handleCopy = () => {
    const editor = getEditor();
    if (!editor) return;

    document.execCommand('copy');
  };

  const handleFormatPainterClick = () => {
    const editor = getEditor();
    if (!editor) return;

    const sourceLine = editor.getLine(editor.getCursor().line);
    const prefixMatch = sourceLine.match(/^(#+\s|\*\*|__|~~)?/);
    const prefix = prefixMatch?.[1] ?? '';

    formatPainter.setIsActive(!formatPainter.isActive);
    if (!formatPainter.isActive) {
      formatPainter.setFormat({ prefix, suffix: '' });
    }
  };

  return (
    <div className="onr-group">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px', flex: 1 }}>
        {/* Big Paste button with dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          <div
            ref={pasteAnchorRef}
            className="onr-btn"
            title="Paste from clipboard"
            onClick={handlePaste}
            data-cmd="paste"
            style={{
              width: '46px',
              minHeight: '46px',
              borderBottom: 'none',
              borderRadius: '3px 3px 0 0',
              gap: '4px',
            }}
          >
            <svg className="onr-icon" viewBox="0 0 24 24">
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
              <polyline points="9 14 12 17 15 14" />
              <line x1="12" y1="10" x2="12" y2="17" />
            </svg>
            <span className="onr-btn-label" style={{ fontSize: '10px' }}>Paste</span>
          </div>
          <div
            className="onr-btn-sm"
            title="Paste special"
            onClick={handlePasteSpecial}
            data-cmd="paste-dropdown"
            style={{
              width: '46px',
              borderTop: '1px solid #d0d0d0',
              borderRadius: '0 0 3px 3px',
              minHeight: '14px',
              fontSize: '9px',
            }}
          >
            ▾
          </div>
        </div>

        {pasteMenuOpen && pasteAnchorRef.current && (
          <Dropdown
            anchor={pasteAnchorRef.current}
            items={[
              {
                label: 'Paste plain text',
                onClick: handlePaste,
              },
              {
                label: 'Paste as code block',
                onClick: () => {
                  const editor = getEditor();
                  if (!editor) return;
                  navigator.clipboard.readText().then(text => {
                    editor.replaceSelection(`\`\`\`\n${text}\n\`\`\``);
                  });
                },
              },
            ]}
            onClose={() => setPasteMenuOpen(false)}
          />
        )}

        {/* Stacked small buttons: Cut / Copy / Format Painter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingTop: '2px' }}>
          <div
            className="onr-btn-sm"
            title="Cut selection"
            onClick={handleCut}
            data-cmd="cut"
            style={{
              width: '68px',
              flexDirection: 'row',
              gap: '4px',
              padding: '2px 4px',
            }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <span className="onr-btn-label-sm">Cut</span>
          </div>
          <div
            className="onr-btn-sm"
            title="Copy selection"
            onClick={handleCopy}
            data-cmd="copy"
            style={{
              width: '68px',
              flexDirection: 'row',
              gap: '4px',
              padding: '2px 4px',
            }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span className="onr-btn-label-sm">Copy</span>
          </div>
          <div
            className={`onr-btn-sm ${formatPainter.isActive ? 'onr-active' : ''}`}
            title={formatPainter.isActive ? 'Disable format painter' : 'Enable format painter'}
            onClick={handleFormatPainterClick}
            data-cmd="format-painter"
            style={{
              width: '68px',
              flexDirection: 'row',
              gap: '4px',
              padding: '2px 4px',
            }}
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            <span className="onr-btn-label-sm">Format Painter</span>
          </div>
        </div>
      </div>
      <div className="onr-group-name">Clipboard</div>
    </div>
  );
}
