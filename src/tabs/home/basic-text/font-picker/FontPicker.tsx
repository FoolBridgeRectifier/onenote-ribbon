import { useRef, useState } from "react";
import "./FontPicker.css";
import { useApp } from "../../../../shared/context/AppContext";
import { Dropdown } from "../../../../shared/components/dropdown/Dropdown";
import { applyFontFamily } from "./applyFontFamily";
import { applyFontSize } from "./applyFontSize";

const FONTS = [
  "Arial",
  "Arial Black",
  "Book Antiqua",
  "Calibri",
  "Comic Sans MS",
  "Courier New",
  "Franklin Gothic Medium",
  "Georgia",
  "Helvetica",
  "Impact",
  "Palatino",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

const SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "36",
  "48",
  "72",
];

const DEFAULT_FONT_LABEL = "Font";
const DEFAULT_SIZE_LABEL = "11";

export function FontPicker() {
  const app = useApp();
  const fontAnchorRef = useRef<HTMLDivElement>(null);
  const sizeAnchorRef = useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleFontSelect = (font: string) => {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;

    applyFontFamily(editor, font);
    setSelectedFont(font);
    setFontMenuOpen(false);
  };

  const handleSizeSelect = (size: string) => {
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;

    applyFontSize(editor, parseInt(size, 10));
    setSelectedSize(size);
    setSizeMenuOpen(false);
  };

  return (
    <>
      <div
        ref={fontAnchorRef}
        className="onr-btn-sm onr-font-picker"
        title="Font family"
        onClick={() => setFontMenuOpen(!fontMenuOpen)}
        data-cmd="font-family"
      >
        <span className="onr-picker-label">
          {selectedFont ?? DEFAULT_FONT_LABEL}
        </span>
        <span className="onr-picker-caret">▾</span>
      </div>
      {fontMenuOpen && fontAnchorRef.current && (
        <Dropdown
          anchor={fontAnchorRef.current}
          items={FONTS.map((font) => ({
            label: font,
            onClick: () => handleFontSelect(font),
          }))}
          onClose={() => setFontMenuOpen(false)}
        />
      )}

      <div
        ref={sizeAnchorRef}
        className="onr-btn-sm onr-size-picker"
        title="Font size"
        onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
        data-cmd="font-size"
      >
        <span className="onr-picker-label">
          {selectedSize ?? DEFAULT_SIZE_LABEL}
        </span>
        <span className="onr-picker-caret">▾</span>
      </div>
      {sizeMenuOpen && sizeAnchorRef.current && (
        <Dropdown
          anchor={sizeAnchorRef.current}
          items={SIZES.map((size) => ({
            label: size,
            onClick: () => handleSizeSelect(size),
          }))}
          onClose={() => setSizeMenuOpen(false)}
        />
      )}
    </>
  );
}
