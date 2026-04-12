import { useRef, useState } from "react";
import "./BasicTextGroup.css";
import { useApp } from "../../../shared/context/AppContext";
import { Dropdown } from "../../../shared/components/Dropdown";
import {
  AlignLeftIcon,
  BulletListIcon,
  ClearFormattingIcon,
  ClearInlineIcon,
  HighlightIcon,
  IndentIcon,
  NumberedListIcon,
  OutdentIcon,
} from "../../../assets/icons";
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
            <BulletListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </div>

          {/* Numbered list */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Numbered list"
            onClick={handleNumberedList}
            data-cmd="numbered-list"
          >
            <NumberedListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </div>

          {/* Outdent */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Decrease indent"
            onClick={handleOutdent}
            data-cmd="outdent"
          >
            <OutdentIcon className="onr-icon-sm" />
          </div>

          {/* Indent */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Increase indent"
            onClick={handleIndent}
            data-cmd="indent"
          >
            <IndentIcon className="onr-icon-sm" />
          </div>

          {/* Clear formatting */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
          >
            <ClearFormattingIcon className="onr-icon-sm" />
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
            <HighlightIcon className="onr-icon-sm" />
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
            <AlignLeftIcon className="onr-icon-sm" />
            <span className="onr-align-caret">▾</span>
          </div>

          {/* Clear inline */}
          <div
            className="onr-btn-sm onr-clear-inline-btn"
            title="Clear inline formatting"
            onClick={handleClearInline}
            data-cmd="clear-inline"
          >
            <ClearInlineIcon className="onr-icon-sm" />
          </div>
        </div>
      </div>
      <div className="onr-group-name">Basic Text</div>
    </div>
  );
}
