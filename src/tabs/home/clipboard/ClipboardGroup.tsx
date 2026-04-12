import { useRef, useState } from "react";
import "./ClipboardGroup.css";
import { useApp } from "../../../shared/context/AppContext";
import { useFormatPainterContext } from "../../../shared/context/FormatPainterContext";
import { PasteOptionsDropdown } from "./paste-options/PasteOptionsDropdown";
import {
  CopyIcon,
  CutIcon,
  FormatPainterIcon,
  PasteCodeIcon,
  PasteIcon,
  PasteTextIcon,
} from "../../../assets/icons";

export function ClipboardGroup() {
  const app = useApp();
  const formatPainter = useFormatPainterContext();
  const pasteAnchorRef = useRef<HTMLDivElement>(null);
  const [pasteMenuOpen, setPasteMenuOpen] = useState(false);

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

    document.execCommand("cut");
  };

  const handleCopy = () => {
    const editor = getEditor();
    if (!editor) return;

    document.execCommand("copy");
  };

  const handleFormatPainterClick = () => {
    const editor = getEditor();
    if (!editor) return;

    const sourceLine = editor.getLine(editor.getCursor().line);
    const prefixMatch = sourceLine.match(/^(#+\s|\*\*|__|~~)?/);
    const prefix = prefixMatch?.[1] ?? "";

    formatPainter.setIsActive(!formatPainter.isActive);
    if (!formatPainter.isActive) {
      formatPainter.setFormat({ prefix, suffix: "" });
    }
  };

  return (
    <div className="onr-group">
      <div className="onr-clipboard-inner">
        {/* Big Paste button with dropdown */}
        <div className="onr-clipboard-paste">
          <div
            ref={pasteAnchorRef}
            className="onr-btn onr-paste-main"
            title="Paste from clipboard"
            onClick={handlePaste}
            data-cmd="paste"
          >
            <PasteIcon className="onr-icon" />
            <span className="onr-btn-label">Paste</span>
          </div>
          <div
            className="onr-btn-sm onr-paste-dropdown"
            title="Paste special"
            onClick={handlePasteSpecial}
            data-cmd="paste-dropdown"
          >
            ▾
          </div>
        </div>

        {pasteMenuOpen && (
          <PasteOptionsDropdown
            anchor={pasteAnchorRef.current}
            options={[
              {
                icon: <PasteTextIcon className="onr-icon-sm" />,
                title: "Paste plain text",
                onClick: handlePaste,
              },
              {
                icon: <PasteCodeIcon className="onr-icon-sm" />,
                title: "Paste as code block",
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
          <div
            className="onr-btn-sm onr-clipboard-item"
            title="Cut selection"
            onClick={handleCut}
            data-cmd="cut"
          >
            <CutIcon className="onr-icon-sm" />
            <span className="onr-btn-label-sm">Cut</span>
          </div>
          <div
            className="onr-btn-sm onr-clipboard-item"
            title="Copy selection"
            onClick={handleCopy}
            data-cmd="copy"
          >
            <CopyIcon className="onr-icon-sm" />
            <span className="onr-btn-label-sm">Copy</span>
          </div>
          <div
            className={`onr-btn-sm onr-clipboard-item${formatPainter.isActive ? " onr-active" : ""}`}
            title={
              formatPainter.isActive
                ? "Disable format painter"
                : "Enable format painter"
            }
            onClick={handleFormatPainterClick}
            data-cmd="format-painter"
          >
            <FormatPainterIcon className="onr-icon-sm" />
            <span className="onr-btn-label-sm">Format Painter</span>
          </div>
        </div>
      </div>
      <div className="onr-group-name">Clipboard</div>
    </div>
  );
}
