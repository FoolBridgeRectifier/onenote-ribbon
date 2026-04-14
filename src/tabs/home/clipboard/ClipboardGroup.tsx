import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import './clipboard-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { PasteOptionsDropdown } from './paste-options/PasteOptionsDropdown';
import { useFormatPainter } from '../../../shared/hooks/useFormatPainter';
import {
  CopyIcon,
  CutIcon,
  FormatPainterIcon,
  PasteCodeIcon,
  PasteIcon,
  PasteTextIcon,
} from '../../../assets/icons';

export function ClipboardGroup() {
  const app = useApp();
  const pasteAnchorRef = useRef<HTMLDivElement>(null);
  const [pasteMenuOpen, setPasteMenuOpen] = useState(false);
  const formatPainter = useFormatPainter(app);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handlePaste = () => {
    const editor = getEditor();
    if (!editor) return;

    navigator.clipboard.readText().then((text) => {
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

  const handleFormatPainterClick = (event: MouseEvent<HTMLDivElement>) => {
    formatPainter.handleSingleClick(event.detail);
  };

  const handleFormatPainterDoubleClick = () => {
    formatPainter.handleDoubleClick();
  };

  return (
    <GroupShell name="Clipboard">
      <div className="onr-clipboard-inner">
        {/* Big Paste button with dropdown */}
        <div className="onr-clipboard-paste">
          <RibbonButton
            ref={pasteAnchorRef}
            size="large"
            className="onr-paste-main"
            icon={<PasteIcon className="onr-icon" />}
            label="Paste"
            title="Paste from clipboard"
            onClick={handlePaste}
            data-cmd="paste"
          />
          <RibbonButton
            className="onr-paste-dropdown"
            title="Paste special"
            onClick={handlePasteSpecial}
            data-cmd="paste-dropdown"
          >
            ▾
          </RibbonButton>
        </div>

        {pasteMenuOpen && (
          <PasteOptionsDropdown
            anchor={pasteAnchorRef.current}
            options={[
              {
                icon: <PasteTextIcon className="onr-icon-sm" />,
                title: 'Paste plain text',
                onClick: handlePaste,
              },
              {
                icon: <PasteCodeIcon className="onr-icon-sm" />,
                title: 'Paste as code block',
                onClick: () => {
                  const editor = getEditor();
                  if (!editor) return;
                  navigator.clipboard.readText().then((text) => {
                    editor.replaceSelection(`\`\`\`\n${text}\n\`\`\``);
                  });
                },
              },
            ]}
            onClose={() => setPasteMenuOpen(false)}
          />
        )}

        {/* Stacked small buttons: Cut / Copy / Format Painter */}
        <div className="onr-clipboard-stack">
          <RibbonButton
            className="onr-clipboard-item"
            icon={<CutIcon className="onr-icon-sm" />}
            label="Cut"
            title="Cut selection"
            onClick={handleCut}
            data-cmd="cut"
          />
          <RibbonButton
            className="onr-clipboard-item"
            icon={<CopyIcon className="onr-icon-sm" />}
            label="Copy"
            title="Copy selection"
            onClick={handleCopy}
            data-cmd="copy"
          />
          <RibbonButton
            className="onr-clipboard-item"
            icon={<FormatPainterIcon className="onr-icon-sm" />}
            label="Format Painter"
            active={formatPainter.state.mode !== 'idle'}
            onClick={handleFormatPainterClick}
            onDoubleClick={handleFormatPainterDoubleClick}
            data-cmd="format-painter"
          />
        </div>
      </div>
    </GroupShell>
  );
}
