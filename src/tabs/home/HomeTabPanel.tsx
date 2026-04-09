import { useState, useEffect } from "react";

import { useApp } from "../../shared/context/AppContext";
import { useEditorState } from "../../shared/hooks/useEditorState";
import { useFormatPainter } from "../../shared/hooks/useFormatPainter";
import { FormatPainterContext } from "../../shared/context/FormatPainterContext";
import { STYLES_LIST } from "./styles/styles-data";
import { ClipboardGroup } from "./clipboard/ClipboardGroup";
import { BasicTextGroup } from "./basic-text/BasicTextGroup";
import { StylesGroup } from "./styles/StylesGroup";
import { TagsGroup } from "./tags/TagsGroup";
import { EmailGroup } from "./email/EmailGroup";
import { NavigateGroup } from "./navigate/NavigateGroup";
import { applyFormatPainter } from "./clipboard/format-painter/applyFormatPainter";

export function HomeTabPanel() {
  const app = useApp();
  const editorState = useEditorState(app);
  const formatPainter = useFormatPainter();
  const [stylesOffset, setStylesOffset] = useState(0);

  useEffect(() => {
    const { headLevel } = editorState;
    if (headLevel >= 1 && headLevel <= 6) {
      const desired = Math.max(0, Math.min(headLevel - 1, STYLES_LIST.length - 2));
      setStylesOffset(desired);
    }
  }, [editorState.headLevel]);

  useEffect(() => {
    const onMouseUp = (event: MouseEvent) => {
      if (!formatPainter.active) return;
      if ((event.target as Element)?.closest("[data-cmd]")) return;
      requestAnimationFrame(() => {
        const editor = app.workspace.activeEditor?.editor;
        const selection = editor?.getSelection();
        formatPainter.clear();
        if (!formatPainter.format || !editor || !selection) return;
        applyFormatPainter(editor, selection, formatPainter.format);
      });
    };

    const workspaceElement = document.querySelector(".workspace") ?? document.body;
    workspaceElement.addEventListener("mouseup", onMouseUp as EventListener, true);
    return () => workspaceElement.removeEventListener("mouseup", onMouseUp as EventListener, true);
  }, [app, formatPainter]);

  return (
    <FormatPainterContext.Provider value={formatPainter}>
      <div className="onr-tab-panel" data-panel="Home">
        <ClipboardGroup />
        <BasicTextGroup editorState={editorState} />
        <StylesGroup
          editorState={editorState}
          stylesOffset={stylesOffset}
          setStylesOffset={setStylesOffset}
        />
        <TagsGroup editorState={editorState} />
        <EmailGroup />
        <NavigateGroup />
      </div>
    </FormatPainterContext.Provider>
  );
}
