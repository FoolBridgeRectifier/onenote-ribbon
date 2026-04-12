import { useRef, useState } from "react";
import "./BasicTextGroup.css";
import { useApp } from "../../../shared/context/AppContext";
import { Dropdown } from "../../../shared/components/Dropdown";
import { clearFormatting } from "./clearFormatting";

const FONTS = [
  "System Default",
  "Monospace",
  "Arial",
  "Times New Roman",
  "Georgia",
];
const SIZES = ["12", "14", "16", "18", "20", "24"];

export function BasicTextGroup() {
  const app = useApp();
  const fontAnchorRef = useRef<HTMLDivElement>(null);
  const sizeAnchorRef = useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBold = () => {
    (app as any).commands.executeCommandById("editor:toggle-bold");
  };

  const handleItalic = () => {
    (app as any).commands.executeCommandById("editor:toggle-italic");
  };

  const handleUnderline = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<u>${selection}</u>`);
  };

  const handleStrikethrough = () => {
    (app as any).commands.executeCommandById("editor:toggle-strikethrough");
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
    (app as any).commands.executeCommandById("editor:toggle-bullet-list");
  };

  const handleNumberedList = () => {
    (app as any).commands.executeCommandById("editor:toggle-numbered-list");
  };

  const handleOutdent = () => {
    (app as any).commands.executeCommandById("editor:unindent-list");
  };

  const handleIndent = () => {
    (app as any).commands.executeCommandById("editor:indent-list");
  };

  const handleHighlight = () => {
    (app as any).commands.executeCommandById("editor:toggle-highlight");
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
      <div className="onr-basic-text-inner">
        {/* Row 1: Font, size, bullets, lists, indent, clear */}
        <div className="onr-basic-text-row1">
          {/* Font family dropdown */}
          <div
            ref={fontAnchorRef}
            className="onr-btn-sm onr-font-picker"
            title="Font family"
            onClick={() => setFontMenuOpen(!fontMenuOpen)}
            data-cmd="font-family"
          >
            <span className="onr-picker-label">Font</span>
            <span className="onr-picker-caret">▾</span>
          </div>
          {fontMenuOpen && fontAnchorRef.current && (
            <Dropdown
              anchor={fontAnchorRef.current}
              items={FONTS.map((font) => ({
                label: font,
                onClick: () => {
                  (app.vault as any).setConfig("fontText", font);
                  app.workspace.trigger("css-change");
                  setFontMenuOpen(false);
                },
              }))}
              onClose={() => setFontMenuOpen(false)}
            />
          )}

          {/* Font size */}
          <div
            ref={sizeAnchorRef}
            className="onr-btn-sm onr-size-picker"
            title="Font size"
            onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
            data-cmd="font-size"
          >
            <span className="onr-picker-label">11</span>
            <span className="onr-picker-caret">▾</span>
          </div>
          {sizeMenuOpen && sizeAnchorRef.current && (
            <Dropdown
              anchor={sizeAnchorRef.current}
              items={SIZES.map((size) => ({
                label: `${size}px`,
                onClick: () => {
                  (app.vault as any).setConfig("baseFontSize", parseInt(size));
                  app.workspace.trigger("css-change");
                  setSizeMenuOpen(false);
                },
              }))}
              onClose={() => setSizeMenuOpen(false)}
            />
          )}

          {/* Bullet list */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Bullet list"
            onClick={handleBulletList}
            data-cmd="bullet-list"
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <circle
                cx="5"
                cy="12"
                r="1.5"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="5"
                cy="18"
                r="1.5"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            <span className="onr-list-caret">▾</span>
          </div>

          {/* Numbered list */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Numbered list"
            onClick={handleNumberedList}
            data-cmd="numbered-list"
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 10h2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 14H4l2 2-2 2h2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="onr-list-caret">▾</span>
          </div>

          {/* Outdent */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Decrease indent"
            onClick={handleOutdent}
            data-cmd="outdent"
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
            className="onr-btn-sm onr-format-btn"
            title="Increase indent"
            onClick={handleIndent}
            data-cmd="indent"
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
            className="onr-btn-sm onr-format-btn"
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </div>
        </div>

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Clear inline */}
        <div className="onr-basic-text-row2">
          {/* Bold */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-bold"
            title="Bold"
            onClick={handleBold}
            data-cmd="bold"
          >
            B
          </div>

          {/* Italic */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-italic"
            title="Italic"
            onClick={handleItalic}
            data-cmd="italic"
          >
            I
          </div>

          {/* Underline */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-underline"
            title="Underline"
            onClick={handleUnderline}
            data-cmd="underline"
          >
            U
          </div>

          {/* Strikethrough */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Strikethrough"
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
          >
            <s className="onr-strikethrough-text">ab</s>
          </div>

          {/* Subscript */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-sub"
            title="Subscript"
            onClick={handleSubscript}
            data-cmd="subscript"
          >
            x<sub className="onr-sub-text">2</sub>
          </div>

          {/* Superscript */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-sup"
            title="Superscript"
            onClick={handleSuperscript}
            data-cmd="superscript"
          >
            x<sup className="onr-sup-text">2</sup>
          </div>

          <div className="onr-divider" />

          {/* Highlight with color swatch */}
          <div
            className="onr-btn-sm onr-highlight-btn"
            title="Highlight"
            onClick={handleHighlight}
            data-cmd="highlight"
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <path d="M9 11l-6 6v3h3l6-6" />
              <path d="M22 5.54a2 2 0 0 0-2.83-2.83l-11.3 11.3 2.83 2.83L22 5.54z" />
            </svg>
            <div className="onr-highlight-swatch" />
          </div>

          <div className="onr-divider" />

          {/* Font color A with swatch + dropdown */}
          <div className="onr-color-wrapper">
            <div
              className="onr-btn-sm onr-color-btn"
              title="Font color"
              onClick={() => {}}
              data-cmd="font-color"
            >
              <span className="onr-color-label">A</span>
              <div className="onr-color-swatch" />
            </div>
            <div className="onr-color-caret">▾</div>
          </div>

          <div className="onr-divider" />

          {/* Align */}
          <div
            className="onr-btn-sm onr-align-btn"
            title="Align"
            onClick={() => {}}
            data-cmd="align"
          >
            <svg className="onr-icon-sm" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="15" y2="18" />
            </svg>
            <span className="onr-align-caret">▾</span>
          </div>

          {/* Clear inline */}
          <div
            className="onr-btn-sm onr-clear-inline-btn"
            title="Clear inline formatting"
            onClick={handleClearInline}
            data-cmd="clear-inline"
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
