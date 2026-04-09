import { useState, useRef } from "react";
import { Notice } from "obsidian";

import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";
import { Dropdown } from "../../../shared/components/Dropdown";
import { EditorState } from "../../../shared/hooks/useEditorState";
import { toggleInline } from "../../../shared/toggleInline";
import { toggleSubSup } from "../../../shared/toggleSubSup";
import { toggleLinePrefix } from "../../../shared/toggleLinePrefix";
import { clearFormatting } from "./clearFormatting";

interface Props {
  editorState: EditorState;
}

const FONTS = [
  "Segoe UI", "Arial", "Calibri", "Cambria", "Consolas",
  "Courier New", "Georgia", "Helvetica", "Times New Roman",
  "Trebuchet MS", "Verdana", "Comic Sans MS",
];

const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];

const COLORS = [
  { label: "Black",    hex: "#000000" },
  { label: "Dark Red", hex: "#C00000" },
  { label: "Red",      hex: "#FF0000" },
  { label: "Orange",   hex: "#FF6600" },
  { label: "Yellow",   hex: "#FFFF00" },
  { label: "Green",    hex: "#00B050" },
  { label: "Blue",     hex: "#0070C0" },
  { label: "Purple",   hex: "#7030A0" },
  { label: "White",    hex: "#FFFFFF" },
  { label: "Gray",     hex: "#808080" },
];

