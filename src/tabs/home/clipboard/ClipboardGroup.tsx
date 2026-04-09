import { useState, useRef } from 'react';
import { Notice } from 'obsidian';

import { useApp } from '../../../shared/context/AppContext';
import { useFormatPainterContext } from '../../../shared/context/FormatPainterContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';
import { Dropdown } from '../../../shared/components/Dropdown';
import { applyFormatPainter } from './format-painter/applyFormatPainter';

export function ClipboardGroup() {
  const app = useApp();
  const formatPainter = useFormatPainterContext();
  const [pasteMenuAnchor, setPasteMenuAnchor] = useState<HTMLElement | null>(null);
  const pasteAnchorRef = useRef<HTMLDivElement>(null);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const paste = () =>
    navigator.clipboard.readText().then(clipboardText =>
      getEditor()?.replaceSelection(clipboardText)
    );

  const cut = () => {
    const selection = getEditor()?.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection).then(() => getEditor()?.replaceSelection(''));
    }
  };

  const copy = () => {
    const selection = getEditor()?.getSelection();
    if (selection) navigator.clipboard.writeText(selection);
  };

  const onFormatPainterClick = () => {
    const editor = getEditor();
    if (!editor) return;

    if (formatPainter.active) {
      const selection = editor.getSelection();
      if (formatPainter.format && selection) {
        applyFormatPainter(editor, selection, formatPainter.format);
        formatPainter.clear();
      } else if (formatPainter.format && !selection) {
        new Notice('Format Painter: select text first, then click again');
      }
      return;
    }

    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const sourceText = editor.getSelection() || line;
    formatPainter.capture({
      headPrefix:  line.match(/^(#{1,6} )/)?.[0] ?? '',
      isBold:      /\*\*(.*?)\*\*/.test(sourceText),
      isItalic:    /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(sourceText),
      isUnderline: /<u>/.test(sourceText),
    });
    new Notice('Format Painter: select target text then click again to apply');
  };

  const pasteMenuItems = [
    { label: 'Paste', sublabel: 'Ctrl+V', action: paste },
    {
      label: 'Paste as Plain Text', sublabel: 'Ctrl+Shift+V',
      action: () =>
        navigator.clipboard.readText().then(clipboardText => {
          getEditor()?.replaceSelection(
            clipboardText.replace(/<[^>]+>/g, '').replace(/\r\n/g, '\n')
          );
        }),
    },
    { label: 'Paste Special…', disabled: true, action: () => {} },
  ];

  return (
    <GroupShell name="Clipboard" dataGroup="Clipboard">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <RibbonButton
            label="Paste" className="onr-btn-lg" data-cmd="paste"
            onClick={paste}
          />
          <div ref={pasteAnchorRef}>
            <RibbonButton
              label="▾" className="onr-btn-sm"
              style={{ width: 14, fontSize: 9 }}
              onClick={() => setPasteMenuAnchor(pasteAnchorRef.current)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 2 }}>
          <RibbonButton label="✂ Cut"  data-cmd="cut"  onClick={cut} />
          <RibbonButton label="⎘ Copy" data-cmd="copy" onClick={copy} />
          <RibbonButton
            icon={<FormatPainterIcon />}
            label="Format Painter"
            data-cmd="format-painter"
            active={formatPainter.active}
            style={{ width: 68, flexDirection: 'row', gap: 4, padding: '2px 4px' }}
            onClick={onFormatPainterClick}
          />
        </div>
      </div>

      {pasteMenuAnchor && (
        <Dropdown
          anchor={pasteMenuAnchor}
          items={pasteMenuItems}
          onClose={() => setPasteMenuAnchor(null)}
        />
      )}
    </GroupShell>
  );
}

function FormatPainterIcon() {
  return (
    <svg className="onr-icon-sm" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  );
}
