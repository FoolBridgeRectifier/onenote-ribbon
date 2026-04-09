import { useState, useRef } from "react";

import { useApp } from "../../../shared/context/AppContext";
import { GroupShell } from "../../../shared/components/GroupShell";
import { RibbonButton } from "../../../shared/components/RibbonButton";
import { Dropdown, parseCssString } from "../../../shared/components/Dropdown";
import { EditorState } from "../../../shared/hooks/useEditorState";
import { STYLES_LIST } from "./styles-data";

interface Props {
  editorState: EditorState;
  stylesOffset: number;
  setStylesOffset: (offset: number) => void;
}

export function StylesGroup({
  editorState,
  stylesOffset,
  setStylesOffset,
}: Props) {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;
  const [dropAnchor, setDropAnchor] = useState<HTMLElement | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const applyStyle = (index: number) => {
    const editor = getEditor();
    if (!editor) return;
    const styleEntry = STYLES_LIST[index];
    if (!styleEntry) return;
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const stripped = line.replace(/^#{1,6}\s+/, "");
    if (styleEntry.prefix) {
      if (line === styleEntry.prefix + stripped)
        editor.setLine(cursor.line, stripped);
      else editor.setLine(cursor.line, styleEntry.prefix + stripped);
    } else {
      editor.setLine(cursor.line, stripped);
    }
  };

  const isActiveStyle = (index: number) => {
    const styleEntry = STYLES_LIST[index];
    if (!styleEntry) return false;
    const { headLevel } = editorState;
    return (
      (headLevel > 0 && styleEntry.prefix === "#".repeat(headLevel) + " ") ||
      (headLevel === 0 && styleEntry.label === "Normal")
    );
  };

  const clearFormattingItem = {
    label: "🧹  Clear Formatting",
    style: "font-size:11px;color:#e0e0e0",
    action: () => {
      const editor = getEditor();
      if (!editor) return;
      const hasSelection = !!editor.getSelection();
      const rawText = hasSelection
        ? editor.getSelection()
        : editor.getLine(editor.getCursor().line);
      const cleaned = rawText
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.*?)\*\*/gs, "$1")
        .replace(/\*(.*?)\*/gs, "$1")
        .replace(/_(.*?)_/gs, "$1")
        .replace(/~~(.*?)~~/gs, "$1")
        .replace(/==(.*?)==/gs, "$1")
        .replace(/`(.*?)`/gs, "$1")
        .replace(/<\/?[^>]+(>|$)/g, "");
      if (hasSelection) editor.replaceSelection(cleaned);
      else editor.setLine(editor.getCursor().line, cleaned);
    },
  };

  const dropItems = [
    ...STYLES_LIST.map((styleEntry, index) => ({
      label: styleEntry.label,
      style: styleEntry.style + ";padding:4px 12px",
      action: () => applyStyle(index),
    })),
    { label: "", divider: true as const, action: () => {} },
    clearFormattingItem,
  ];

  return (
    <GroupShell name="Styles" dataGroup="Styles">
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 130,
          }}
        >
          {[0, 1].map((rowIndex) => {
            const styleEntry = STYLES_LIST[stylesOffset + rowIndex];
            return styleEntry ? (
              <div
                key={rowIndex}
                className={`onr-btn-sm${isActiveStyle(stylesOffset + rowIndex) ? " onr-active" : ""}`}
                data-cmd={`styles-preview-${rowIndex}`}
                style={{
                  width: 130,
                  minHeight: 28,
                  background: "#1a1a2e",
                  border: "1px solid #555",
                  borderRadius: 2,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  padding: "2px 8px",
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={() => applyStyle(stylesOffset + rowIndex)}
              >
                <span style={parseCssString(styleEntry.style)}>
                  {styleEntry.label}
                </span>
              </div>
            ) : null;
          })}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <RibbonButton
            label="▲"
            data-cmd="styles-scroll-up"
            style={{ width: 16, fontSize: 9, padding: 0 }}
            onClick={() => setStylesOffset(Math.max(0, stylesOffset - 1))}
          />
          <div ref={dropRef}>
            <RibbonButton
              label="▾"
              data-cmd="styles-dropdown"
              style={{ width: 16, fontSize: 9, padding: 0 }}
              onClick={() => setDropAnchor(dropRef.current)}
            />
          </div>
          <RibbonButton
            label="▼"
            data-cmd="styles-scroll-down"
            style={{ width: 16, fontSize: 9, padding: 0 }}
            onClick={() =>
              setStylesOffset(
                Math.min(STYLES_LIST.length - 2, stylesOffset + 1),
              )
            }
          />
        </div>
      </div>

      {dropAnchor && (
        <Dropdown
          anchor={dropAnchor}
          items={dropItems}
          opts={{ bg: "#1a1a2e", hoverBg: "#2a2a4e", color: "#e0e0e0" }}
          onClose={() => setDropAnchor(null)}
        />
      )}
    </GroupShell>
  );
}