export function BasicTextGroup({ editorState }: Props) {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;
  const executeCommand = (id: string) => (app as any).commands.executeCommandById(id);

  const [fontAnchor,  setFontAnchor]  = useState<HTMLElement | null>(null);
  const [sizeAnchor,  setSizeAnchor]  = useState<HTMLElement | null>(null);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [alignAnchor, setAlignAnchor] = useState<HTMLElement | null>(null);
  const fontRef  = useRef<HTMLDivElement>(null);
  const sizeRef  = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const alignRef = useRef<HTMLDivElement>(null);

  const clearStyle = (inlineOnly = false) => {
    const editor = getEditor();
    if (!editor) return;
    clearFormatting(editor, inlineOnly);
  };

  const fontItems = FONTS.map((fontName) => ({
    label: fontName,
    style: `font-family:${fontName};font-size:12px`,
    action: () => {
      const editor = getEditor();
      if (!editor) return;
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`<span style="font-family:${fontName}">${selection}</span>`);
      } else {
        (app.vault as any).setConfig("fontText", fontName);
        app.workspace.trigger("css-change");
      }
    },
  }));

  const sizeItems = SIZES.map((pointSize) => ({
    label: `${pointSize}`,
    action: () => {
      const editor = getEditor();
      if (!editor) return;
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`<span style="font-size:${pointSize}px">${selection}</span>`);
      } else {
        (app.vault as any).setConfig("baseFontSize", pointSize);
        app.workspace.trigger("css-change");
      }
    },
  }));

  const colorItems = COLORS.map((colorItem) => ({
    label: colorItem.label,
    style: `color:${colorItem.hex}${colorItem.hex === "#FFFFFF" ? ";background:#333" : ""}`,
    action: () => {
      const selection = getEditor()?.getSelection();
      if (selection) {
        getEditor()?.replaceSelection(`<span style="color:${colorItem.hex}">${selection}</span>`);
      }
    },
  }));

  const alignItems = [
    { label: "⇐  Align Left",  sublabel: "Ctrl+L", action: () => applyAlign(getEditor(), "left") },
    { label: "⇔  Center",      sublabel: "Ctrl+E", action: () => applyAlign(getEditor(), "center") },
    { label: "⇒  Align Right", sublabel: "Ctrl+R", action: () => applyAlign(getEditor(), "right") },
    { label: "⇔  Justify",     sublabel: "Ctrl+J", action: () => applyAlign(getEditor(), "justify") },
  ];

  return (
    <GroupShell name="Basic Text" dataGroup="Basic Text">
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          className="onr-row"
          style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 0 0 0" }}
        >
          <div ref={fontRef}>
            <RibbonButton
              label={editorState.fontFamily || "Font"}
              data-cmd="font-family"
              style={{ minWidth: 80 }}
              onClick={() => setFontAnchor(fontRef.current)}
            />
          </div>
          <div ref={sizeRef}>
            <RibbonButton
              label={editorState.fontSize || "Size"}
              data-cmd="font-size"
              style={{ minWidth: 36 }}
              onClick={() => setSizeAnchor(sizeRef.current)}
            />
          </div>
          <RibbonButton label="• List"  data-cmd="bullet-list"   active={editorState.bulletList}   onClick={() => { const editor = getEditor(); if (editor) toggleLinePrefix(editor, "- "); }} />
          <RibbonButton label="1. List" data-cmd="numbered-list" active={editorState.numberedList} onClick={() => { const editor = getEditor(); if (editor) toggleLinePrefix(editor, "1. "); }} />
          <RibbonButton label="⇤ Out"  data-cmd="outdent"        onClick={() => executeCommand("editor:unindent-list")} />
          <RibbonButton label="⇥ In"   data-cmd="indent"         onClick={() => executeCommand("editor:indent-list")} />
          <RibbonButton label="🧹 Clear" data-cmd="clear-formatting" onClick={() => clearStyle(false)} />
        </div>

        <div
          className="onr-row"
          style={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <RibbonButton label="B"  data-cmd="bold"          active={editorState.bold}          style={{ fontWeight: "bold" }}           onClick={() => { const editor = getEditor(); if (editor) toggleInline(editor, "**"); }} />
          <RibbonButton label="I"  data-cmd="italic"        active={editorState.italic}        style={{ fontStyle: "italic" }}          onClick={() => { const editor = getEditor(); if (editor) toggleInline(editor, "*"); }} />
          <RibbonButton label="U"  data-cmd="underline"     active={editorState.underline}     style={{ textDecoration: "underline" }}  onClick={() => { const editor = getEditor(); if (editor) toggleInline(editor, "<u>", "</u>"); }} />
          <RibbonButton label="S̶"  data-cmd="strikethrough" active={editorState.strikethrough}                                          onClick={() => { const editor = getEditor(); if (editor) toggleInline(editor, "~~"); }} />
          <RibbonButton label="x₂" data-cmd="subscript"    active={editorState.subscript}                                               onClick={() => { const editor = getEditor(); if (editor) toggleSubSup(editor, "sub"); }} />
          <RibbonButton label="x²" data-cmd="superscript"  active={editorState.superscript}                                             onClick={() => { const editor = getEditor(); if (editor) toggleSubSup(editor, "sup"); }} />

          <div style={{ width: 1, height: 18, background: "#d0d0d0", margin: "0 1px", flexShrink: 0 }} />

          <RibbonButton label="H̲"  data-cmd="highlight"    active={editorState.highlight}     onClick={() => { const editor = getEditor(); if (editor) toggleInline(editor, "=="); }} />
          <div ref={colorRef}>
            <RibbonButton label="A" data-cmd="font-color" onClick={() => setColorAnchor(colorRef.current)} />
          </div>

          <div style={{ width: 1, height: 18, background: "#d0d0d0", margin: "0 1px", flexShrink: 0 }} />

          <div ref={alignRef}>
            <RibbonButton label="⇔" data-cmd="align" onClick={() => setAlignAnchor(alignRef.current)} />
          </div>
          <RibbonButton label="A̶" data-cmd="clear-inline" onClick={() => clearStyle(true)} />
        </div>
      </div>

      {fontAnchor  && <Dropdown anchor={fontAnchor}  items={fontItems}  onClose={() => setFontAnchor(null)} />}
      {sizeAnchor  && <Dropdown anchor={sizeAnchor}  items={sizeItems}  onClose={() => setSizeAnchor(null)} />}
      {colorAnchor && <Dropdown anchor={colorAnchor} items={colorItems} onClose={() => setColorAnchor(null)} />}
      {alignAnchor && <Dropdown anchor={alignAnchor} items={alignItems} onClose={() => setAlignAnchor(null)} />}
    </GroupShell>
  );
}

function applyAlign(editor: any, align: string) {
  if (!editor) {
    new Notice("No active editor");
    return;
  }

  const selection = editor.getSelection();
  if (selection) {
    editor.replaceSelection(`<div style="text-align:${align}">\n\n${selection}\n\n</div>`);
  } else {
    const cursor = editor.getCursor();
    const line   = editor.getLine(cursor.line);
    editor.setLine(cursor.line, `<div style="text-align:${align}">${line}</div>`);
  }
}
